const express = require("express")
const animalRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { authorize } = require("../middleware/auth")
const { validarObjectId } = require("../middleware/objectId")
const fs = require("fs")
const path = require("path")

function extrairFilename(url) {
    if (!url || typeof url !== "string") return null
    const match = url.match(/\/uploads\/(.+)$/)
    return match ? match[1] : null
}

function deletarArquivo(filename) {
    if (!filename) return
    const caminho = path.join(__dirname, "..", "uploads", filename)
    fs.unlink(caminho, () => {})
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

animalRoutes.route("/animal").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("animais").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar animais:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

animalRoutes.route("/animal/:id").get(validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("animais").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Animal não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao buscar animal:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Rota pública: registra o Questionário de Adoção e marca o animal como Adotado
animalRoutes.route("/animal/:id/adotar").post(validarObjectId, validarAdocaoPublica, async function (req, res) {
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

        const newvalues = {
            $set: {
                status: "Adotado",
                adotante: req.body.nome,
                data_adocao: new Date().toISOString().split("T")[0],
                adotante_cpf: req.body.cpf,
                adotante_email: req.body.email,
                adotante_nascimento: req.body.data_nascimento,
                adotante_telefone: req.body.telefone,
                adotante_endereco: {
                    rua: req.body.rua,
                    numero: req.body.numero,
                    bairro: req.body.bairro,
                    cidade: req.body.cidade
                }
            }
        }

        await db_connect.collection("animais").updateOne(myquery, newvalues)
        res.status(200).json({ mensagem: "Adoção registrada com sucesso!" })
    } catch (error) {
        console.error("Erro ao registrar adoção:", error)
        res.status(500).json({ mensagem: "Erro ao registrar adoção" })
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
        fotoUrl: req.body.fotoUrl || "",
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

animalRoutes.route("/animal/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
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

    const newvalues = { $set: updateDoc }

    try {
        const antigo = await db_connect.collection("animais").findOne(myquery)
        if (!antigo) {
            return res.status(404).json({ mensagem: "Animal não encontrado" })
        }

        const result = await db_connect.collection("animais").updateOne(myquery, newvalues)

        const urlsAntigas = new Set(extrairUrls(antigo))
        const urlsNovas = new Set(extrairUrls(updateDoc))

        for (const url of urlsAntigas) {
            if (!urlsNovas.has(url)) {
                deletarArquivo(extrairFilename(url))
            }
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar animal:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar animal" })
    }
})

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
