const express = require("express");
var router = express.Router();

var mongoOpPeca = require('../../models/mongo').pecaModel;

function checkAuth(req) {
    cookies = req.cookies;
    console.log(cookies);
    if(!cookies || !cookies.userAuth) return false;
    cauth = cookies.userAuth;
    var content = JSON.parse(cauth);
    if(content.key == 'secret') return true;
    return false;
}

function checkRole(req, roleToCheck) {
    cookies = req.cookies;
    console.log(cookies);
    if(!cookies || !cookies.userAuth) return false;
    cauth = cookies.userAuth;
    var content = JSON.parse(cauth);
    if(content.role == roleToCheck) return true;
    return false;
}

function checkAuthAndRoleMiddleWare(req,res,next){
    console.log('Função de middleware para verificar autenticação de usuário invocada.')
    if(!checkAuth(req) || !checkRole(req, "gerente_estoque")){
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

function sendGerenciamentoEstoquePage(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('gerenciamento_estoque.html', {"root": "./routes/uc4_uc5"});
}

async function insertPecaIntoInventory(req,res) {
    const peca = req.body;
    const { quantity, ...filteredPeca } = peca;

    if(!checkRole(req, 'gerente_estoque')) {
        console.log('Usuário não autenticado, retornando erro.')
        res.header('Cache-Control', 'no-cache');
        res.status(401)
        res.sendFile('acesso_negado.html', {"root": "./public/pages"});
        return;
    }

    try {
        // Procura uma peça igual já em estoque
        var pecaInInventory = await mongoOpPeca.findOne(filteredPeca)
    }
    catch (error) {
        res.status(500).send('Erro no banco de dados ao procurar se já existem peças iguais no estoque.')
        return;
    }

    // Se já estiver presente
    if(pecaInInventory!=null) {
        try {
            await mongoOpPeca.findOneAndUpdate(filteredPeca, {$inc: {'quantity': quantity}})
        }
        catch (error) {
            res.status(500).send('Erro no banco de dados ao atualizar a quantidade da peça.')
            return;
        }
    }
    else { // Peça diferente das demais
        try {
            let newPecaDocument = new mongoOpPeca(peca);
            await newPecaDocument.save();
        }
        catch (error) {
            res.status(500).send('Erro no banco de dados ao inserir a nova peça.')
            return;
        }
    }

    try {
        let newPecas = await mongoOpPeca.find({});
        res.status(200).send(newPecas)
        return;
    }
    catch (error) {
        res.status(500).send('Erro lendo as peças no banco de dados.')
        return;
    }
}

router.use(['/gerenciamento_estoque'], checkAuthAndRoleMiddleWare);

router.route('/gerenciamento_estoque')
    .get(sendGerenciamentoEstoquePage)
;

// verificação de autenticação feita no caso de uso de visualização
router.route('/estoque')
    .post(insertPecaIntoInventory)
;

module.exports = router;
