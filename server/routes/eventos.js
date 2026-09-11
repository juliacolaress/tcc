const express = require("express")
const eventoRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth, authorize } = require("../middleware/auth")
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

// GET pública — eventos agendados para o site
eventoRoutes.route("/eventos").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect
            .collection("eventos")
            .find({ status: "Agendado" })
            .sort({ data: 1, horario: 1 })
            .toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar eventos públicos:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// GET admin — todos os eventos (para o painel administrativo)
eventoRoutes.route("/eventos/admin").get(auth, authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("eventos").find({}).sort({ data: -1 }).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar eventos:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// GET pública — evento único
eventoRoutes.route("/eventos/:id").get(validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("eventos").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Evento não encontrado" })
        res.status(200).json(result)
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
