const express = require("express")
const doacoesRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")

const validarDoacao = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório"),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
    body("tipo_doacao").trim().notEmpty().withMessage("Tipo de doação é obrigatório"),
]

doacoesRoutes.route("/doacoes").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("doacoes").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

doacoesRoutes.route("/doacao/:id").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("doacoes").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Doação não encontrada" })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

doacoesRoutes.route("/doacao/add").post(auth, validarDoacao, async function (req, res) {
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
        item: req.body.item,
        valor: parseFloat(req.body.valor) || 0,
        forma_entrega: req.body.forma_entrega
    }

    try {
        const result = await db_connect.collection("doacoes").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        res.status(409).json({ mensagem: error.message })
    }
})

doacoesRoutes.route("/doacao/:id").delete(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("doacoes").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

doacoesRoutes.route("/doacao/update/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const newvalues = {
        $set: {
            nome: req.body.nome,
            tipo_doacao: req.body.tipo_doacao,
            item: req.body.item,
            valor: parseFloat(req.body.valor) || 0,
            email: req.body.email,
            telefone: req.body.telefone,
            cidade: req.body.cidade,
            estado: req.body.estado,
            forma_entrega: req.body.forma_entrega
        },
    }

    try {
        const result = await db_connect.collection("doacoes").updateOne(myquery, newvalues)

        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Doação não encontrada" })
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro no update:", error)
        res.status(500).json({ mensagem: error.message })
    }
})

module.exports = doacoesRoutes
