const express = require("express");
var router = express.Router();

var mongoOpPeca = require('../../models/mongo').pecaModel;
var mongoOpRequisicao = require('../../models/mongo').requisicaoCompraPeca;

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

function checkAuthAndRoleMiddleWareRestrict(req,res,next){
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

function sendRequisicoesCompraPecaPage(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('requisicoes_peca.html', {"root": "./routes/uc17"});
}

async function sendRequisicoes(req,res) {
    try {
        let requisicoes = await mongoOpRequisicao.find({});
        res.status(200).send(requisicoes)
        return;
    }
    catch (error) {
        res.status(500).send('Erro lendo as requisições no banco de dados.')
        return;
    }
}

async function deletaRequisicao(req,res) {
    const id = req.params.id;
    const query = {'_id': id};

    try {
        var requisicao = await mongoOpRequisicao.findOne(query);
    }
    catch (error) {
        res.status(500).send('Erro ao buscar a requisição no banco de dados.');
        return;
    }

    if(requisicao == null) {
        res.status(409).send('A requisição não existe no banco de dados.');
        return;
    }

    try {
        await mongoOpRequisicao.findOneAndDelete(query);
    }
    catch (error) {
        res.status(500).send('Erro ao excluir a requisição no banco de dados.');
        return;
    }

    sendRequisicoes(req,res);
}

async function concluiRequisicao(req,res) {
    const price = req.body.price;
    const id = req.params.id;
    const query = {'_id': id};

    try {
        var requisicao = await mongoOpRequisicao.findOne(query);
    }
    catch (error) {
        res.status(500).send('Erro ao buscar a requisição no banco de dados.');
        return;
    }

    if(requisicao == null) {
        res.status(409).send('A requisição não existe no banco de dados.');
        return;
    }

    try {
        await mongoOpRequisicao.findOneAndDelete(query);
    }
    catch (error) {
        res.status(500).send('Erro ao remover a requisição do banco de dados.');
        return;
    }

    //recria a requisicao para caso dê erro, pois precisa colocar de volta
    let newRequisicaoDocument = new mongoOpRequisicao({
        nameMechanic: requisicao.nameMechanic,
        namePeca: requisicao.namePeca,
        car: requisicao.car,
        type: requisicao.type,
        quantity: requisicao.quantity
    });

    const peca = {
        name: requisicao.namePeca,
        car: requisicao.car,
        type: requisicao.type,
        price: price,
        quantity: requisicao.quantity
    };
    const { quantity, ...filteredPeca } = peca;

    try {
        // Procura uma peça igual já em estoque
        var pecaInInventory = await mongoOpPeca.findOne(filteredPeca)
    }
    catch (error) {
        res.status(500).send('Erro no banco de dados ao procurar se já existem peças iguais no estoque.')
        await newRequisicaoDocument.save();
        return;
    }

    // Se já estiver presente
    if(pecaInInventory!=null) {
        try {
            await mongoOpPeca.findOneAndUpdate(filteredPeca, {$inc: {'quantity': quantity}})
        }
        catch (error) {
            res.status(500).send('Erro no banco de dados ao atualizar a quantidade da peça.')
            await newRequisicaoDocument.save();
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
            await newRequisicaoDocument.save();
            return;
        }
    }

    sendRequisicoes(req,res);
}

router.use(['/requisicoes_peca/requisicao_compra_peca'], checkAuthAndRoleMiddleWare);
router.use(['/requisicao_compra_peca/:id'], checkAuthAndRoleMiddleWareRestrict);

router.route('/requisicoes_peca')
    .get(sendRequisicoesCompraPecaPage)
;

router.route('/requisicao_compra_peca')
    .get(sendRequisicoes)
;

router.route('/requisicao_compra_peca/:id')
    .post(concluiRequisicao)
    .delete(deletaRequisicao)
;

module.exports = router;
