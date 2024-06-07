#! /bin/bash
# Script para iniciar o servidor dentro do container do node.js
docker exec -d node.js bash -c "cd AppOficinaMecanica && npm start"