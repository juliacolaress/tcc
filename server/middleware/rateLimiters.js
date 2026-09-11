const rateLimit = require("express-rate-limit")

// Limite mais restrito para tentativas de login/registro (anti brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
})

// Limite restrito para criação de conteúdo que exige autenticação (evita spam de uploads/cadastros)
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: "Muitas requisições. Tente novamente em alguns minutos." },
})

module.exports = { authLimiter, writeLimiter }