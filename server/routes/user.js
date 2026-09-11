const express = require("express")
const userRoutes = express.Router()
const dbo = require("../db/conn")
const ObjectId = require("mongodb").ObjectId
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { body, validationResult } = require("express-validator")
const { authorize } = require("../middleware/auth")
const { authLimiter } = require("../middleware/rateLimiters")
const { validarObjectId } = require("../middleware/objectId")

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET não definido nas variáveis de ambiente.")
    process.exit(1)
}

const validarCadastro = [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 100 }),
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido"),
    body("senha").isLength({ min: 8 }).withMessage("Senha deve ter no mínimo 8 caracteres"),
]

const validarLogin = [
    body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail(),
    body("senha").notEmpty().withMessage("Senha é obrigatória"),
]

// Projeção: nunca devolver o hash da senha para o cliente
const SEM_SENHA = { senha: 0 }

userRoutes.route("/user/login").post(authLimiter, validarLogin, async function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensagem: errors.array()[0].msg })
    }

    const db_connect = dbo.getDb()
    const { email, senha } = req.body

    try {
        const usuario = await db_connect.collection("users").findOne({ email })

        // Mensagem genérica para não permitir enumeração de contas
        if (!usuario) {
            return res.status(400).json({ mensagem: "E-mail ou senha inválidos" })
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!senhaValida) {
            return res.status(400).json({ mensagem: "E-mail ou senha inválidos" })
        }

        const token = jwt.sign(
            { userId: usuario._id, tipo: usuario.function },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({ mensagem: "Login bem-sucedido", token, tipo: usuario.function })
    } catch (erro) {
        console.error(erro)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

userRoutes.route("/user/register").post(authLimiter, validarCadastro, async function (req, res) {
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

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", token, tipo: "User" })
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error)
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário" })
    }
})

// Rotas a partir daqui exigem perfil de Administrador
userRoutes.route("/user").get(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()

    try {
        const result = await db_connect.collection("users").find({}, { projection: SEM_SENHA }).toArray()
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar usuários:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

userRoutes.route("/user/:id").get(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    try {
        const result = await db_connect.collection("users").findOne(myquery, { projection: SEM_SENHA })
        if (!result) return res.status(404).json({ mensagem: "Usuário não encontrado" })
        res.status(200).json(result)
    } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

userRoutes.route("/user/add").post(authorize(["Admin", "admin"]), async function (req, res) {
    const db_connect = dbo.getDb()

    const name = (req.body.name || "").trim()
    const email = (req.body.email || "").trim()
    if (!name || !email) {
        return res.status(400).json({ mensagem: "Nome e email são obrigatórios" })
    }

    const myobj = {
        name,
        user: (req.body.user || "").trim(),
        email,
        function: "User"
    }

    // Fornece senha só se vier explícita (e com hash) — nunca "Admin"
    if (req.body.senha && req.body.senha.length >= 8) {
        const salt = await bcrypt.genSalt(10)
        myobj.senha = await bcrypt.hash(req.body.senha, salt)
    } else {
        return res.status(400).json({ mensagem: "Informe uma senha com no mínimo 8 caracteres" })
    }

    try {
        const result = await db_connect.collection("users").insertOne(myobj)
        res.status(201).json({ mensagem: "Usuário criado com sucesso" })
    } catch (error) {
        console.error("Erro ao criar usuário:", error)
        res.status(409).json({ mensagem: "Erro ao criar usuário" })
    }
})

userRoutes.route("/user/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    // 'function' NÃO é editável por API — evita escalonamento de privilégio
    const fields = ["name", "user", "email"]

    const updateDoc = {}
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateDoc[field] = req.body[field]
        }
    })

    if (req.body.senha && req.body.senha.length >= 8) {
        const salt = await bcrypt.genSalt(10)
        updateDoc.senha = await bcrypt.hash(req.body.senha, salt)
    }

    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    try {
        const result = await db_connect.collection("users").updateOne(myquery, { $set: updateDoc })
        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }
        res.status(200).json({ mensagem: "Usuário atualizado com sucesso" })
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error)
        res.status(409).json({ mensagem: "Erro ao atualizar usuário" })
    }
})

// Permite ao admin alterar o papel (útil para criar novos administradores de forma controlada)
userRoutes.route("/user/role/:id").post(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }
    const tipo = (req.body.function || req.body.tipo || "").trim()

    if (!["Admin", "User"].includes(tipo)) {
        return res.status(400).json({ mensagem: "Papel inválido. Use Admin ou User." })
    }

    // Impede que um admin se rebaixe a ponto de perder o acesso por engano
    if (req.user.userId && String(req.user.userId) === String(req.params.id) && tipo !== "Admin") {
        return res.status(400).json({ mensagem: "Você não pode remover seu próprio acesso de administrador" })
    }

    try {
        const result = await db_connect.collection("users").updateOne(myquery, { $set: { function: tipo } })
        if (result.matchedCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }
        res.status(200).json({ mensagem: "Papel atualizado com sucesso" })
    } catch (error) {
        console.error("Erro ao atualizar papel:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar papel" })
    }
})

userRoutes.route("/user/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
    const db_connect = dbo.getDb()
    const myquery = { _id: new ObjectId(req.params.id) }

    // Impede que um admin se auto-remove
    if (req.user.userId && String(req.user.userId) === String(req.params.id)) {
        return res.status(400).json({ mensagem: "Você não pode excluir o próprio usuário" })
    }

    try {
        const result = await db_connect.collection("users").deleteOne(myquery)
        if (result.deletedCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }
        res.status(200).json({ mensagem: "Usuário excluído com sucesso" })
    } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        res.status(500).json({ mensagem: "Erro ao deletar usuário" })
    }
})

module.exports = userRoutes