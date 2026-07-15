const path = require("path")
const fs = require("fs")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })
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
app.use(require("./routes/upload"))

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