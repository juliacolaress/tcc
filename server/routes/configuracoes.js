const express = require("express")
const configuracoesRoutes = express.Router()
const dbo = require("../db/conn")
const { auth, authorize } = require("../middleware/auth")
const { extrairFilename, deletarArquivo } = require("../utils/arquivos")

const DADOS_PADRAO = {
    razaoSocial: "Organização de Amparo Animal Patas & Lares",
    cnpj: "00.000.000/0000-00",
    banco: "Itaú (000)",
    agencia: "0000",
    contaCorrente: "00000-0",
    chavePix: "00.000.000/0000-00",
    qrCode: ""
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

// GET pública — dados de doação da ONG (somente leitura).
// O registro padrão é garantido uma única vez no startup do servidor (server.js),
// então a rota não escreve no banco.
configuracoesRoutes.route("/configuracoes/doacao").get(async function (req, res) {
    const db_connect = dbo.getDb()
    try {
        const colecao = db_connect.collection("configuracoes")
        const config = await colecao.findOne({})

        // Fallback em memória caso o registro ainda não exista (não persiste)
        res.status(200).json(config || { ...DADOS_PADRAO, atualizadoEm: null })
    } catch (error) {
        console.error("Erro ao buscar dados de doação:", error)
        res.status(500).json({ mensagem: "Erro no servidor" })
    }
})

// PUT — atualizar dados de doação (admin)
configuracoesRoutes.route("/configuracoes/doacao").put(auth, authorize(["Admin", "admin"]), async function (req, res) {
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
        console.error("Erro ao atualizar dados de doação:", error)
        res.status(500).json({ mensagem: "Erro ao atualizar dados de doação" })
    }
})

module.exports = configuracoesRoutes
