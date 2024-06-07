#! /bin/bash
# Script para iniciar o servidor
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo Gerando network...
docker network create ea202
echo Iniciando containers...
bash $SCRIPTPATH/mongo.sh
bash $SCRIPTPATH/node.sh
echo Iniciando servidor...
bash $SCRIPTPATH/start.sh
echo Servidor em funcionamento no url: http://localhost:3000/
