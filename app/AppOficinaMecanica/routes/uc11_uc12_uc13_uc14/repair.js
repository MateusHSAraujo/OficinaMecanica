const express = require("express");
var router = express.Router();

var mongoOpRS = require('../../models/mongo').repairServiceModel;
var mongoOpPecas = require('../../models/mongo').pecaModel;

function checkAuth(req) {
    cookies = req.cookies;
    console.log(cookies);
    if(!cookies || !cookies.userAuth) return false;
    cauth = cookies.userAuth;
    var content = JSON.parse(cauth);
    if(content.key == 'secret' && (content.role =='mecanico' || content.role=='cliente')) return true;
    return false;
}

function checkAuthMiddleWare(req,res,next){
    console.log('Função de middleware para verificar autenticação de usuário invocada.')
    if(!checkAuth(req)){
        console.log('Usuário não autenticado, retornando erro.')
        res.header('Cache-Control', 'no-cache');
        res.status(401)
        res.sendFile('acesso_negado.html', {"root": "./public/pages"});
    }
    else{
        console.log('Usuário autenticado! Dando continuidade ao processamentos');
        next();
    } 
}

function sendRepairPage(req,res){
    console.log('Requisição para envio de página de reparos recebida');
    cookieContent = JSON.parse(req.cookies.userAuth);
    console.log('Informações de cookie : '+ JSON.stringify(cookieContent));
    res.header('Cache-Control', 'no-cache');
    if (cookieContent.role == 'cliente')  res.sendFile('agendamento_reparo.html', {"root": "./routes/uc9_uc10"}); 
    if (cookieContent.role == 'mecanico')  res.sendFile('reparos_mecanico.html', {"root": "./routes/uc11_uc12_uc13_uc14"});
}

async function getRepairServices(req,res){
    console.log('Requisição para envio de serviços cadastrados recebida.');
    
    var cookieContent = JSON.parse(req.cookies.userAuth);
    var role = cookieContent.role;
    var userId = cookieContent.id;
    console.log('ID de usuário: '+userId);
    var services=[], availablePieces=[],response={};
    let auxVct=[];

    if (role == 'mecanico'){ 
        try {
            services = await mongoOpRS.find({'mechanic':userId , 'completed':false}).populate([
                {path:'client', select:'accountData accountDataModel' , populate : { path:'accountData', select:'name surname phone email'}},
                {path:'budgetService', select:'repairType vehicle budget mechanicComment details', populate: {path: 'vehicle budget' }}
            ]);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro no banco de dados');
            return;
        }
        
        for(itrS of services){
            let aux = {
                serviceId : itrS._id,
                repairType: itrS.budgetService.repairType,
                clientInfo: itrS.client.accountData,
                vehicle: itrS.budgetService.vehicle,
                details: itrS.budgetService.details,
                budget: itrS.budgetService.budget,
                previousComment: itrS.budgetService.mechanicComment,
                date: itrS.date,
                time: itrS.time
            }
            auxVct.push(aux);
        }

        try {
            availablePieces = await mongoOpPecas.find({ 'quantity': {$gt : 0 } });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro no banco de dados');
            return;
        }
        console.log('Serviços sendo enviados:',auxVct);
        console.log('Peças sendo enviadas:',availablePieces);
        response.services = auxVct;
        response.availablePieces = availablePieces;
        res.status(200).send(response);
        return;
    }

}

async function createRepairService(req,res){

}

async function changeRepairServiceStatus(req,res){
    console.log('Requisição para finalização de serviço recebida.\n','Parâmetro:\n',req.params,'Corpo:\n',req.body);
    let service = {};
    try {
        service = await mongoOpRS.findById(req.params.id);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados');
    }

    for (itrP of req.body.usedPieces){
        service.usedParts.push({'part':itrP.piece._id, 'ammount':itrP.usedQuantity});
    }

    service.status = 'Serviço encerrado';
    service.completed = true;
    service.mechanicComment = req.body.mechanicComment;
    console.log('Serviço finalizado sendo salvo:');
    console.log(service);

    try {
        service.save();
        console.log('Serviço salvo!')
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados');
    }
    res.status(200).send();
    return;
}

router.use(['/repairs'], checkAuthMiddleWare);


router.route('/repairs/home')
    .get(sendRepairPage)
;

router.route('/repairs')
    .get(getRepairServices)
    .post(createRepairService)
;

router.route('/repairs/manage/:id')
    .put(changeRepairServiceStatus)
;

module.exports = router;