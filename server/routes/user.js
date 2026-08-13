const express = require("express")
const userRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET não definido nas variáveis de ambiente.")
    process.exit(1)
}

const validarCadastro = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
    body("senha").isLength({ min: 6 }).withMessage("Senha deve ter no mínimo 6 caracteres"),
]

const validarLogin = [
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail(),
    body("senha").notEmpty().withMessage("Senha é obrigatória"),
]

userRoutes.route("/user/login").post(validarLogin, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()
    const { email, senha } = req.body

    try {
        const usuario = await db_connect.collection("users").findOne({ email })

        if (!usuario) {
            return res.status(400).json({ mensagem: "Usuário não encontrado" })
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!senhaValida) {
            return res.status(400).json({ mensagem: "Senha incorreta" })
        }

        const token = jwt.sign(
            { userId: usuario._id, tipo: usuario.function },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({ mensagem: "Login bem-sucedido", token })
    } catch (erro) {
        console.error(erro)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

userRoutes.route("/user/register").post(validarCadastro, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()
    const { nome, email, senha } = req.body

    try {
        const userExistente = await db_connect.collection("users").findOne({ email })

        if (userExistente) {
            return res.status(400).json({ mensagem: "Usuário já cadastrado" })
        }

        const salt = await bcrypt.genSalt(10)
        const senhaHash = await bcrypt.hash(senha, salt)
        const novoUsuario = {
            name: nome,
            email,
            senha: senhaHash,
            function: "User",
        }

        const result = await db_connect.collection("users").insertOne(novoUsuario)

        const token = jwt.sign(
            { userId: result.insertedId, tipo: "User" },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", token })
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error)
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário" })
    }
})

userRoutes.route("/user").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()

    try {
        const result = await db_connect.collection("users").find({}).toArray()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

userRoutes.route("/user/:id").get(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("users").findOne(myquery)
        if (!result) return res.status(404).json({ mensagem: "Usuário não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

userRoutes.route("/user/add").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myobj = {
        name: req.body.name,
        user: req.body.user,
        email: req.body.email,
        function: "User"
    }
    try {
        const result = await db_connect.collection("users").insertOne(myobj)
        res.status(201).json(result)
    } catch (error) {
        res.status(409).json({ mensagem: error.message })
    }
})

userRoutes.route("/user/update/:id").post(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    const fields = ["name", "user", "email", "function"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    try {
        const result = await db_connect.collection("users").updateOne(myquery, { $set: updateDoc })
        res.status(200).json(result)
    } catch (error) {
        res.status(409).json({ mensagem: error.message })
    }
})

userRoutes.route("/user/:id").delete(auth, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("users").deleteOne(myquery)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar usuário" })
    }
})

module.exports = userRoutes
