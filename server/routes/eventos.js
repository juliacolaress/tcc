const express = require("express")
const eventoRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth, authorize } = require("../middleware/auth")
const { validarObjectId } = require("../middleware/objectId")
const { extrairFilename, deletarArquivo } = require("../utils/arquivos")

// Converte "DD/MM/YYYY" ou "YYYY-MM-DD" para uma data válida (BSON Date).
// Usa a meia-noite local para evitar o deslocamento de dia por fuso horário.
function normalizarData(valor) {
    if (!valor) return ""
    let texto = String(valor).trim()
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const [dia, mes, ano] = texto.split("/")
        texto = `${ano}-${mes}-${dia}`
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto
    }
    const [ano, mes, dia] = texto.split("-")
    return new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10))
}

const validarEvento = [
    body("titulo").trim().notEmpty().withMessage("Título é obrigatório").isLength({ max: 150 }),
    body("data").trim().notEmpty().withMessage("Data é obrigatória"),
    body("status").trim().notEmpty().withMessage("Status é obrigatório"),
]

// Fim teórico do evento (data + horario); null quando a data é inválida
function fimDoEvento(evento) {
    if (!evento || !evento.data) return null
    const base = evento.data instanceof Date
        ? evento.data
        : normalizarData(evento.data)
    if (!(base instanceof Date) || isNaN(base.getTime())) return null

    const fim = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999)
    const horario = String(evento.horario || "").match(/(\d{1,2})[:h](\d{2})/)
    if (horario) {
        const h = parseInt(horario[1], 10)
        const min = parseInt(horario[2], 10)
        if (h <= 23 && min <= 59) {
            fim.setHours(h, min, 0, 0)
        }
    }
    return fim
}

function estaConcluido(evento) {
    const fim = fimDoEvento(evento)
    return fim !== null && fim.getTime() < Date.now()
}

// Status dinâmico: eventos "Agendado" cuja data/horário já passaram são
// devolvidos como "Concluído" e marcados para persistência no banco.
// Eventos "Cancelado" nunca são alterados. Usa o enum do projeto ("Concluído").
function aplicarStatusDinamico(eventos) {
    const idsParaAtualizar = []
    const resultado = (Array.isArray(eventos) ? eventos : []).map((evento) => {
        if (!evento || evento.status === "Cancelado" || evento.status === "Concluído") {
            return evento
        }
        if (estaConcluido(evento)) {
            idsParaAtualizar.push(evento._id)
            return { ...evento, status: "Concluído" }
        }
        return evento
    })
    return { resultado, idsParaAtualizar }
}

// Persistência best-effort: falha ao gravar o status nunca derruba a requisição
async function persistirStatusDinamico(db_connect, ids) {
    if (!ids || ids.length === 0) return
    try {
        await db_connect.collection("eventos").updateMany(
            { _id: { $in: ids } },
            { $set: { status: "Concluído" } }
        )
    } catch (error) {
        console.error("Erro ao atualizar status dinâmico dos eventos:", error)
    }
}

// GET pública — eventos agendados e já concluídos (histórico) para o site.
// Rota GET é somente leitura: o status "Concluído" é computado em memória.
// A persistência acontece na listagem administrativa (efeito colateral só para admin).
eventoRoutes.route("/eventos").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const docs = await db_connect
            .collection("eventos")
            .find({ status: { $in: ["Agendado", "Concluído"] } })
            .sort({ data: 1, horario: 1 })
            .toArray()

        const { resultado } = aplicarStatusDinamico(docs)

        res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao listar eventos públicos:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// GET admin — todos os eventos (para o painel administrativo)
eventoRoutes.route("/eventos/admin").get(auth, authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const docs = await db_connect.collection("eventos").find({}).sort({ data: -1 }).toArray()

        const { resultado, idsParaAtualizar } = aplicarStatusDinamico(docs)
        await persistirStatusDinamico(db_connect, idsParaAtualizar)

        res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao listar eventos:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// GET pública — evento único (somente leitura, status computado em memória)
eventoRoutes.route("/eventos/:id").get(validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const doc = await db_connect.collection("eventos").findOne(myquery)
        if (!doc) return res.status(404).json({ mensagem: "Evento não encontrado" })

        const { resultado } = aplicarStatusDinamico([doc])

        res.status(200).json(resultado[0])
    } catch (error) {
        console.error("Erro ao buscar evento:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Rotas administrativas exigem perfil de administrador
eventoRoutes.route("/eventos").post(authorize(["Admin", "admin"]), validarEvento, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        titulo: req.body.titulo,
        descricao: (req.body.descricao || "").trim(),
        objetivos: (req.body.objetivos || "").trim(),
        data: normalizarData(req.body.data),
        horario: (req.body.horario || "").trim(),
        local: (req.body.local || "").trim(),
        imagem: (req.body.imagem || "").trim(),
        status: req.body.status,
        data_criacao: new Date()
    }

    try {
        const result = await db_connect.collection("eventos").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao cadastrar evento:", error)
        res.status(500).json({ mensagem: "Erro ao cadastrar evento" })
    }
})

// PUT — atualizar evento (admin)
eventoRoutes.route("/eventos/:id").put(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = ["titulo", "descricao", "objetivos", "data", "horario", "local", "imagem", "status"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (updateDoc.data !== undefined) {
        updateDoc.data = normalizarData(updateDoc.data)
    }
    if (updateDoc.objetivos !== undefined) {
        updateDoc.objetivos = String(updateDoc.objetivos).trim()
    }

    if (!updateDoc.titulo || !updateDoc.data || !updateDoc.status) {
        return res.status(400).json({ mensagem: "Título, data e status são obrigatórios" })
    }

    try {
        const antigo = await db_connect.collection("eventos").findOne(myquery)
        if (!antigo) {
            return res.status(404).json({ mensagem: "Evento não encontrado" })
        }

        const result = await db_connect.collection("eventos").updateOne(myquery, { $set: updateDoc })

        if (antigo.imagem && antigo.imagem !== updateDoc.imagem) {
            deletarArquivo(extrairFilename(antigo.imagem))
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar evento:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar evento" })
    }
})

// DELETE — remover evento (admin)
eventoRoutes.route("/eventos/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const antigo = await db_connect.collection("eventos").findOne(myquery)
        if (antigo && antigo.imagem) {
            deletarArquivo(extrairFilename(antigo.imagem))
        }
        const result = await db_connect.collection("eventos").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao excluir evento:", error)
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

module.exports = eventoRoutes
