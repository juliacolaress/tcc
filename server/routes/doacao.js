const express = require("express");
const doacoesRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const { body, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { validarObjectId } = require("../middleware/objectId");
const { writeLimiter } = require("../middleware/rateLimiters");
const { extrairFilename, deletarArquivo } = require("../utils/arquivos");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const STATUS_VALIDOS = ["Pendente", "Confirmado", "Entregue", "Cancelado"];

const storageComprovante = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = "comprovante-" + crypto.randomUUID() + extensao;
    cb(null, nome);
  },
});

const fileFilterComprovante = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|gif|webp|pdf/;
  const extensaoValida = permitidos.test(path.extname(file.originalname).toLowerCase());
  const mimetypeValido = permitidos.test(file.mimetype);
  if (!extensaoValida || !mimetypeValido) {
    return cb(new Error("O comprovante deve ser uma imagem (jpeg, png, gif, webp) ou PDF."));
  }
  cb(null, true);
};

const uploadComprovante = multer({
  storage: storageComprovante,
  fileFilter: fileFilterComprovante,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const validarDoacao = [
  body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 60 }).withMessage("Nome deve ter no máximo 60 caracteres"),
  body("email").trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido").isLength({ max: 120 }).withMessage("E-mail deve ter no máximo 120 caracteres"),
  body("telefone").optional({ checkFalsy: true }).matches(/^\d{2} \d{5}-\d{4}$/).withMessage("Telefone deve estar no formato XX XXXXX-XXXX"),
  body("cidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Cidade deve ter no máximo 150 caracteres"),
  body("estado").optional({ checkFalsy: true }).isLength({ max: 2 }).withMessage("UF deve ter no máximo 2 caracteres"),
  body("tipo_doacao").trim().notEmpty().withMessage("Tipo de doação é obrigatório").isLength({ max: 80 }).withMessage("Tipo de doação deve ter no máximo 80 caracteres"),
  body("categoria").optional().isIn(["financeira", "material"]).withMessage("Categoria deve ser 'financeira' ou 'material'"),
  body("item").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Descrição do item deve ter no máximo 150 caracteres"),
  body("quantidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Quantidade deve ter no máximo 150 caracteres"),
  body("forma_entrega").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Entrega/coleta deve ter no máximo 150 caracteres"),
];

const validarDoacaoUpdate = [
  body("nome").optional().trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 60 }).withMessage("Nome deve ter no máximo 60 caracteres"),
  body("email").optional().trim().notEmpty().withMessage("Email é obrigatório").isEmail().withMessage("Email inválido").isLength({ max: 120 }).withMessage("E-mail deve ter no máximo 120 caracteres"),
  body("telefone").optional({ checkFalsy: true }).matches(/^\d{2} \d{5}-\d{4}$/).withMessage("Telefone deve estar no formato XX XXXXX-XXXX"),
  body("cidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Cidade deve ter no máximo 150 caracteres"),
  body("estado").optional({ checkFalsy: true }).isLength({ max: 2 }).withMessage("UF deve ter no máximo 2 caracteres"),
  body("tipo_doacao").optional().trim().notEmpty().withMessage("Tipo de doação é obrigatório").isLength({ max: 80 }).withMessage("Tipo de doação deve ter no máximo 80 caracteres"),
  body("item").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Descrição do item deve ter no máximo 150 caracteres"),
  body("quantidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Quantidade deve ter no máximo 150 caracteres"),
  body("forma_entrega").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Entrega/coleta deve ter no máximo 150 caracteres"),
  body("forma_pagamento").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Forma de pagamento deve ter no máximo 150 caracteres"),
];

function normalizarCategoria(req) {
  const categoria = (req.body.categoria || "").trim();
  if (categoria === "financeira" || categoria === "material") return categoria;
  return (req.body.tipo_doacao || "").trim() === "Dinheiro" ? "financeira" : "material";
}

const validarValorDoacao = [
  body("valor").custom((valor, { req }) => {
    if (valor === undefined || valor === "") return true;
    const tipo = (req.body.tipo_doacao || "").trim();
    const categoria = (req.body.categoria || "").trim();
    if (tipo.toLowerCase() === "dinheiro" || categoria === "financeira") {
      const valorNumerico = parseFloat(valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error("Valor da doação deve ser maior que zero");
      }
    }
    return true;
  }),
];

doacoesRoutes.route("/doacoes").get(authorize(["Admin", "admin"]), async function (req, res) {
  const db_connect = dbo.getDb();
  try {
    const result = await db_connect.collection("doacoes").find({}).sort({ data_criacao: -1 }).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar doações:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

doacoesRoutes.route("/doacao/:id/status").patch(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const status = (req.body.status || "").trim();
  if (!status || !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ mensagem: "Status deve ser um dos valores: " + STATUS_VALIDOS.join(", ") + "." });
  }
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  try {
    const result = await db_connect.collection("doacoes").findOneAndUpdate(myquery, { $set: { status } }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ mensagem: "Doação não encontrada" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

doacoesRoutes.route("/doacao/:id").get(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  try {
    const result = await db_connect.collection("doacoes").findOne(myquery);
    if (!result) return res.status(404).json({ mensagem: "Doação não encontrada" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar doação:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

doacoesRoutes.route("/doacao/add").post(authorize(["Admin", "admin"]), validarDoacao, validarValorDoacao, async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ mensagem: errors.array()[0].msg });
  const db_connect = dbo.getDb();
  const myobj = {
    email: req.body.email,
    nome: req.body.nome,
    telefone: req.body.telefone || "",
    cidade: req.body.cidade || "",
    estado: req.body.estado || "",
    tipo_doacao: req.body.tipo_doacao,
    categoria: normalizarCategoria(req),
    forma_pagamento: req.body.forma_pagamento || "",
    item: req.body.item || "",
    quantidade: req.body.quantidade || "",
    valor: parseFloat(req.body.valor) || 0,
    forma_entrega: req.body.forma_entrega || "",
    comprovante: req.body.comprovante || "",
    status: req.body.status && STATUS_VALIDOS.includes(req.body.status) ? req.body.status : "Pendente",
    data_criacao: new Date(),
  };
  try {
    const result = await db_connect.collection("doacoes").insertOne(myobj);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar doação:", error);
    res.status(409).json({ mensagem: "Erro ao criar doação" });
  }
});

doacoesRoutes.route("/doacao/publica").post(writeLimiter, uploadComprovante.single("comprovante"), async function (req, res) {
  const nome = (req.body.nome || "").trim();
  const email = (req.body.email || "").trim();
  if (!nome || !email) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Nome e e-mail do doador são obrigatórios." });
  }
  if (nome.length > 60) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Nome deve ter no máximo 60 caracteres" });
  }
  if (email.length > 120) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "E-mail deve ter no máximo 120 caracteres" });
  }
  const categoria = (req.body.categoria || "").trim();
  if (categoria !== "financeira" && categoria !== "material") {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Categoria deve ser 'financeira' ou 'material'." });
  }
  if (categoria === "financeira") {
    const valor = parseFloat(req.body.valor);
    if (isNaN(valor) || valor <= 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ mensagem: "Valor da doação deve ser maior que zero." });
    }
  }
  const telefone = (req.body.telefone || "").trim();
  if (telefone && !/^\d{2} \d{5}-\d{4}$/.test(telefone)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Telefone deve estar no formato XX XXXXX-XXXX" });
  }
  const cidade = (req.body.cidade || "").trim();
  const estado = (req.body.estado || "").trim();
  if (cidade.length > 150) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Cidade deve ter no máximo 150 caracteres" });
  }
  if (estado.length > 2) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "UF deve ter no máximo 2 caracteres" });
  }
  const item = (req.body.item || "").trim();
  const quantidade = (req.body.quantidade || "").trim();
  const formaEntrega = (req.body.forma_entrega || "").trim();
  const tipoDoacao = (req.body.tipo_doacao || "").trim();
  if (tipoDoacao.length > 80) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Tipo de doação deve ter no máximo 80 caracteres" });
  }
  if (item.length > 150) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Descrição do item deve ter no máximo 150 caracteres" });
  }
  if (quantidade.length > 150) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Quantidade deve ter no máximo 150 caracteres" });
  }
  if (formaEntrega.length > 150) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: "Entrega/coleta deve ter no máximo 150 caracteres" });
  }
  const db_connect = dbo.getDb();
  const myobj = {
    email,
    nome,
    telefone,
    cidade,
    estado,
    tipo_doacao: categoria === "financeira" ? "Dinheiro" : tipoDoacao || "Material",
    categoria,
    forma_pagamento: categoria === "financeira" ? req.body.forma_pagamento || "Pix" : "",
    item: categoria === "material" ? item : "",
    quantidade: categoria === "material" ? quantidade : "",
    valor: categoria === "financeira" ? parseFloat(req.body.valor) : 0,
    forma_entrega: categoria === "material" ? formaEntrega : "",
    comprovante: req.file ? "/uploads/" + req.file.filename : "",
    status: "Pendente",
    origem: "publica",
    data_criacao: new Date(),
  };
  try {
    const result = await db_connect.collection("doacoes").insertOne(myobj);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar doação pública:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(409).json({ mensagem: "Erro ao criar doação" });
  }
});

doacoesRoutes.route("/doacao/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  try {
    const doacao = await db_connect.collection("doacoes").findOne(myquery);
    if (!doacao) return res.status(404).json({ mensagem: "Doação não encontrada" });
    const result = await db_connect.collection("doacoes").deleteOne(myquery);
    if (doacao.comprovante) deletarArquivo(extrairFilename(doacao.comprovante));
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao deletar doação:", error);
    res.status(500).json({ mensagem: "Erro ao deletar" });
  }
});

doacoesRoutes.route("/doacao/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, validarDoacaoUpdate, validarValorDoacao, async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ mensagem: errors.array()[0].msg });
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  const fields = ["nome", "tipo_doacao", "forma_pagamento", "item", "quantidade", "email", "telefone", "cidade", "estado", "forma_entrega"];
  const updateDoc = {};
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "email") updateDoc[field] = String(req.body[field]).trim().toLowerCase();
      else if (["nome", "telefone", "cidade", "estado", "tipo_doacao", "forma_pagamento", "item", "quantidade", "forma_entrega"].includes(field)) {
        updateDoc[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      } else {
        updateDoc[field] = req.body[field];
      }
    }
  });
  if (req.body.valor !== undefined && String(req.body.valor).trim() !== "") {
    const valor = parseFloat(req.body.valor);
    if (isNaN(valor) || valor < 0) return res.status(400).json({ mensagem: "Valor da doação inválido" });
    updateDoc.valor = valor;
  } else if (req.body.valor !== undefined) {
    updateDoc.valor = 0;
  }
  if (req.body.categoria !== undefined || req.body.tipo_doacao !== undefined) {
    updateDoc.categoria = normalizarCategoria(req);
  }
  if (Object.keys(updateDoc).length === 0) return res.status(400).json({ mensagem: "Nenhum dado para atualizar" });
  try {
    const result = await db_connect.collection("doacoes").updateOne(myquery, { $set: updateDoc });
    if (result.matchedCount === 0) return res.status(404).json({ mensagem: "Doação não encontrada" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro no update:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

doacoesRoutes.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ mensagem: "Arquivo excede o limite de 5MB." });
    if (err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ mensagem: "Campo de arquivo inesperado." });
    return res.status(400).json({ mensagem: "Erro no upload: " + err.message });
  }
  if (err) return res.status(400).json({ mensagem: err.message });
  next();
});

module.exports = doacoesRoutes;
