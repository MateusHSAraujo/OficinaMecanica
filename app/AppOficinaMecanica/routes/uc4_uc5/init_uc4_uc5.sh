#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
bash $SCRIPTPATH/scripts_auxiliares/server.sh
echo Limpando banco de dados
bash $SCRIPTPATH/scripts_auxiliares/resetBD.sh
echo Criando Gerente de Estoque
bash $SCRIPTPATH/scripts_auxiliares/createGerenteEstoque.sh
echo Criando Peças dummy
bash $SCRIPTPATH/scripts_auxiliares/createDummyPecas.sh
