const express = require("express")
const necessidadesRoutes = express.Router()
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

const validarNecessidade = [
    body("titulo").trim().notEmpty().withMessage("Título/item é obrigatório").isLength({ max: 120 }),
    body("categoria").trim().notEmpty().withMessage("Categoria é obrigatória"),
]

// GET pública — lista de necessidades para o site
necessidadesRoutes.route("/necessidades").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("necessidades").find({}).sort({ data_criacao: -1 }).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar necessidades:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// GET pública — item único
necessidadesRoutes.route("/necessidades/:id").get(validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("necessidades").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Necessidade não encontrada" })
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao buscar necessidade:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// A partir daqui, todas as rotas exigem perfil de administrador
necessidadesRoutes.route("/necessidades").post(authorize(["Admin", "admin"]), validarNecessidade, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        titulo: req.body.titulo,
        categoria: req.body.categoria,
        quantidade_desejada: req.body.quantidade_desejada || "",
        descricao: req.body.descricao || "",
        imagem: req.body.imagem || "",
        data_criacao: new Date()
    }

    try {
        const result = await db_connect.collection("necessidades").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao criar necessidade:", error)
        res.status(409).json({ mensagem: "Erro ao criar necessidade" })
    }
})

// PUT — atualizar necessidade (admin)
necessidadesRoutes.route("/necessidades/:id").put(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = ["titulo", "categoria", "quantidade_desejada", "descricao", "imagem"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (!updateDoc.titulo || !updateDoc.categoria) {
        return res.status(400).json({ mensagem: "Título e categoria são obrigatórios" })
    }

    try {
        const antigo = await db_connect.collection("necessidades").findOne(myquery)
        if (!antigo) {
            return res.status(404).json({ mensagem: "Necessidade não encontrada" })
        }

        const result = await db_connect.collection("necessidades").updateOne(myquery, { $set: updateDoc })

        if (antigo.imagem && antigo.imagem !== updateDoc.imagem) {
            deletarArquivo(extrairFilename(antigo.imagem))
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar necessidade:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar necessidade" })
    }
})

// DELETE — remover necessidade (admin)
necessidadesRoutes.route("/necessidades/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const antigo = await db_connect.collection("necessidades").findOne(myquery)
        if (antigo && antigo.imagem) {
            deletarArquivo(extrairFilename(antigo.imagem))
        }
        const result = await db_connect.collection("necessidades").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

module.exports = necessidadesRoutes
