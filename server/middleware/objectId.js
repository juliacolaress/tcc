const ObjectId = require("mongodb").ObjectId

// Valida se o param é um ObjectId do MongoDB em uma rota que recebe :id na URL.
// Retorna um middleware que responde 400 caso o formato seja inválido.
function validarObjectId(req, res, next) {
    const id = req.params.id
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ mensagem: "Identificador inválido" })
    }
    next()
}

// Converte com segurança um param :id para ObjectId (após o middleware validarObjectId).
function paraObjectId(req) {
    return new ObjectId(req.params.id)
}

module.exports = { validarObjectId, paraObjectId }