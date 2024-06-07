const express = require("express");

var router = express.Router();
var mongoOpUser = require('../../models/mongo').userModel;
var mongoOpVehicle = require('../../models/mongo').vehicleModel;
var mongoOpBS = require('../../models/mongo').budgetServiceModel;
var mongoOpOcamento = require('../../models/mongo').orcamentoModel;


function checkAuth(req) {
    cookies = req.cookies;
    console.log(cookies);
    if(!cookies || !cookies.userAuth) return false;
    cauth = cookies.userAuth;
    var content = JSON.parse(cauth);
    if(content.key == 'secret' && (content.role =='mecanico' || content.role=='cliente' || content.role=='gerente_orcamento')) return true;
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

function sendBudgetPage(req,res){
    console.log('Requisição para envio de página de orçamento recebida');
    cookieContent = JSON.parse(req.cookies.userAuth);
    console.log('Informações de cookie : '+ JSON.stringify(cookieContent));
    res.header('Cache-Control', 'no-cache');
    if (cookieContent.role == 'cliente')  res.sendFile('orcamentos_cliente.html', {"root": "./routes/uc11_uc12_uc13_uc14"});
    else if (cookieContent.role == 'mecanico')  res.sendFile('orcamentos_mecanico.html', {"root": "./routes/uc11_uc12_uc13_uc14"});
    else if (cookieContent.role == 'gerente_orcamento')  res.sendFile('orcamentos_gerente.html', {"root": "./routes/uc11_uc12_uc13_uc14"});
}

async function createBudgetService(req,res){
    console.log('Requisição para geração de novo serviço de orçamento recebida');
    console.log('Dados de requisição: '+JSON.stringify(req.body.newBS));

    var clientUserID = JSON.parse(req.cookies.userAuth).id;
    req.body.newBS.client = clientUserID; // Definido o atributo client
        
    var availableManagers = await mongoOpUser.find({'role':'gerente_orcamento'}).populate('accountData');
    console.log('Gerentes de orçamento encontrados: '+JSON.stringify(availableManagers));
    if (availableManagers.length==0){
        res.status(500).send('Nenhum gerente disponível no banco de dados.');
        return;
    } 
    availableManagers.sort((a,b)=>{return a.accountData.activeJobs - b.accountData.activeJobs});
    
    var selectedManager = availableManagers[0];

    req.body.newBS.requestedRepair = false;
    req.body.newBS.budgetManager = selectedManager._id; // Definido o atributo budgetManager
    req.body.newBS.status = 'Solicitação de serviço enviada';    // Definido o atributo status
    var newBSDocument = new mongoOpBS(req.body.newBS);  // Os atributos restantes são enviados pela requisição
    console.log('Solicitação sendo salva: '+JSON.stringify(newBSDocument));
    selectedManager.accountData.activeJobs+=1;

    try {
        newBSDocument.save();
        selectedManager.save();
        
    } catch (error){
        console.error(error);
        res.status(500).send('Erro durante salvamento de novo serviço.');
        return;
    }
    res.status(200).send('Serviço solicitado com sucesso.');
}

async function sendBudgetServices(req,res){
    console.log('Requisição para envio de serviços cadastrados recebida');
    
    var cookieContent = JSON.parse(req.cookies.userAuth);
    var role = cookieContent.role;
    var userId = cookieContent.id;
    console.log('ID de usuário: '+userId);
    var services=[], clientInfo;
    let auxVct=[];
    switch (role){
        case 'cliente':
            try{
                services = await mongoOpBS.find({'client':userId})
                    .populate([
                        {path:'mechanic', populate : { path:'accountData', model:'employee' } },
                        {path:'budgetManager', populate: { path: 'accountData', model:'employee' } },
                        {path:'vehicle'},
                        {path:'budget'}
                    ]);
                
            } catch(err){
                console.error(err);
                res.status(500).send('Erro no banco de dados.')
            }
            for (let itrS of services){             
                let tmp = {
                    'repairType': itrS.repairType,
                    'requestedRepair': itrS.requestedRepair,
                    'date': itrS.date,
                    'time': itrS.time,
                    'serviceId': itrS._id,
                    'serviceStatus': itrS.status,
                    'budgetManagerName': itrS.budgetManager.accountData.name,
                    'mechanicName': (itrS.mechanic==undefined)? '--':itrS.mechanic.accountData.name,
                    'budget': itrS.budget,
                    'vehicle':itrS.vehicle
                }
                auxVct.push(tmp);
            }
            console.log('Objeto sendo enviado: '+JSON.stringify(auxVct));
            res.status(200).send(auxVct);
            return;
        
        case 'mecanico':
            try{
                services = await mongoOpBS.find({'mechanic':userId, 'status':'Em andamento'}).populate([
                        {path:'client', populate : { path:'accountData', model:'client' } },
                        {path:'budgetManager', populate: { path: 'accountData', model:'employee' } },
                        {path:'vehicle'},
                        {path:'budget'}
                    ]);
            } catch(err){
                console.error(err);
                res.status(500).send('Erro no banco de dados.')
                return;
            }
            console.log(services);

            for (let itrS of services){
                clientInfo = {'name': itrS.client.accountData.name+' '+itrS.client.accountData.surname,
                              'phone': itrS.client.accountData.phone,
                               'email': itrS.client.accountData.email  };
                let tmp = {
                    'repairType': itrS.repairType,
                    'date': itrS.date,
                    'time': itrS.time,
                    'details': itrS.details,
                    'serviceId': itrS._id,
                    'client': clientInfo,
                    'serviceStatus': itrS.status,
                    'budgetManager': itrS.budgetManager.accountData.name,
                    'budget': itrS.budget,
                    'vehicle':itrS.vehicle
                }
                auxVct.push(tmp);
            }
            console.log('Resposta sendo enviada:');
            console.log(auxVct);
            res.status(200).send(auxVct);
            return;
        
        case 'gerente_orcamento':
            let response = {};
            try{
                services = await mongoOpBS.find({'budgetManager':userId}).populate([
                    {path:'client', populate : { path:'accountData'}},
                    {path:'mechanic', populate: { path: 'accountData'}},
                    {path:'vehicle'},
                    {path:'budget'}
                ]);
            } catch(err){
                console.error(err);
                res.status(500).send('Erro no banco de dados.');
                return;
            }
            console.log('Serviços:',services)
            for (let itrS of services){
                
                clientInfo = {'name': itrS.client.accountData.name+' '+itrS.client.accountData.surname,
                              'phone': itrS.client.accountData.phone,
                               'email': itrS.client.accountData.email  };
                let tmp = {
                    'repairType': itrS.repairType,
                    'date': itrS.date,
                    'time': itrS.time,
                    'details': itrS.details,
                    'serviceId': itrS._id,
                    'serviceStatus': itrS.status,
                    'client': clientInfo,
                    'mechanic': (itrS.mechanic==undefined)?  "--":itrS.mechanic.accountData.name,
                    'budget': itrS.budget,
                    'vehicle':itrS.vehicle
                }
                auxVct.push(tmp);
            }
            response.personalBS = auxVct;
            
            let mechanics
            try {
                mechanics = await mongoOpUser.find({'role':'mecanico'}).populate('accountData');
            } catch (error) {
                console.error(error);
                res.status(500).send('Erro no banco de dados');
                return;
            }
            
            response.availableMechanics = [];
            for (itrM of mechanics){
                response.availableMechanics.push({
                    'id':itrM._id,
                    'name':itrM.accountData.name
                });
            }

            res.status(200).send(response);
            return;
    }

}

async function changeBudgetServiceStatus(req,res){
    console.log('Requisição para mudança de status de requisição recebida');
    console.log('Parametros: '+JSON.stringify(req.params));
    console.log('Corpo: '+JSON.stringify(req.body));

    let service;
    try {
        service = await mongoOpBS.findById(req.params.id);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados.');
        return;
    }
    /*Chamada quando o gerente de orçamento da início a um novo serviço de orçamento*/
    if (service.status == 'Solicitação de serviço enviada') initiateNewBSService(service,req,res);
    
    /*Chamada quando o mecânico executa um serviço de orçamento*/
    else if (service.status == 'Em andamento') completeMechanicAvaliation(service,req,res);
    
    /*Chamada quando o gerente de orçamente aprova ou rejeita um serviço finalizado*/
    else if(service.status == 'Avaliação finalizada') terminateService(service,req,res); 

    console.log(service);
    return;
}

async function initiateNewBSService(service,req,res){
    service.status = 'Em andamento';
    await service.populate( { path:'client', populate : { path:'accountData'} });
    console.log('Corpo da requisição:'+ JSON.stringify(req.body))
    let newOrcamento = new mongoOpOcamento({
        "total_cost": req.body.initialPrice,
        "status": 'Aguardando avaliação'
    });

    service.budget = newOrcamento._id;
    console.log('Novo orcamento gerado:'+JSON.stringify(newOrcamento));
    
    let selectedMechanic;
    if (req.body.mechanic == ''){
        var availableMechanics = await mongoOpUser.find({'role':'mecanico'}).populate('accountData');
        console.log('Mecanicos encontrados: '+JSON.stringify(availableMechanics));
        if (availableMechanics.length==0){
            res.status(500).send('Nenhum mecânico disponível no momento.');
            return;
        } 
        availableMechanics.sort((a,b)=>{return a.accountData.activeJobs - b.accountData.activeJobs});
        
        selectedMechanic = availableMechanics[0];
    } else{
        selectedMechanic = await mongoOpUser.findById(req.body.mechanic); 
    }

    service.mechanic = selectedMechanic._id;
    service.requestedDriver = false;
    try {
        newOrcamento.save();
        service.save();
        res.status(200).send('Serviço iniciado com sucesso!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados.');
    }

    return;
}

/*Chamada quando o mecânico executa um serviço de orçamento*/
async function completeMechanicAvaliation(service,req,res){
    let budget = await mongoOpOcamento.findOne({_id : service.budget});
    
    service.status = 'Avaliação finalizada';
    if (req.body.doable==true){
        budget.service_cost = req.body.handworkPrice;
        budget.parts_cost = req.body.partsPrice;
        budget.total_cost += budget.service_cost + budget.parts_cost;
        budget.status = 'Aprovação pendente'
    } else{
        budget.status = 'Rejeição pendente'
    }
    
    service.mechanicComment = req.body.comments;
    console.log('Elementos sendo salvos:')
    console.log(service,budget);

    try {
        service.save()
        budget.save()
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados');
    }
    return;
}

/*Chamada quando o gerente de orçamento aprova ou rejeita um serviço finalizado*/
async function terminateService(service,req,res){
    let budget = await mongoOpOcamento.findOne({_id : service.budget});
    service.status = 'Serviço encerrado';
    if(req.body.result=='aproved'){
        budget.status = 'Aprovado';
        try {
            service.save()
            budget.save()
            res.status(200).send('Serviço aprovado com sucesso!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro no banco de dados.');
        }

    } else{
        if (budget.status=='Aprovação pendente'){
            service.budgetManagerComment = req.body.budgetManagerComment;
        }
        budget.status = 'Rejeitado';

        try {
            service.save()
            budget.save()
            res.status(200).send('Serviço aprovado com sucesso!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro no banco de dados.');
        }
    }
}

async function deleteBudgetService(req,res){
    console.log("Requisição de deleção recebida para id "+JSON.stringify(req.params));

    try {
        let service = await mongoOpBS.findOneAndDelete({ "_id":req.params.id});
        console.log("Serviço deletado: "+JSON.stringify(service));
        let budget = await mongoOpOcamento.findOneAndDelete({"_id":service.budget});
        console.log("Orçamento deletado: "+JSON.stringify(budget));
        res.status(200).send('Serviço deletado com sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no banco de dados')
    }
}

async function sendClientVehicles(req,res){
    var cookieContent = JSON.parse(req.cookies.userAuth);
    if (cookieContent.role != 'cliente') res.status(401).send('Usuário sem autorização para realizar esta operação');
    else{
        var userVehicles = await mongoOpVehicle.find({"owner":cookieContent.id});
        console.log('Veículos do usuário: '+JSON.stringify(userVehicles));
        var vehiclesList =[];
        for (let itrVehicle of userVehicles){
            vehiclesList.push({
                                'licensePlate':itrVehicle.licensePlate ,
                                'year':itrVehicle.year ,
                                'model':itrVehicle.model ,
                                'id':itrVehicle.id
                            });
        }
        console.log('Veículos enviados: '+JSON.stringify(vehiclesList));
        res.status(200).send(JSON.stringify(vehiclesList));
    }
}

async function getAvailableTime(req,res){
    console.log("Requisição para verificação de disponibilidade de horário recebida");
    console.log("Data: "+JSON.stringify(req.body));
    let budgetServices = await mongoOpBS.find({"date":req.body.date});
    console.log("Requisições de serviço encontradas no mesmo dia: "+JSON.stringify(budgetServices));
    
    let possibleHours = []
    for(let i =9; i<=18;i++){
        possibleHours.push((((i/10)<1)? ('0'+i):(''+i))+':00')
        possibleHours.push((((i/10)<1)? ('0'+i):(''+i))+':30')
    }
    for (let itrBS of budgetServices){
        let idx = possibleHours.indexOf(itrBS.time);
        possibleHours.splice(idx,1);
    }
    console.log('Horários disponíveis: '+JSON.stringify(possibleHours));
    res.status(200).send(JSON.stringify(possibleHours));
}

router.use(['/budget'], checkAuthMiddleWare);

router.route('/budget/home')
    .get(sendBudgetPage)
;

router.route('/budget')
    .get(sendBudgetServices)
    .post(createBudgetService)
;

router.route('/budget/info')
    .get(sendClientVehicles)
    .post(getAvailableTime)
;

router.route('/budget/manage/:id')
    .put(changeBudgetServiceStatus)
    .delete(deleteBudgetService)
;

module.exports = router;