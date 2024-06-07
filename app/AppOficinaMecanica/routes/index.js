var express = require('express');
var router = express.Router();

var userRouter = require('./uc1_uc2_uc3/user');
var budgetRouter = require('./uc11_uc12_uc13_uc14/budget');
var repairRouter = require('./uc11_uc12_uc13_uc14/repair');

var gerenciamentoEstoqueRouter = require('./uc4_uc5/gerenciamento_estoque');
var visualizacaoEstoqueRouter = require('./uc6_uc7_uc8/visualizacao_estoque');
var buscaPecasRouter = require('./uc15_uc16/busca_pecas');
var requisicoesCompraPecaRouter = require('./uc17/requisicoes_compra_peca');
var reparoRouter = require('./uc9_uc10/servico_de_reparo');
var motoristaRouter = require('./uc9_uc10/servico_de_motorista');


function sendIndexPage(req, res, next) {
  res.header('Cache-Control', 'no-cache');
  res.sendFile('index.html', {"root": "./routes/uc1_uc2_uc3/"});
}

router.get('/', sendIndexPage);

router.use('/',userRouter);
router.use('/',budgetRouter);
router.use('/',repairRouter);

router.use('/',gerenciamentoEstoqueRouter);
router.use('/',visualizacaoEstoqueRouter);
router.use('/',buscaPecasRouter);
router.use('/',requisicoesCompraPecaRouter);
router.use('/',requisicoesCompraPecaRouter);
router.use('/',reparoRouter);
router.use('/',motoristaRouter);


module.exports = router;
