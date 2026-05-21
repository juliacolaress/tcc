const express = require("express");
const voluntariosRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
// Deixamos o require do auth aqui caso você use em outro lugar, mas removemos das rotas abaixo
const { auth } = require("../middleware/auth");

// 1. LISTAR TODOS OS VOLUNTÁRIOS (Sem o bloqueio do 'auth')
voluntariosRoutes.route("/voluntarios").get(async function (req, res) {
    const db_connect = dbo.getDb();
    try {
        const result = await db_connect.collection("voluntarios").find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. BUSCAR UM VOLUNTÁRIO ESPECÍFICO (Sem o bloqueio do 'auth')
voluntariosRoutes.route("/voluntario/:id").get(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("voluntarios").findOne(myquery);
        if (!result) return res.status(404).json({ message: "Voluntário não encontrado" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. CADASTRAR NOVO VOLUNTÁRIO (Sem o bloqueio do 'auth')
voluntariosRoutes.route("/voluntario/add").post(async function (req, res) {
    const db_connect = dbo.getDb();
    
    console.log("Recebido para cadastro:", req.body);

    try {
        const result = await db_connect.collection("voluntarios").insertOne(req.body);
        console.log("Sucesso ao inserir no MongoDB!");
        res.status(201).json(result); 
    } catch (error) {
        console.error("Erro fatal no MongoDB:", error);
        res.status(500).json({ message: error.message });
    }
});

// 4. ATUALIZAR UM VOLUNTÁRIO (Sem o bloqueio do 'auth')
voluntariosRoutes.route("/voluntario/update/:id").post(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    
    const newvalues = {
        $set: {
            nome: req.body.nome,
            email: req.body.email,
            ddd: req.body.ddd,
            telefone: req.body.telefone,
            cidade: req.body.cidade,
            estado: req.body.estado
        },
    };

    try {
        const result = await db_connect.collection("voluntarios").updateOne(myquery, newvalues);
        
        if (result.modifiedCount === 0) {
            console.log("Nenhum documento foi modificado (pode ser que os dados sejam idênticos).");
        } else {
            console.log("Voluntário atualizado no Banco de Dados!");
        }
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Erro no update de voluntários:", error);
        res.status(500).json({ message: error.message });
    }
});

// 5. DELETAR UM VOLUNTÁRIO (Sem o bloqueio do 'auth')
voluntariosRoutes.route("/voluntario/:id").delete(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("voluntarios").deleteOne(myquery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar voluntário" });
    }
});

module.exports = voluntariosRoutes;