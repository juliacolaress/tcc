const express = require("express")
const doacoesRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { authorize } = require("../middleware/auth")
const { validarObjectId } = require("../middleware/objectId")
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const fs = require("fs")

const STATUS_VALIDOS = ["Pendente", "Confirmado", "Entregue", "Cancelado"]

const storageComprovante = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"))
    },
    filename: function (req, file, cb) {
        const extensao = path.extname(file.originalname).toLowerCase()
        const nome = `comprovante-${crypto.randomUUID()}${extensao}`
        cb(null, nome)
    }
})

const fileFilterComprovante = (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp|pdf/
    const extensaoValida = permitidos.test(path.extname(file.originalname).toLowerCase())
    const mimetypeValido = permitidos.test(file.mimetype)

    if (!extensaoValida || !mimetypeValido) {
        return cb(new Error("O comprovante deve ser uma imagem (jpeg, png, gif, webp) ou PDF."))
    }

    cb(null, true)
}

const uploadComprovante = multer({
    storage: storageComprovante,
    fileFilter: fileFilterComprovante,
    limits: { fileSize: 5 * 1024 * 1024 }
})

const validarDoacao = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório"),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
    body("tipo_doacao").trim().notEmpty().withMessage("Tipo de doação é obrigatório"),
    body("categoria").optional().isIn(["financeira", "material"]).withMessage("Categoria deve ser 'financeira' ou 'material'"),
]

function normalizarCategoria(req) {
    const categoria = (req.body.categoria || "").trim()
    if (categoria === "financeira" || categoria === "material") return categoria
    return (req.body.tipo_doacao || "").trim() === "Dinheiro" ? "financeira" : "material"
}

const validarValorDoacao = [
    body("valor").custom((valor, { req }) => {
        if (valor === undefined || valor === "") {
            return true
        }

        const tipo = (req.body.tipo_doacao || "").trim()
        const categoria = (req.body.categoria || "").trim()

        if (tipo.toLowerCase() === "dinheiro" || categoria === "financeira") {
            const valorNumerico = parseFloat(valor)
            if (isNaN(valorNumerico) || valorNumerico <= 0) {
                throw new Error("Valor da doação deve ser maior que zero")
            }
        }

        return true
    }),
]

// Todas as rotas de doações exigem perfil de administrador
doacoesRoutes.route("/doacoes").get(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("doacoes").find({}).sort({ data_criacao: -1 }).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar doações:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// Atualiza o status da doação (Pendente / Confirmado / Entregue / Cancelado)
doacoesRoutes.route("/doacao/:id/status").patch(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const status = (req.body.status || "").trim()
    if (!status || !STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({ mensagem: `Status deve ser um dos valores: ${STATUS_VALIDOS.join(", ")}.` })
    }

    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("doacoes").findOneAndUpdate(
            myquery,
            { $set: { status } },
            { returnDocument: "after" }
        )
        if (!result) {
            return res.status(404).json({ mensagem: "Doação não encontrada" })
        }
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar status:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

doacoesRoutes.route("/doacao/:id").get(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("doacoes").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Doação não encontrada" })
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao buscar doação:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

doacoesRoutes.route("/doacao/add").post(authorize(["Admin", "admin"]), validarDoacao, validarValorDoacao, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        email: req.body.email,
        nome: req.body.nome,
        telefone: req.body.telefone,
        cidade: req.body.cidade,
        estado: req.body.estado,
        tipo_doacao: req.body.tipo_doacao,
        categoria: normalizarCategoria(req),
        forma_pagamento: req.body.forma_pagamento || "",
        item: req.body.item,
        quantidade: req.body.quantidade || "",
        valor: parseFloat(req.body.valor) || 0,
        forma_entrega: req.body.forma_entrega,
        comprovante: req.body.comprovante || "",
        status: req.body.status && STATUS_VALIDOS.includes(req.body.status) ? req.body.status : "Pendente",
        data_criacao: new Date()
    }

    try {
        const result = await db_connect.collection("doacoes").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao criar doação:", error)
        res.status(409).json({ mensagem: "Erro ao criar doação" })
    }
})

// Doação pública: qualquer visitante pode enviar (multipart com comprovante opcional)
doacoesRoutes.route("/doacao/publica").post(uploadComprovante.single("comprovante"), async function (req, res) {
    if (!req.body.nome || !req.body.email) {
        if (req.file) fs.unlink(req.file.path, () => {})
        return res.status(400).json({ mensagem: "Nome e e-mail do doador são obrigatórios." })
    }

    const categoria = (req.body.categoria || "").trim()
    if (categoria !== "financeira" && categoria !== "material") {
        if (req.file) fs.unlink(req.file.path, () => {})
        return res.status(400).json({ mensagem: "Categoria deve ser 'financeira' ou 'material'." })
    }

    if (categoria === "financeira") {
        const valor = parseFloat(req.body.valor)
        if (isNaN(valor) || valor <= 0) {
            if (req.file) fs.unlink(req.file.path, () => {})
            return res.status(400).json({ mensagem: "Valor da doação deve ser maior que zero." })
        }
    }

    const tele = `${req.body.ddd || ""}${req.body.telefone || ""}`

    const db_connect = dbo.getDb()
    const myobj = {
        email: req.body.email,
        nome: req.body.nome,
        telefone: tele,
        cidade: req.body.cidade || "",
        estado: req.body.estado || "",
        tipo_doacao: categoria === "financeira" ? "Dinheiro" : (req.body.tipo_doacao || "Material"),
        categoria: categoria,
        forma_pagamento: categoria === "financeira" ? (req.body.forma_pagamento || "Pix") : "",
        item: categoria === "material" ? (req.body.item || "") : "",
        quantidade: categoria === "material" ? (req.body.quantidade || "") : "",
        valor: categoria === "financeira" ? parseFloat(req.body.valor) : 0,
        forma_entrega: categoria === "material" ? (req.body.forma_entrega || "") : "",
        comprovante: req.file ? `/uploads/${req.file.filename}` : "",
        status: "Pendente",
        origem: "publica",
        data_criacao: new Date()
    }

    try {
        const result = await db_connect.collection("doacoes").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao criar doação pública:", error)
        if (req.file) fs.unlink(req.file.path, () => {})
        res.status(409).json({ mensagem: "Erro ao criar doação" })
    }
})

doacoesRoutes.route("/doacao/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("doacoes").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

doacoesRoutes.route("/doacao/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, validarValorDoacao, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = ["nome", "tipo_doacao", "forma_pagamento", "item", "quantidade", "email", "telefone", "cidade", "estado", "forma_entrega"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (req.body.valor !== undefined) {
        updateDoc.valor = parseFloat(req.body.valor) || 0
    }

    if (req.body.categoria !== undefined || req.body.tipo_doacao !== undefined) {
        updateDoc.categoria = normalizarCategoria(req)
    }

    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    try {
        const result = await db_connect.collection("doacoes").updateOne(myquery, { $set: updateDoc })

        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Doação não encontrada" })
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro no update:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

doacoesRoutes.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ mensagem: "Arquivo excede o limite de 5MB." })
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ mensagem: "Campo de arquivo inesperado." })
        }
        return res.status(400).json({ mensagem: `Erro no upload: ${err.message}` })
    }
    if (err) {
        return res.status(400).json({ mensagem: err.message })
    }
    next()
})

module.exports = doacoesRoutes
