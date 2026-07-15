const express = require("express")
const animalRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")

const validarAnimal = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("especie").trim().notEmpty().withMessage("Espécie é obrigatória"),
    body("status").trim().notEmpty().withMessage("Status é obrigatório"),
]

animalRoutes.route("/animal").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const result = await db_connect.collection("animais").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

animalRoutes.route("/animal/:id").get(async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("animais").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Animal não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

animalRoutes.route("/animal/add").post(auth, validarAnimal, async function (req, res) {
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
    }

    try {
        const result = await db_connect.collection("animais").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        res.status(409).json({ mensagem: error.message })
    }
})

animalRoutes.route("/animal/update/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = [
        "nome", "porte", "especie", "raca", "data_nasc",
        "caracteristicas", "data_resgate", "obs", "status",
        "genero", "castracao", "estado_saude", "doencas_pre_ex",
        "pelo", "amputacao", "cor", "ong", "data_adocao", "adotante"
    ]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    const newvalues = { $set: updateDoc }

    try {
        const result = await db_connect.collection("animais").updateOne(myquery, newvalues)
        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Animal não encontrado" })
        }
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao atualizar animal: " + error.message })
    }
})

animalRoutes.route("/animal/:id").delete(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("animais").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar" })
    }
})

module.exports = animalRoutes
