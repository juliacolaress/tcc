const express = require("express")
const configuracoesRoutes = express.Router()
const dbo = require("../db/conn")
const { auth } = require("../middleware/auth")
const fs = require("fs")
const path = require("path")

const DADOS_PADRAO = {
    razaoSocial: "Organização de Amparo Animal Patas & Lares",
    cnpj: "00.000.000/0000-00",
    banco: "Itaú (000)",
    agencia: "0000",
    contaCorrente: "00000-0",
    chavePix: "00.000.000/0000-00",
    qrCode: ""
}

function extrairFilename(url) {
    if (!url || typeof url !== "string") return null
    const match = url.match(/\/uploads\/(.+)$/)
    return match ? match[1] : null
}

function deletarArquivo(filename) {
    if (!filename) return
    const caminho = path.join(__dirname, "..", "uploads", filename)
    fs.unlink(caminho, () => {})
}

function sanitizar(body) {
    const campos = ["razaoSocial", "cnpj", "banco", "agencia", "contaCorrente", "chavePix", "qrCode"]
    const updateDoc = {}
    campos.forEach((campo) => {
        if (body[campo] !== undefined) {
            updateDoc[campo] = String(body[campo]).trim()
        }
    })
    return updateDoc
}

// GET pública — dados de doação da ONG (cria o registro padrão na primeira vez)
configuracoesRoutes.route("/configuracoes/doacao").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const colecao = db_connect.collection("configuracoes")
        let config = await colecao.findOne({})

        if (!config) {
            const padrao = { ...DADOS_PADRAO, atualizadoEm: new Date() }
            await colecao.insertOne(padrao)
            config = padrao
        }

        res.status(200).json(config)
    } catch (error) {
        res.status(500).json({ mensagem: error.message })
    }
})

// PUT — atualizar dados de doação (admin)
configuracoesRoutes.route("/configuracoes/doacao").put(auth, async function (req, res) {
    const db_connect = dbo.getDb()

    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ mensagem: "Corpo da requisição inválido" })
    }

    const updateDoc = sanitizar(req.body)
    if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado para atualizar" })
    }

    updateDoc.atualizadoEm = new Date()

    try {
        const colecao = db_connect.collection("configuracoes")
        const atual = await colecao.findOne({})

        if (!atual) {
            await colecao.insertOne({ ...DADOS_PADRAO, ...updateDoc })
        } else {
            await colecao.updateOne({}, { $set: updateDoc })
        }

        if (atual && atual.qrCode && updateDoc.qrCode !== undefined && atual.qrCode !== updateDoc.qrCode) {
            deletarArquivo(extrairFilename(atual.qrCode))
        }

        const resultado = await colecao.findOne({})
        res.status(200).json(resultado)
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao atualizar dados de doação: " + error.message })
    }
})

module.exports = configuracoesRoutes
