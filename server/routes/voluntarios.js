const express = require("express")
const voluntariosRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")

const validarVoluntario = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
]

voluntariosRoutes.route("/voluntarios").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("voluntarios").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/:id").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("voluntarios").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Voluntário não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/add").post(auth, validarVoluntario, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()

    const myobj = {
        nome: req.body.nome,
        email: req.body.email,
        ddd: req.body.ddd,
        telefone: req.body.telefone,
        cidade: req.body.cidade,
        estado: req.body.estado
    }

    try {
        const result = await db_connect.collection("voluntarios").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/update/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const newvalues = {
        $set: {
            nome: req.body.nome,
            email: req.body.email,
            ddd: req.body.ddd,
            telefone: req.body.telefone,
            cidade: req.body.cidade,
            estado: req.body.estado
        },
    }

    try {
        const result = await db_connect.collection("voluntarios").updateOne(myquery, newvalues)

        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Voluntário não encontrado" })
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro no update de voluntários:", error)
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/:id").delete(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("voluntarios").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar voluntário" })
    }
})

module.exports = voluntariosRoutes
