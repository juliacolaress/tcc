const express = require("express")
const relatoriosRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const fs = require("fs")

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

function extrairProtocolo(req) {
    const forwarded = req.headers["x-forwarded-proto"]
    if (forwarded) return forwarded.split(",")[0].trim()
    return req.protocol
}

const storagePdf = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"))
    },
    filename: function (req, file, cb) {
        cb(null, `${crypto.randomUUID()}.pdf`)
    }
})

const uploadPdf = multer({
    storage: storagePdf,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Apenas arquivos PDF são permitidos."))
        }
        cb(null, true)
    },
    limits: { fileSize: 10 * 1024 * 1024 }
})

const validarRelatorio = [
    body("titulo").trim().notEmpty().withMessage("Título é obrigatório").isLength({ max: 120 }),
    body("mesReferencia").trim().notEmpty().withMessage("Mês/ano de referência é obrigatório").matches(/^\d{4}-\d{2}$/).withMessage("Mês/ano deve estar no formato AAAA-MM"),
]

// GET pública — lista de relatórios (mais recentes primeiro)
relatoriosRoutes.route("/relatorios").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("relatorios").find({}).sort({ mesReferencia: -1, criadoEm: -1 }).toArray()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

// GET pública — relatório único
relatoriosRoutes.route("/relatorios/:id").get(async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("relatorios").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Relatório não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

// POST — criar relatório (admin)
relatoriosRoutes.route("/relatorios").post(auth, validarRelatorio, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        titulo: req.body.titulo,
        mesReferencia: req.body.mesReferencia,
        totalArrecadacao: parseFloat(req.body.totalArrecadacao) || 0,
        totalDespesas: parseFloat(req.body.totalDespesas) || 0,
        resumo: req.body.resumo || "",
        balanceteUrl: req.body.balanceteUrl || "",
        criadoEm: new Date()
    }

    try {
        const result = await db_connect.collection("relatorios").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

// PUT — atualizar relatório (admin)
relatoriosRoutes.route("/relatorios/:id").put(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = ["titulo", "mesReferencia", "totalArrecadacao", "totalDespesas", "resumo", "balanceteUrl"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (updateDoc.totalArrecadacao !== undefined) updateDoc.totalArrecadacao = parseFloat(updateDoc.totalArrecadacao) || 0
    if (updateDoc.totalDespesas !== undefined) updateDoc.totalDespesas = parseFloat(updateDoc.totalDespesas) || 0

    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    updateDoc.atualizadoEm = new Date()

    try {
        const antigo = await db_connect.collection("relatorios").findOne(myquery)
        if (!antigo) {
            return res.status(404).json({ mensagem: "Relatório não encontrado" })
        }

        await db_connect.collection("relatorios").updateOne(myquery, { $set: updateDoc })

        if (antigo.balanceteUrl && updateDoc.balanceteUrl !== undefined && antigo.balanceteUrl !== updateDoc.balanceteUrl) {
            deletarArquivo(extrairFilename(antigo.balanceteUrl))
        }

        res.status(200).json({ mensagem: "Relatório atualizado com sucesso" })
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao atualizar relatório: " + error.message })
    }
})

// DELETE — remover relatório (admin)
relatoriosRoutes.route("/relatorios/:id").delete(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const antigo = await db_connect.collection("relatorios").findOne(myquery)
        if (antigo && antigo.balanceteUrl) {
            deletarArquivo(extrairFilename(antigo.balanceteUrl))
        }
        const result = await db_connect.collection("relatorios").deleteOne(myquery)
        if (result.deletedCount === 0) {
            return res.status(404).json({ mensagem: "Relatório não encontrado" })
        }
        res.status(200).json({ mensagem: "Relatório excluído com sucesso" })
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar relatório" })
    }
})

// POST — upload do balancete em PDF (admin)
relatoriosRoutes.route("/relatorios/upload-balancete").post(auth, uploadPdf.single("arquivo"), async function (req, res) {
    if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." })
    }

    const protocolo = extrairProtocolo(req)
    const url = `${protocolo}://${req.get("host")}/uploads/${req.file.filename}`
    res.status(201).json({ url, filename: req.file.filename })
})

relatoriosRoutes.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ mensagem: "Arquivo excede o limite de 10MB." })
        }
        return res.status(400).json({ mensagem: `Erro no upload: ${err.message}` })
    }
    if (err) {
        return res.status(400).json({ mensagem: err.message })
    }
    next()
})

module.exports = relatoriosRoutes
