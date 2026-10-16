const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ mensagem: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ mensagem: "Token inválido." });
    }
};

// Autenticação opcional: se vier um token válido, popula req.user; caso contrário
// segue como visitante anônimo. Útil em rotas públicas que devolvem mais (ou menos)
// dados conforme o perfil (ex: GET /animal esconde PII do adotante para visitantes).
const authOpcional = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            // Token inválido/expirado: trata como visitante anônimo, sem bloquear
        }
    }
    next();
};

const adminRoles = ["Admin", "admin"];

function ehAdmin(req) {
    return Boolean(req.user && adminRoles.includes(req.user.tipo));
}

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        auth,
        (req, res, next) => {
            if (roles.length && !roles.includes(req.user.tipo)) {
                return res.status(403).json({ mensagem: "Acesso negado. Permissão insuficiente." });
            }
            next();
        }
    ];
};

module.exports = { auth, authorize, authOpcional, ehAdmin, adminRoles };
