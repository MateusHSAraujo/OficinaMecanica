#! /bin/bash
# Script para iniciar o container do MongoDB
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
docker run \
-it \
--name mongo \
--rm \
-d \
-v ${SCRIPTPATH}/../MongoDB:/data/db \
-h mongo \
--net=ea202 \
mongo:latest
