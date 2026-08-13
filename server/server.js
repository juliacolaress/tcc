const path = require("path")
const fs = require("fs")
const dns = require("dns")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })

const fallbackDnsServers = ["1.1.1.1", "8.8.8.8"]

function ensureValidDns() {
    const servers = dns.getServers()
    const valid = servers.filter((s) => !s.startsWith("127.") && s !== "::1")
    if (valid.length === 0) {
        dns.setServers(fallbackDnsServers)
        console.log("DNS do Node inválido (loopback). Usando DNS público: " + fallbackDnsServers.join(", "))
    } else if (valid.length !== servers.length) {
        dns.setServers(valid)
    }
}

ensureValidDns()
const express = require("express")
const app = express()
const cors = require("cors")

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const port = process.env.PORT || 5050

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(require("./routes/user")) 
app.use(require("./routes/animais"));
app.use(require("./routes/doacao"));
app.use(require("./routes/voluntarios"))
app.use(require("./routes/necessidades"))
app.use(require("./routes/eventos"))
app.use(require("./routes/upload"))
app.use(require("./routes/configuracoes"))
app.use(require("./routes/relatorios"))

const dbo = require("./db/conn")

app.get("/", function(req, res) {
    res.send("App is running")
})

dbo.connectToMongoDB(function (error) {
    if (error) throw error

    const db = dbo.getDb()

    const configuracaoPadrao = {
        razaoSocial: "Organização de Amparo Animal Patas & Lares",
        cnpj: "00.000.000/0000-00",
        banco: "Itaú (000)",
        agencia: "0000",
        contaCorrente: "00000-0",
        chavePix: "00.000.000/0000-00",
        qrCode: "",
        atualizadoEm: new Date()
    }

    db.collection("configuracoes").updateOne(
        {},
        { $setOnInsert: configuracaoPadrao },
        { upsert: true }
    ).then(() => {
        console.log("Configuração de doação padrão garantida no banco.")
    }).catch((err) => {
        console.error("Erro ao garantir configuração padrão:", err.message)
    })

    app.listen(port, () => {
        console.log("Servidor rodando na porta: " + port)
    })
})