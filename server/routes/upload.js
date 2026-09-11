const express = require("express")
const uploadRoutes = express.Router()
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const fs = require("fs")
const { authorize } = require("../middleware/auth")

const MAGIC_BYTES = {
    jpeg: Buffer.from([0xff, 0xd8, 0xff]),
    png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    gif: Buffer.from([0x47, 0x49, 0x46, 0x38]),
    webp_riff: Buffer.from([0x52, 0x49, 0x46, 0x46]),
    webp_webp: Buffer.from([0x57, 0x45, 0x42, 0x50]),
}

function detectarExtensao(buffer) {
    if (!buffer || buffer.length < 4) return null
    if (buffer.subarray(0, 3).equals(MAGIC_BYTES.jpeg)) return "jpeg"
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.png)) return "png"
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.gif)) return "gif"
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.webp_riff) && buffer.length >= 12 && buffer.subarray(8, 12).equals(MAGIC_BYTES.webp_webp)) return "webp"
    return null
}

function extensaoCompativel(extensao, tipoReal) {
    const ext = (extensao || "").replace(/^\./, "").toLowerCase()
    if (ext === tipoReal) return true
    if (tipoReal === "jpeg" && ext === "jpg") return true
    return false
}

function corrigirExtensao(buffer, file) {
    const tipoReal = detectarExtensao(buffer)
    if (!tipoReal) return false

    if (!extensaoCompativel(path.extname(file.filename), tipoReal)) {
        const nomeCorreto = file.filename.slice(0, file.filename.length - path.extname(file.filename).length) + "." + tipoReal
        const novoCaminho = path.join(path.dirname(file.path), nomeCorreto)
        try {
            fs.renameSync(file.path, novoCaminho)
            file.path = novoCaminho
            file.filename = nomeCorreto
        } catch (error) {
            // Se a renomeação falhar, mantém o nome original.
        }
    }

    return true
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"))
    },
    filename: function (req, file, cb) {
        const extensao = path.extname(file.originalname).toLowerCase()
        const nome = `${crypto.randomUUID()}${extensao}`
        cb(null, nome)
    }
})

const fileFilter = (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp/
    const extensaoValida = permitidos.test(path.extname(file.originalname).toLowerCase())
    const mimetypeValido = permitidos.test(file.mimetype)

    if (!extensaoValida || !mimetypeValido) {
        return cb(new Error("Apenas imagens (jpeg, jpg, png, gif, webp) são permitidas."))
    }

    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

// Uploads de imagens exigem perfil de administrador
uploadRoutes.route("/upload").post(authorize(["Admin", "admin"]), upload.single("foto"), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." })
    }

    const buffer = fs.readFileSync(req.file.path)
    if (!corrigirExtensao(buffer, req.file)) {
        fs.unlink(req.file.path, () => {})
        return res.status(400).json({ mensagem: "Arquivo corrompido ou tipo inválido." })
    }

    const url = `/uploads/${req.file.filename}`
    res.status(201).json({ url, filename: req.file.filename })
})

uploadRoutes.route("/upload/multiple").post(authorize(["Admin", "admin"]), upload.array("fotos", 3), function (req, res) {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." })
    }

    for (const file of req.files) {
        const buffer = fs.readFileSync(file.path)
        if (!corrigirExtensao(buffer, file)) {
            req.files.forEach(f => fs.unlink(f.path, () => {}))
            return res.status(400).json({ mensagem: "Arquivo corrompido ou tipo inválido." })
        }
    }

    const urls = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename
    }))

    res.status(201).json({ fotos: urls })
})

uploadRoutes.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ mensagem: "Arquivo excede o limite de 5MB." })
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ mensagem: "Máximo de 3 arquivos permitidos." })
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

module.exports = uploadRoutes