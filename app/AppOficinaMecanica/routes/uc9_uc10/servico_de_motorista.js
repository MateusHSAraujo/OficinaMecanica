const express = require("express");
const { orcamento } = require("../../models/mongo");
var router = express.Router();

var mongoOpOrcamento = require('../../models/mongo').budgetServiceModel;
var mongoOpReparo = require('../../models/mongo').repairServiceModel;
var mongoOpMotorista = require('../../models/mongo').motoristaModel;

function sendAgendamentoMotorista(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('agendamento_motorista.html', {"root": "./routes/uc9_uc10"});
}

async function sendOrcamentos(req, res) {  // GET
    var response = {};
    try {
        var data = await mongoOpOrcamento.find({requestedRepair: false, client: JSON.parse(req.cookies.userAuth).id, requestedDriver: false});
        response = data;
    } catch(err) {
        response = {"resultado": "falha de acesso ao BD"};
    }
    res.json(response);
}

async function insertMotorista(req, res){
    var response = {};
    var db = new mongoOpMotorista();
    db.date = req.body.date;
    db.time = req.body.time;

    // console.log(req.body.selectedOption);
    var dat = await mongoOpOrcamento.findOne({_id: req.body.selectedOption._id});

    if(dat === null){
        dat = await mongoOpReparo.findOne({_id: req.body.selectedOption._id});
    }

    dat.requestedDriver = true;
    dat.save();

    try {
        db.save();
        response = {"resultado": "reparo inserido"};
    } catch (err) {
        response = {"resultado": "falha de acesso ao BD"};
    }
    res.json(response);
       
}

async function sendReparo(req, res) {  // GET
    var response = {};
    try {
        var data = await mongoOpReparo.find({status: 'Em andamento', client: JSON.parse(req.cookies.userAuth).id, requestedDriver: false});
        response = data;
    } catch(err) {
        response = {"resultado": "falha de acesso ao BD"};
    }
    res.json(response);
}

router.route('/agendamento_motorista')
    .get(sendAgendamentoMotorista)
    .post(insertMotorista)
;

router.route('/orcamentos_motorista')
    .get(sendOrcamentos)
;

router.route('/reparos_motorista')
    .get(sendReparo)
;
module.exports = router;