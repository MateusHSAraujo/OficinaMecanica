const express = require("express");
var router = express.Router();

var mongoOpUser = require('../../models/mongo').userModel;
var mongoOpClient = require('../../models/mongo').clientModel;
var mongoOpVehicle = require('../../models/mongo').vehicleModel;
var mongoOpEmployee = require('../../models/mongo').employeeModel;

function checkAuth(req) {
    cookies = req.cookies;
    console.log(cookies);
    if(!cookies || !cookies.userAuth) return false;
    cauth = cookies.userAuth;
    var content = JSON.parse(cauth);
    if(content.key == 'secret') return true;
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

async function verifyCredentials(req,res){
    console.log('Requisição post para /login: '+JSON.stringify(req.body.user));
    try {
        var user = await mongoOpUser.findOne({"username": req.body.user.username, "password": req.body.user.password});
        console.log("Resultado da busca: "+JSON.stringify(user));
        if (user == null) res.status(401).send('Nome de usuário ou senha fornecidos incorretos');   // unauthorized
        else{  
            if(user.role=='cliente'){
                console.log('Buscando registro de cliente')
                var userRegister = await mongoOpClient.findOne({'user':user._id});
            } else {
                console.log('Buscando registro de funcionário')
                var userRegister = await mongoOpEmployee.findOne({'user':user._id});
                console.log(userRegister)
            }
            var content =  {"key":"secret", "name":userRegister.name , "role":user.role, "id":user._id};
            res.cookie('userAuth', JSON.stringify(content), {'maxAge': 3600000*24*5});
            console.log('Cookies enviados!');
            res.status(200).send('/home');  // OK       
        } 
    } catch (err) {
        res.status(500).send("Falha no banco de dados");
    }
    return;
}

function logoutCurrentUser(req,res){
    if(checkAuth(req) != 'unauthorized') {
        res.clearCookie('userAuth');	 // remove cookie no cliente
        res.status(200).send('/');
        
    } else {
        res.status(401).send('Não autorizado');
    } 
    return;
}

function sendRegisterPage(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('cadastro.html', {"root": "./routes/uc1_uc2_uc3"});
}

async function registerNewClient(req,res){
    //Verifica se já existe cadastro com este cpf ou com mesmo username
    try {
        var user = await mongoOpUser.findOne({'username':req.body.user.username})
        console.log('Usuários com mesmo login encontrados: '+JSON.stringify(user));

        var register = await mongoOpClient.findOne({'cpf':req.body.userPersonalData.cpf});
        console.log('Cadastros com mesmo cpf encontrados: '+JSON.stringify(register));

        let licensePlatesToRegister = []
        for(let itrVehicle of req.body.userVehicles){
            licensePlatesToRegister.push(itrVehicle.licensePlate);
        }
        console.log('Lista temporária de carros gerada: '+JSON.stringify(licensePlatesToRegister));
        var vehiclesNumb = await mongoOpVehicle.countDocuments({'licensePlate': {'$in':licensePlatesToRegister}});
        console.log('Número de veículos com placas fornecidas encontrados no BD: '+vehiclesNumb);

    } catch (error) {
        console.log('caiu aqui');
        res.status(500).send('Erro no banco de dados!')
        return;
    }
    
    if(register != null){ //CPF já apresenta usuário cadastrado
        console.log('Cpf já cadastrado')
        res.status(403).send('Cadastro com cpf fornecido já existente. Impossível finalizar cadastramento!');
        return;
    } else if (user != null){ //Nome de usuário já em uso
        res.status(403).send('Nome de usuário já cadastrado. Escolha outro e tente novamente!');
        return;
    }
    else if (vehiclesNumb != 0){ // Algum dos veículos fornecidos já foi cadastrado
        res.status(403).send('Veículo com cadastro já existente fornecido. Impossível finalizar cadastramento de usuário!');
        return;
    }
    else { // Se nenhum dos casos acima ocorreu, o cadastramento pode ser finalizado

        //Produzindo documentos para inserção
        req.body.user.role='cliente'
        var newUserDocument = new mongoOpUser(req.body.user);
        
        req.body.userPersonalData.user = newUserDocument._id;
        var newClientDocument = new mongoOpClient(req.body.userPersonalData);
        
        newUserDocument.accountData = newClientDocument._id;
        newUserDocument.accountDataModel = 'client';

        var newVehicles = req.body.userVehicles
        for(let itrVehicle of newVehicles){
            itrVehicle.owner = newUserDocument._id;
        }
        
        console.log('Documento de usuário sendo inserido: '+JSON.stringify(newUserDocument));
        console.log('Informações de cadastro sendo inseridas: '+JSON.stringify(newClientDocument))
        console.log('Veículos sendo inseridos: '+JSON.stringify(newVehicles));

        // Salvando documento de usuário
        try {
            newUserDocument.save();
            console.log('Documento de usurário inserido com sucesso!')
        } catch(error){
            console.log('Erro durante tentativa de inserção do documento de usuário');
            console.error(error);
            res.status(500).send('Erro no banco de dados');
            return;
        }
        
        // Salvando documento de cadastro
        try{
            newClientDocument.save();
            console.log('Documento de cadastro inserido com sucesso!')
        } catch (error){
            console.log('Erro durante tentativa de inserção do documento de cadastro');
            await mongoOpUser.deleteOne({"_id":newUserDocument._id});
            console.error(error);
            res.status(500).send('Erro no banco de dados');
            return;
        }

        // Salvandos documentos de veículos
        try{
            await mongoOpVehicle.insertMany(newVehicles);
            console.log('Veículos inseridos com sucesso!')
        } catch (error) {
            console.log('Erro durante tentativa de inserção do documento de cadastro');
            console.error(error);
            await mongoOpUser.deleteOne({"_id":newUserDocument._id});
            await mongoOpClient.deleteOne({"user":newUserDocument._id});
            await mongoOpVehicle.deleteMany({"owner":newUserDocument._id});
            res.status(500).send('Erro no banco de dados');
        }

        res.status(200).send('Cadastramento relizado com sucesso!');    
    }
}

function sendHomePage(req,res){
    //Função checkAuthMiddleware garante que o usuário esteja logado
    authCookie = JSON.parse(req.cookies.userAuth)
    var path = 'home_'+authCookie.role+'.html'
    res.header('Cache-Control', 'no-cache');
    res.sendFile(path, {"root": "./routes/uc1_uc2_uc3/homes"});
}

router.use(['/home'], checkAuthMiddleWare);

router.route('/login')
    .post(verifyCredentials)
    .delete(logoutCurrentUser)
;

router.route('/register') 
    .get(sendRegisterPage)
    .post(registerNewClient)    
;

router.route('/home')
    .get(sendHomePage)
;

module.exports = router;