const express = require("express");
const doacoesRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

// 1. LISTAR TODAS AS DOAÇÕES
doacoesRoutes.route("/doacoes").get(async function (req, res) {
    const db_connect = dbo.getDb();
    try {
        const result = await db_connect.collection("doacoes").find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. BUSCAR UMA DOAÇÃO ESPECÍFICA
doacoesRoutes.route("/doacao/:id").get(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("doacoes").findOne(myquery);
        if (!result) return res.status(404).json({ message: "Doação não encontrada" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. CADASTRAR NOVA DOAÇÃO
doacoesRoutes.route("/doacao/add").post(async function (req, res) {
    const db_connect = dbo.getDb();
    
    const myobj = {
        email: req.body.email,
        nome: req.body.nome,
        telefone: req.body.telefone,
        cidade: req.body.cidade,
        estado: req.body.estado,
        tipo_doacao: req.body.tipo_doacao,
        item: req.body.item,
        valor: parseFloat(req.body.valor) || 0,
        forma_entrega: req.body.forma_entrega
    };

    try {
        const result = await db_connect.collection("doacoes").insertOne(myobj);
        console.log("Doação cadastrada com sucesso!");
        res.status(201).json(result); 
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
});

// 4. DELETAR UMA DOAÇÃO
doacoesRoutes.route("/doacao/:id").delete(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("doacoes").deleteOne(myquery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

//Atualizar uma doação
doacoesRoutes.route("/doacao/update/:id").post(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    
    
    const newvalues = {
        $set: {
            nome: req.body.nome,
            tipo_doacao: req.body.tipo_doacao,
            item: req.body.item,
            valor: parseFloat(req.body.valor) || 0,
            email: req.body.email,
            telefone: req.body.telefone,
            cidade: req.body.cidade,
            estado: req.body.estado,
            forma_entrega: req.body.forma_entrega
        },
    };

    try {
        const result = await db_connect.collection("doacoes").updateOne(myquery, newvalues);
        
        if (result.modifiedCount === 0) {
            console.log("Nenhum documento foi modificado.");
        } else {
            console.log("Doação atualizada no Banco de Dados!");
        }
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Erro no update:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = doacoesRoutes;