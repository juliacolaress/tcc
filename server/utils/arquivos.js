const fs = require("fs")
const path = require("path")

// Extrai o nome do arquivo a partir de uma URL "/uploads/arquivo.ext".
// Retorna null quando a URL é vazia, inválida ou não aponta para uploads.
function extrairFilename(url) {
    if (!url || typeof url !== "string") return null
    const match = url.match(/\/uploads\/(.+)$/)
    return match ? match[1] : null
}

// Remove um arquivo de server/uploads pelo nome (best-effort, assíncrono).
function deletarArquivo(filename) {
    if (!filename) return
    const caminho = path.join(__dirname, "..", "uploads", filename)
    fs.unlink(caminho, () => {})
}

module.exports = { extrairFilename, deletarArquivo }
