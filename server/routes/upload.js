const express = require("express")
const uploadRoutes = express.Router()
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const fs = require("fs")
const { auth } = require("../middleware/auth")

const MAGIC_BYTES = {
    jpeg: Buffer.from([0xff, 0xd8, 0xff]),
    png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    gif: Buffer.from([0x47, 0x49, 0x46, 0x38]),
    webp_riff: Buffer.from([0x52, 0x49, 0x46, 0x46]),
    webp_webp: Buffer.from([0x57, 0x45, 0x42, 0x50]),
}

function verificarMagicBytes(buffer) {
    if (buffer.length < 4) return false
    if (buffer.subarray(0, 3).equals(MAGIC_BYTES.jpeg)) return true
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.png)) return true
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.gif)) return true
    if (buffer.subarray(0, 4).equals(MAGIC_BYTES.webp_riff) && buffer.length >= 12 && buffer.subarray(8, 12).equals(MAGIC_BYTES.webp_webp)) return true
    return false
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"))
    },
    filename: function (req, file, cb) {
        const extensao = path.extname(file.originalname)
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

    const caminho = path.join(__dirname, "..", "uploads", file.filename)
    if (fs.existsSync(caminho)) {
        const buffer = fs.readFileSync(caminho)
        if (!verificarMagicBytes(buffer)) {
            fs.unlinkSync(caminho)
            return cb(new Error("Arquivo corrompido ou tipo inválido."))
        }
    }

    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

function extrairProtocolo(req) {
    const forwarded = req.headers["x-forwarded-proto"]
    if (forwarded) return forwarded.split(",")[0].trim()
    return req.protocol
}

uploadRoutes.route("/upload").post(auth, upload.single("foto"), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." })
    }

    const protocolo = extrairProtocolo(req)
    const url = `${protocolo}://${req.get("host")}/uploads/${req.file.filename}`
    res.status(201).json({ url, filename: req.file.filename })
})

uploadRoutes.route("/upload/multiple").post(auth, upload.array("fotos", 3), function (req, res) {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." })
    }

    const protocolo = extrairProtocolo(req)
    const urls = req.files.map(file => ({
        url: `${protocolo}://${req.get("host")}/uploads/${file.filename}`,
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
