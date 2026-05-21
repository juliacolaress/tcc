const { MongoClient } = require("mongodb")

var _db
var client

module.exports = {
    connectToMongoDB: async function (callback) {
        const Db = process.env.ATLAS_URI
        if (!Db) {
            return callback(new Error("ATLAS_URI is not defined in environment variables"))
        }

        client = new MongoClient(Db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        try {
            await client.connect()
            _db = client.db("tcc") // Nome do BANCO DE DADOS
            console.log("Conectado ao MongoDB.")
            
            return callback(null)
        } catch (error) {
            return callback(error)
        }
    },

    getDb: function () {
        return _db
    }
}
