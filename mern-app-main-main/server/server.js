const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })
const express = require("express")
const app = express()
const cors = require("cors")

const port = process.env.PORT || 5050

app.use(cors())
app.use(express.json())
app.use(require("./routes/user")) // cria as rotas para manipulação de usuários
app.use(require("./routes/animais"));
app.use(require("./routes/doacao"));
app.use(require("./routes/voluntarios"))

const dbo = require("./db/conn")

app.get("/", function(req, res) {
    res.send("App is running")
})

dbo.connectToMongoDB(function (error) {
    if (error) throw error

    app.listen(port, () => {
        console.log("Servidor rodando na porta: " + port)
    })
})