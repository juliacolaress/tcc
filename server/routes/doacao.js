const express = require("express")
const doacoesRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { authorize } = require("../middleware/auth")
const { validarObjectId } = require("../middleware/objectId")

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
        const tipo = (req.body.tipo_doacao || "").trim()
        const valorNumerico = parseFloat(valor)

        if (tipo === "Dinheiro" && (isNaN(valorNumerico) || valorNumerico <= 0)) {
            throw new Error("Valor da doação deve ser maior que zero")
        }

        if (valor !== undefined && valor !== "" && !isNaN(valorNumerico) && valorNumerico < 0) {
            throw new Error("Valor da doação não pode ser negativo")
        }

        return true
    }),
]

// Todas as rotas de doações exigem perfil de administrador
doacoesRoutes.route("/doacoes").get(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("doacoes").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar doações:", error)
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

module.exports = doacoesRoutes
