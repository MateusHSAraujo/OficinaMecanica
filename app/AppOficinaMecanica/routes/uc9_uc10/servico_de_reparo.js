const express = require("express");
const { orcamento } = require("../../models/mongo");
var router = express.Router();

var mongoOpOrcamento = require('../../models/mongo').budgetServiceModel;
var mongoOpRepair = require('../../models/mongo').repairServiceModel;


function sendAgendamento(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('agendamento_reparo.html', {"root": "./routes/uc9_uc10"});
}

async function sendOrcamentos(req, res) {  // GET
    var response = {};
    try {
        console.log(JSON.parse(req.cookies.userAuth).id)
        var data = await mongoOpOrcamento.find({requestedRepair: false, client: JSON.parse(req.cookies.userAuth).id});
        response = data;
    } catch(err) {
        response = {"resultado": "falha de acesso ao BD"};
    }
    res.json(response);
}

async function insertRepair(req, res){
    var response = {};
    var db = new mongoOpRepair();
    db.client = req.body.client;
    db.mechanic = req.body.mechanic;
    db.budgetService = req.body.budgetService;
    db.usedParts = req.body.usedParts;
    db.status = req.body.status;
    db.date = req.body.date;
    db.time = req.body.time;
    db.completed = req.body.completed;
    db.requestedDriver = false;
    try {
        db.save();
        response = {"resultado": "reparo inserido"};
    } catch (err) {
        response = {"resultado": "falha de acesso ao BD"};
    }
    res.json(response);
       
}

async function changeOrcamento(req, res){

    var response = {};
    var query = {"_id": req.body._id};
    try {
        var dat = await mongoOpOrcamento.findOne(query);
        console.log("query: ", query)
        dat.requestedRepair = true;
        dat.save();
        if (dat == null) response = {"resultado": "orcamento inexistente"};
        else response = {"resultado": "orcamento atualizado"};  
    } catch(err) {
        response = {"resultado": "falha de acesso ao DB"};
    }
    res.json(response);

}


router.route('/agendamento_do_reparo')
    .get(sendOrcamentos)
    .post(insertRepair)
    .put(changeOrcamento)
;

module.exports = router;