const express = require("express");
const animalRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

// 1. LISTAR TODOS OS ANIMAIS
animalRoutes.route("/animal").get(async function (req, res) {
    const db_connect = dbo.getDb();
    try {
        const result = await db_connect.collection("animais").find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. BUSCAR UM ANIMAL ESPECÍFICO (Para edição)
animalRoutes.route("/animal/:id").get(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("animais").findOne(myquery);
        if (!result) return res.status(404).json({ message: "Animal não encontrado" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. CADASTRAR NOVO ANIMAL
animalRoutes.route("/animal/add").post(async function (req, res) {
    const db_connect = dbo.getDb();
    
    const myobj = {
        nome: req.body.nome,
        porte: req.body.porte,
        especie: req.body.especie,
        raca: req.body.raca,
        data_nasc: req.body.data_nasc,
        caracteristicas: req.body.caracteristicas,
        data_resgate: req.body.data_resgate,
        obs: req.body.obs,
        status: req.body.status,
        genero: req.body.genero,
        castracao: req.body.castracao,
        estado_saude: req.body.estado_saude,
        doencas_pre_ex: req.body.doencas_pre_ex,
        pelo: req.body.pelo,
        amputacao: req.body.amputacao,
        cor: req.body.cor,
        ong: req.body.ong,
    };

    try {
        const result = await db_connect.collection("animais").insertOne(myobj);
        console.log("Animal cadastrado com sucesso!");
        res.status(201).json(result); 
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
});

// 4. ATUALIZAR UM ANIMAL 
animalRoutes.route("/animal/update/:id").post(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    
    const newvalues = {
        $set: {
            nome: req.body.nome,
            porte: req.body.porte,
            especie: req.body.especie,
            raca: req.body.raca,
            data_nasc: req.body.data_nasc,
            caracteristicas: req.body.caracteristicas,
            data_resgate: req.body.data_resgate,
            obs: req.body.obs,
            status: req.body.status,
            genero: req.body.genero,
            castracao: req.body.castracao,
            estado_saude: req.body.estado_saude,
            doencas_pre_ex: req.body.doencas_pre_ex,
            pelo: req.body.pelo,
            amputacao: req.body.amputacao,
            cor: req.body.cor,
            ong: req.body.ong,
        },
    };

    try {
        const result = await db_connect.collection("animais").updateOne(myquery, newvalues);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Animal não encontrado" });
        }
        console.log("Animal atualizado com sucesso!");
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar animal: " + error.message });
    }
});

// 5. DELETAR UM ANIMAL
animalRoutes.route("/animal/:id").delete(async function (req, res) {
    const db_connect = dbo.getDb();
    const myquery = { _id: new ObjectId(req.params.id) };
    try {
        const result = await db_connect.collection("animais").deleteOne(myquery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

module.exports = animalRoutes;