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
    if(!checkAuth(req) || (!checkRole(req, "gerente_estoque") && !checkRole(req, "mecanico"))){
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

function sendVisualizacaoEstoqueComponent(req,res){
    res.header('Cache-Control', 'no-cache');
    res.header('content-type', 'application/javascript');
    res.sendFile('visualizacao_estoque_component.js', {"root": "./routes/uc6_uc7_uc8"});
}

async function sendPecas(req,res) {
    try {
        let pecas = await mongoOpPeca.find({});
        res.status(200).send(pecas)
        return;
    }
    catch (error) {
        res.status(500).send('Erro lendo as peças no banco de dados.')
        return;
    }
}

async function atualizaPeca(req,res) {
    const newInfo = req.body;
    const id = req.params.id;
    const query = {'_id': id};

    if(!checkRole(req, 'gerente_estoque')) {
        console.log('Usuário não autenticado, retornando erro.')
        res.header('Cache-Control', 'no-cache');
        res.status(401)
        res.sendFile('acesso_negado.html', {"root": "./public/pages"});
        return;
    }

    try {
        var pecaAtualiza = await mongoOpPeca.findOne(query);
    }
    catch (error) {
        res.status(500).send('Peça não encontrada no banco de dados.');
        return;
    }

    try {
        await mongoOpPeca.findOneAndUpdate(query, newInfo);
    }
    catch (error) {
        res.status(500).send('Erro ao atualizar a peça no banco de dados.');
        return;
    }

    sendPecas(req,res);
}

async function retiraPeca(req,res) {
    const quantity = Number(req.body.quantity);
    const id = req.params.id;
    const query = {'_id': id};

    try {
        var pecaRetira = await mongoOpPeca.findOne(query);
    }
    catch (error) {
        res.status(500).send('Erro ao procurar a peça no banco de dados.')
        return;
    }

    if(pecaRetira == null) {
        res.status(409).send('A peça não existe no banco de dados.')
        return;
    }

    if(pecaRetira.quantity > quantity) {
        try {
            await mongoOpPeca.findOneAndUpdate(query, {$inc: {'quantity': -quantity}})
        }
        catch (error) {
            res.status(500).send('Erro ao atualizar a quantidade da peça no banco de dados.')
            return;
        }
    }
    else if(pecaRetira.quantity == quantity) {
        try {
            await mongoOpPeca.findOneAndDelete(query)
        }
        catch (error) {
            res.status(500).send('Erro ao remover a peça do banco de dados.')
            return;
        }
    }
    else {
        res.status(409).send('A quantidade requisitada não está disponível.')
        return;
    }

    sendPecas(req, res);
}

router.use(['/visualizacao_estoque_component.js', '/estoque'], checkAuthAndRoleMiddleWare);

router.route('/visualizacao_estoque_component.js')
    .get(sendVisualizacaoEstoqueComponent)
;

router.route('/estoque')
    .get(sendPecas)
;

router.route('/estoque/:id')
    .put(atualizaPeca)
    .delete(retiraPeca)
;

module.exports = router;
