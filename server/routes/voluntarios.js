const express = require("express");
const voluntariosRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const { body, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { validarObjectId } = require("../middleware/objectId");
const { writeLimiter } = require("../middleware/rateLimiters");

const STATUS_VOLUNTARIO_VALIDOS = ["Pendente", "Aprovado", "Rejeitado", "Ativo"];

const validarVoluntario = [
  body("nome").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 60 }).withMessage("Nome deve ter no máximo 60 caracteres"),
  body("email").trim().notEmpty().withMessage("E-mail é obrigatório").isEmail().withMessage("E-mail inválido").isLength({ max: 120 }).withMessage("E-mail deve ter no máximo 120 caracteres"),
  body("telefone").optional({ checkFalsy: true }).matches(/^\d{2} \d{5}-\d{4}$/).withMessage("Telefone deve estar no formato XX XXXXX-XXXX"),
  body("cidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Cidade deve ter no máximo 150 caracteres"),
  body("estado").optional({ checkFalsy: true }).isLength({ max: 2 }).withMessage("UF deve ter no máximo 2 caracteres"),
  body("observacoes").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Observações devem ter no máximo 150 caracteres"),
  body("interesses").optional().isArray().withMessage("Interesses deve ser uma lista"),
  body("disponibilidade").optional().isArray().withMessage("Disponibilidade deve ser uma lista"),
];

const validarVoluntarioUpdate = [
  body("nome").optional().trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max: 60 }).withMessage("Nome deve ter no máximo 60 caracteres"),
  body("email").optional().trim().notEmpty().withMessage("E-mail é obrigatório").isEmail().withMessage("E-mail inválido").isLength({ max: 120 }).withMessage("E-mail deve ter no máximo 120 caracteres"),
  body("telefone").optional({ checkFalsy: true }).matches(/^\d{2} \d{5}-\d{4}$/).withMessage("Telefone deve estar no formato XX XXXXX-XXXX"),
  body("cidade").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Cidade deve ter no máximo 150 caracteres"),
  body("estado").optional({ checkFalsy: true }).isLength({ max: 2 }).withMessage("UF deve ter no máximo 2 caracteres"),
  body("observacoes").optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage("Observações devem ter no máximo 150 caracteres"),
  body("interesses").optional().isArray().withMessage("Interesses deve ser uma lista"),
  body("disponibilidade").optional().isArray().withMessage("Disponibilidade deve ser uma lista"),
  body("status").optional().custom((v) => {
    if (!STATUS_VOLUNTARIO_VALIDOS.includes(v)) {
      throw new Error("Status inválido. Use um de: " + STATUS_VOLUNTARIO_VALIDOS.join(", ") + ".");
    }
    return true;
  }),
];

voluntariosRoutes.route("/voluntario/public/add").post(writeLimiter, validarVoluntario, async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ mensagem: errors.array()[0].msg });
  const db_connect = dbo.getDb();
  const email = (req.body.email || "").trim().toLowerCase();
  const telefone = (req.body.telefone || "").trim();
  try {
    const or = [];
    if (email) or.push({ email });
    if (telefone) or.push({ telefone });
    if (or.length > 0) {
      const existente = await db_connect.collection("voluntarios").findOne({
        status: { $in: ["Pendente", "Ativo"] },
        $or: or,
      });
      if (existente) {
        return res.status(409).json({
          mensagem: "Você já enviou um formulário de voluntariado e ele está em análise. Aguarde nosso retorno.",
        });
      }
    }
    const myobj = {
      nome: req.body.nome,
      email,
      telefone,
      cidade: req.body.cidade,
      estado: req.body.estado,
      interesses: Array.isArray(req.body.interesses) ? req.body.interesses : [],
      disponibilidade: Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : [],
      observacoes: (req.body.observacoes || "").trim(),
      status: "Pendente",
      origem: "Publico",
      criadoEm: new Date(),
    };
    const result = await db_connect.collection("voluntarios").insertOne(myobj);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao cadastrar voluntário público:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntarios").get(authorize(["Admin", "admin"]), async function (req, res) {
  const db_connect = dbo.getDb();
  try {
    const result = await db_connect.collection("voluntarios").find({}).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar voluntários:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntario/:id").get(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  try {
    const result = await db_connect.collection("voluntarios").findOne(myquery);
    if (!result) return res.status(404).json({ mensagem: "Voluntário não encontrado" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar voluntário:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntario/add").post(authorize(["Admin", "admin"]), validarVoluntario, async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ mensagem: errors.array()[0].msg });
  const db_connect = dbo.getDb();
  const myobj = {
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone || "",
    cidade: req.body.cidade,
    estado: req.body.estado,
    interesses: Array.isArray(req.body.interesses) ? req.body.interesses : [],
    disponibilidade: Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : [],
    observacoes: (req.body.observacoes || "").trim(),
    status: "Ativo",
    origem: "Admin",
    criadoEm: new Date(),
  };
  try {
    const result = await db_connect.collection("voluntarios").insertOne(myobj);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao cadastrar voluntário:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntario/status/:id").post(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  const status = req.body.status;
  if (!STATUS_VOLUNTARIO_VALIDOS.includes(status)) {
    return res.status(400).json({ mensagem: "Status inválido. Use um de: " + STATUS_VOLUNTARIO_VALIDOS.join(", ") + "." });
  }
  try {
    const result = await db_connect.collection("voluntarios").updateOne(myquery, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ mensagem: "Voluntário não encontrado" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao atualizar status do voluntário:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntario/update/:id").post(authorize(["Admin", "admin"]), validarObjectId, validarVoluntarioUpdate, async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ mensagem: errors.array()[0].msg });
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  const updateDoc = {};
  const campos = ["nome", "email", "telefone", "cidade", "estado"];
  campos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      updateDoc[campo] = campo === "email" ? String(req.body[campo]).trim().toLowerCase() : req.body[campo];
    }
  });
  if (req.body.observacoes !== undefined) updateDoc.observacoes = (req.body.observacoes || "").trim();
  if (req.body.interesses !== undefined) updateDoc.interesses = Array.isArray(req.body.interesses) ? req.body.interesses : [];
  if (req.body.disponibilidade !== undefined) updateDoc.disponibilidade = Array.isArray(req.body.disponibilidade) ? req.body.disponibilidade : [];
  if (req.body.status !== undefined) updateDoc.status = req.body.status;
  if (Object.keys(updateDoc).length === 0) return res.status(400).json({ mensagem: "Nenhum dado para atualizar" });
  try {
    const result = await db_connect.collection("voluntarios").updateOne(myquery, { $set: updateDoc });
    if (result.matchedCount === 0) return res.status(404).json({ mensagem: "Voluntário não encontrado" });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro no update de voluntários:", error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

voluntariosRoutes.route("/voluntario/:id").delete(authorize(["Admin", "admin"]), validarObjectId, async function (req, res) {
  const db_connect = dbo.getDb();
  const myquery = { _id: new ObjectId(req.params.id) };
  try {
    const result = await db_connect.collection("voluntarios").deleteOne(myquery);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao deletar voluntário:", error);
    res.status(500).json({ mensagem: "Erro ao deletar voluntário" });
  }
});

module.exports = voluntariosRoutes;
