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

module.exports = { auth, authorize };
