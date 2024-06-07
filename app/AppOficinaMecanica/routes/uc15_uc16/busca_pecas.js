const express = require("express");
var router = express.Router();

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
    if(!checkAuth(req) || !checkRole(req, "mecanico")){
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

function sendBuscaPecasPage(req,res){
    res.header('Cache-Control', 'no-cache');
    res.sendFile('busca_pecas.html', {"root": "./routes/uc15_uc16"});
}

async function createRequisicao(req,res) {
    const requisicao = req.body;

    try {
        let newRequisicaoDocument = new mongoOpRequisicao(requisicao);
        
        await newRequisicaoDocument.save();
    }
    catch (error) {
        res.status(500).send('Erro no banco de dados ao inserir a nova requisição.')
        return;
    }

    res.status(200).send();
}

router.use(['/busca_pecas'], checkAuthAndRoleMiddleWare);

router.route('/requisicao_compra_peca')
    .post(createRequisicao)
;

router.route('/busca_pecas')
    .get(sendBuscaPecasPage)
;

module.exports = router;
