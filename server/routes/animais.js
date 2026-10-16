const express = require("express")
const animalRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { authorize, authOpcional, ehAdmin } = require("../middleware/auth")
const { validarObjectId } = require("../middleware/objectId")
const { writeLimiter } = require("../middleware/rateLimiters")
const { extrairFilename, deletarArquivo } = require("../utils/arquivos")

// Imagem fictícia padrão (servida pelo frontend em client/public)
const FOTO_PADRAO = "/placeholder-padrao.svg"

// Status possíveis de uma solicitação de adoção (Caixa de Entrada)
const STATUS_SOLICITACAO_VALIDOS = ["Pendente", "Aprovada", "Rejeitada"]

// Projeção pública: remove os dados pessoais do adotante de animais já adotados.
// Aplica-se apenas a visitantes anônimos (authOpcional + ehAdmin libera para admin).
const SEM_PII_ADOTANTE = {
    adotante: 0,
    adotante_cpf: 0,
    adotante_email: 0,
    adotante_telefone: 0,
    adotante_nascimento: 0,
    adotante_endereco: 0,
}

function extrairUrls(animal) {
    const urls = []
    if (animal.fotoUrl) urls.push(animal.fotoUrl)
    if (Array.isArray(animal.fotos)) urls.push(...animal.fotos)
    return urls.filter(Boolean)
}

const validarAnimal = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("especie").trim().notEmpty().withMessage("Espécie é obrigatória"),
    body("status").trim().notEmpty().withMessage("Status é obrigatório"),
]

const validarAdocaoPublica = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório"),
    body("email").trim().notEmpty().isEmail().withMessage("E-mail inválido"),
    body("data_nascimento").trim().notEmpty().withMessage("Data de nascimento é obrigatória"),
    body("telefone").trim().notEmpty().withMessage("Telefone é obrigatório"),
    body("cpf").trim().notEmpty().withMessage("CPF é obrigatório"),
    body("rua").trim().notEmpty().withMessage("Rua é obrigatória"),
    body("numero").trim().notEmpty().withMessage("Número é obrigatório"),
    body("bairro").trim().notEmpty().withMessage("Bairro é obrigatório"),
    body("cidade").trim().notEmpty().withMessage("Cidade é obrigatória"),
]

animalRoutes.route("/animal").get(authOpcional, async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const projection = ehAdmin(req) ? {} : SEM_PII_ADOTANTE
        const result = await db_connect.collection("animais").find({}, { projection }).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar animais:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

animalRoutes.route("/animal/:id").get(authOpcional, validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const projection = ehAdmin(req) ? {} : SEM_PII_ADOTANTE
        const result = await db_connect.collection("animais").findOne(myquery, { projection })
        if (!result) return res.status(404).json({ mensagem: "Animal não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao buscar animal:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Histórico de Adoções: retorna o documento COMPLETO de cada animal adotado
// (nome, especie, raca, genero, porte, fotoUrl, fotos + adotante, data_adocao).
// Não há Model/referência separada: animal e dados de adoção vivem no mesmo
// documento da coleção "animais", então nenhuma propriedade vem nula por JOIN.
animalRoutes.route("/adocoes").get(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const docs = await db_connect.collection("animais")
            .find({ status: "Adotado" })
            .sort({ data_adocao: -1 })
            .toArray()

        // Tratamento defensivo: documentos legados/corrompidos (campos ausentes,
        // fotos inválidas ou animais já devolvidos ao abrigo que perderam o status)
        // não podem quebrar a API — recebem valores padrão.
        const result = docs
            .filter((doc) => doc && doc._id)
            .map((doc) => ({
                ...doc,
                nome: typeof doc.nome === "string" && doc.nome.trim() ? doc.nome : "Animal não identificado",
                especie: typeof doc.especie === "string" ? doc.especie : "",
                raca: typeof doc.raca === "string" ? doc.raca : "",
                genero: typeof doc.genero === "string" ? doc.genero : "",
                porte: typeof doc.porte === "string" ? doc.porte : "",
                fotoUrl: typeof doc.fotoUrl === "string" ? doc.fotoUrl : "",
                fotos: Array.isArray(doc.fotos) ? doc.fotos.filter((f) => typeof f === "string" && f) : [],
                adotante: typeof doc.adotante === "string" && doc.adotante.trim() ? doc.adotante : "Não informado",
                data_adocao: doc.data_adocao || null
            }))

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar histórico de adoções:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Rota pública: registra a solicitação de adoção (Questionário).
// Não altera o status do animal: ele permanece "Disponível" e na listagem pública.
// A mudança para "Adotado" só ocorre após aprovação manual no painel administrativo.
animalRoutes.route("/animal/:id/adotar").post(writeLimiter, validarObjectId, validarAdocaoPublica, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    try {
        const animal = await db_connect.collection("animais").findOne(myquery)
        if (!animal) {
            return res.status(404).json({ mensagem: "Animal não encontrado" })
        }
        if (animal.status === "Adotado") {
            return res.status(409).json({ mensagem: "Este animal já foi adotado." })
        }

        const solicitacao = {
            animal_id: animal._id,
            animal_nome: animal.nome,
            status: "Pendente",
            data_solicitacao: new Date().toISOString(),
            solicitante: {
                nome: req.body.nome,
                cpf: req.body.cpf,
                email: req.body.email,
                data_nascimento: req.body.data_nascimento,
                telefone: req.body.telefone,
                endereco: {
                    rua: req.body.rua,
                    numero: req.body.numero,
                    bairro: req.body.bairro,
                    cidade: req.body.cidade
                }
            }
        }

        await db_connect.collection("solicitacoes_adocao").insertOne(solicitacao)
        res.status(201).json({ mensagem: "Solicitação de adoção registrada com sucesso! Nossa equipe entrará em contato." })
    } catch (error) {
        console.error("Erro ao registrar solicitação de adoção:", error)
        res.status(500).json({ mensagem: "Erro ao registrar solicitação de adoção" })
    }
})

// Caixa de Entrada: lista todas as solicitações de adoção (sem filtros de usuário/ID —
// apenas exigência de perfil admin). O driver nativo do MongoDB não possui .populate():
// o "join" manual abaixo anexa o documento completo do animal em cada solicitação
// (campo `animal`), garantindo nome, especie, raca, genero, porte, fotoUrl e fotos.
animalRoutes.route("/solicitacoes-adocao").get(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const solicitacoes = await db_connect.collection("solicitacoes_adocao")
            .find({})
            .sort({ data_solicitacao: -1 })
            .toArray()

        const animalIds = solicitacoes
            .map((s) => s.animal_id)
            .filter((id) => id instanceof ObjectId)

        const animais = animalIds.length > 0
            ? await db_connect.collection("animais").find({ _id: { $in: animalIds } }).toArray()
            : []
        const animaisPorId = new Map(animais.map((a) => [String(a._id), a]))

        const result = solicitacoes.map((s) => ({
            ...s,
            animal: animaisPorId.get(String(s.animal_id)) || null
        }))

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar solicitações de adoção:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Caixa de Entrada: aprovar (marca o animal como Adotado) ou rejeitar uma solicitação
animalRoutes.route("/solicitacao-adocao/:id/status").patch(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const novoStatus = req.body.status
    if (!STATUS_SOLICITACAO_VALIDOS.includes(novoStatus) || novoStatus === "Pendente") {
        return res.status(400).json({ mensagem: "Status inválido" })
    }

    const db_connect = dbo.getDb()
    const solicitacoes = db_connect.collection("solicitacoes_adocao")
    const solicitacaoId = { _id: new ObjectId(req.params.id) }

    try {
        const solicitacao = await solicitacoes.findOne(solicitacaoId)
        if (!solicitacao) {
            return res.status(404).json({ mensagem: "Solicitação não encontrada" })
        }
        if (solicitacao.status !== "Pendente") {
            return res.status(409).json({ mensagem: "Esta solicitação já foi processada." })
        }

        if (novoStatus === "Aprovada") {
            // Registro legado/corrompido sem referência de animal: responde 400 sem quebrar
            if (!(solicitacao.animal_id instanceof ObjectId)) {
                return res.status(400).json({ mensagem: "Solicitação sem referência de animal válida." })
            }

            const animalQuery = { _id: solicitacao.animal_id }
            const animal = await db_connect.collection("animais").findOne(animalQuery)
            if (!animal) {
                return res.status(404).json({ mensagem: "Animal não encontrado" })
            }
            if (animal.status === "Adotado") {
                return res.status(409).json({ mensagem: "Este animal já foi adotado." })
            }

            // Dados do solicitante com fallbacks (nunca lança exceção em doc legado)
            const solicitante = solicitacao.solicitante || {}

            // Marca o animal como Adotado sem tocar em fotoUrl/fotos
            await db_connect.collection("animais").updateOne(animalQuery, {
                $set: {
                    status: "Adotado",
                    adotante: solicitante.nome || "Não informado",
                    data_adocao: new Date().toISOString().split("T")[0],
                    adotante_cpf: solicitante.cpf || "",
                    adotante_email: solicitante.email || "",
                    adotante_nascimento: solicitante.data_nascimento || "",
                    adotante_telefone: solicitante.telefone || "",
                    adotante_endereco: solicitante.endereco || null
                }
            })
        }

        await solicitacoes.updateOne(solicitacaoId, {
            $set: { status: novoStatus, data_resposta: new Date().toISOString() }
        })

        const mensagem = novoStatus === "Aprovada"
            ? "Solicitação aprovada! O animal foi marcado como Adotado."
            : "Solicitação rejeitada."
        res.status(200).json({ mensagem })
    } catch (error) {
        console.error("Erro ao processar solicitação de adoção:", error)
        res.status(500).json({ mensagem: "Erro ao processar solicitação" })
    }
})

// A partir daqui, todas as rotas exigem perfil de administrador
animalRoutes.route("/animal/add").post(authorize(["Admin", "admin"]), validarAnimal, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        nome: req.body.nome,
        porte: req.body.porte,
        especie: req.body.especie,
        raca: req.body.raca,
        data_nasc: req.body.data_nasc,
        caracteristicas: req.body.caracteristicas,
        data_resgate: req.body.data_resgate,
        obs: req.body.obs,
        status: req.body.status,
        genero: req.body.genero,
        castracao: req.body.castracao,
        estado_saude: req.body.estado_saude,
        doencas_pre_ex: req.body.doencas_pre_ex,
        pelo: req.body.pelo,
        amputacao: req.body.amputacao,
        cor: req.body.cor,
        ong: req.body.ong,
        fotoUrl: req.body.fotoUrl || FOTO_PADRAO,
        fotos: req.body.fotos || [],
    }

    try {
        const result = await db_connect.collection("animais").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao criar animal:", error)
        res.status(409).json({ mensagem: "Erro ao criar animal" })
    }
})

// Atualização genérica do animal (POST legado e PUT REST), válida para animais
// abrigados, adotados ou em qualquer outro status. Update PARCIAL via whitelist:
// só grava campos enviados, preservando fotoUrl/fotos/status/adotante quando ausentes.
async function atualizarAnimal(req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = [
        "nome", "porte", "especie", "raca", "data_nasc",
        "caracteristicas", "data_resgate", "obs", "status",
        "genero", "castracao", "estado_saude", "doencas_pre_ex",
        "pelo", "amputacao", "cor", "ong", "data_adocao", "adotante",
        "fotoUrl", "fotos"
    ]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    // Sem foto enviada (ou upload falhou): usa a imagem fictícia padrão
    if (updateDoc.fotoUrl !== undefined && !String(updateDoc.fotoUrl || "").trim()) {
        updateDoc.fotoUrl = Array.isArray(updateDoc.fotos) && updateDoc.fotos[0]
            ? updateDoc.fotos[0]
            : FOTO_PADRAO
    }

    const newvalues = { $set: updateDoc }

    try {
        const antigo = await db_connect.collection("animais").findOne(myquery)
        if (!antigo) {
            return res.status(404).json({ mensagem: "Animal não encontrado" })
        }

        const result = await db_connect.collection("animais").updateOne(myquery, newvalues)

        // Remove arquivos antigos do disco SOMENTE quando o update realmente
        // altera fotoUrl/fotos. Atualizações que só mudam status/obs/adotante
        // (ex: devolução do animal ao abrigo) preservam as imagens intactas.
        if (updateDoc.fotoUrl !== undefined || updateDoc.fotos !== undefined) {
            const urlsAntigas = new Set(extrairUrls(antigo))
            const urlsNovas = new Set(extrairUrls(updateDoc))

            for (const url of urlsAntigas) {
                if (!urlsNovas.has(url)) {
                    deletarArquivo(extrairFilename(url))
                }
            }
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar animal:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar animal" })
    }
}

animalRoutes.route("/animal/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, atualizarAnimal)

// Alias REST: PUT /animal/:id — mesma lógica genérica de atualização parcial
animalRoutes.route("/animal/:id").put(authorize(["Admin", "admin"]), validarObjectId, atualizarAnimal)

animalRoutes.route("/animal/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const animal = await db_connect.collection("animais").findOne(myquery)
        if (animal) {
            const urls = extrairUrls(animal)
            urls.forEach(url => deletarArquivo(extrairFilename(url)))
        }
        const result = await db_connect.collection("animais").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

module.exports = animalRoutes
