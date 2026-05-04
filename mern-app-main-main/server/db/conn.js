const { MongoClient } = require("mongodb")

const Db = "mongodb://juliacolaress:Colaresj1@ac-ctycqer-shard-00-00.lbynqie.mongodb.net:27017,ac-ctycqer-shard-00-01.lbynqie.mongodb.net:27017,ac-ctycqer-shard-00-02.lbynqie.mongodb.net:27017/?ssl=true&replicaSet=atlas-z90ogb-shard-0&authSource=admin&appName=Cluster0"

const client = new MongoClient(Db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var _db

module.exports = {
    connectToMongoDB: async function (callback) {
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
