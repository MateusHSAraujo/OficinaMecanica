var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://mongo:27017/oficinaDB');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "username": String,
    "password": String,
    "role": String,
    "accountData":{
        "type": mongoose.Schema.Types.ObjectId,
        "refPath": 'accountDataModel'
    },
    "accountDataModel":{
        "type":String,
        "required": true,
        "enum": ['client','employee']
    }

});
userModel = conn1.model('user', userSchema);

var clientSchema = new Schema({
    "cpf": String,
    "name": String,
    "surname": String,
    "birthday": String,
    "email": String,
    "phone": String,
    "address": String,
    "cep": String,
    "user": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
});
clientModel = conn1.model('client', clientSchema);

var vehicleSchema = new Schema({
    "licensePlate": String,
    "year": String,
    "model": String,
    "owner": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
})
vehicleModel = conn1.model('vehicle',vehicleSchema);

var employeeSchema = new Schema({
    "name": String,
    "user": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    'jobsRelated' : Number
})
employeeModel = conn1.model('employee',employeeSchema);

var pecaSchema = new Schema({
    "name": String,
    "car": String,
    "type": String,
    "price": Number,
    "quantity": Number
})
pecaModel = conn1.model('peca',pecaSchema);

var requisicaoCompraPecaSchema = new Schema({
    "nameMechanic": String,
    "namePeca": String,
    "car": String,
    "type": String,
    "quantity": Number
})
requisicaoCompraPeca = conn1.model('requisicaoCompraPeca',requisicaoCompraPecaSchema);

var motoristaSchema = new Schema({
    "date": String,
    "time": String
})
motoristaModel = conn1.model('motorista',motoristaSchema);

var budgetServiceSchema = new Schema({
    "client" : {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    "budgetManager" : {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    "mechanic":{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    "vehicle":{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'vehicle'
    },
    "budget":{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'orcamento'
    },
    "repairType": String,
    "requestedRepair": Boolean,
    "details": String,
    "date": String,
    "time": String,
    "status": String,
    "budgetManagerComment": String,
    "mechanicComment": String,
    "requestedDriver": Boolean
})
budgetServiceModel = conn1.model('budgetService',budgetServiceSchema);

var repairServiceSchema = new Schema({
    "client" : {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    "mechanic":{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'user'
    },
    "budgetService":{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": 'budgetService'
    },
    "usedParts": [{ 
        "part":{
                    "type": mongoose.Schema.Types.ObjectId,
                    "ref": 'peca'
                },
        "ammount": Number,
    }],
    "status": String,
    "date": String,
    "time": String,
    "completed": Boolean,
    "mechanicComment": String,
    "requestedDriver": Boolean

});
repairServiceModel = conn1.model('repairService',repairServiceSchema);

var orcamentoSchema = new Schema({
    "total_cost": Number,
    "parts_cost": Number,
    "service_cost": Number,
    "status": String
})
orcamentoModel = conn1.model('orcamento',orcamentoSchema);

module.exports = {  
                    userModel, clientModel, vehicleModel, employeeModel, budgetServiceModel, repairServiceModel,
                    pecaModel, requisicaoCompraPeca, motoristaModel, orcamentoModel
                };