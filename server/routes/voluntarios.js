const express = require("express")
const voluntariosRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")

const validarVoluntario = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
    body("interesses").optional().isArray().withMessage("Interesses deve ser uma lista"),
    body("disponibilidade").optional().isArray().withMessage("Disponibilidade deve ser uma lista"),
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
        estado: req.body.estado,
        interesses: Array.isArray(req.body.interesses) ? req.body.interesses : [],
        disponibilidade: Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : [],
        observacoes: (req.body.observacoes || "").trim(),
        status: "Ativo",
        origem: "Admin",
        criadoEm: new Date()
    }

    try {
        const result = await db_connect.collection("voluntarios").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao cadastrar voluntário:", error)
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/public/add").post(validarVoluntario, async function (req, res) {
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
        estado: req.body.estado,
        interesses: Array.isArray(req.body.interesses) ? req.body.interesses : [],
        disponibilidade: Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : [],
        observacoes: (req.body.observacoes || "").trim(),
        status: "Pendente",
        origem: "Publico",
        criadoEm: new Date()
    }

    try {
        const result = await db_connect.collection("voluntarios").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        console.error("Erro ao cadastrar voluntário público:", error)
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/status/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    const status = req.body.status

    if (!["Pendente", "Aprovado", "Rejeitado"].includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido. Use Pendente, Aprovado ou Rejeitado." })
    }

    try {
        const result = await db_connect.collection("voluntarios").updateOne(myquery, { $set: { status } })

        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Voluntário não encontrado" })
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao atualizar status do voluntário:", error)
        res.status(500).json({ mensagem: error.message })
    }
})

voluntariosRoutes.route("/voluntario/update/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const updateDoc = {}

    const campos = ["nome", "email", "ddd", "telefone", "cidade", "estado"]
    campos.forEach(campo => {
        if (req.body[campo] !== undefined) {
            updateDoc[campo] = req.body[campo]
        }
    })

    if (req.body.observacoes !== undefined) {
        updateDoc.observacoes = (req.body.observacoes || "").trim()
    }

    if (req.body.interesses !== undefined) {
        updateDoc.interesses = Array.isArray(req.body.interesses) ? req.body.interesses : []
    }

    if (req.body.disponibilidade !== undefined) {
        updateDoc.disponibilidade = Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : []
    }

    if (req.body.status !== undefined) {
        updateDoc.status = req.body.status
    }

    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    try {
        const result = await db_connect.collection("voluntarios").updateOne(myquery, { $set: updateDoc })

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
