#! /bin/bash
docker exec \
 -d mongo bash \
 -c "touch aux.js && \
 echo \"db = connect('mongodb://mongo:27017/oficinaDB'); db.users.deleteMany({});db.clients.deleteMany({});\
        db.vehicles.deleteMany({});db.employees.deleteMany({});db.requisicaocomprapecas.deleteMany({});\
        db.pecas.deleteMany({}); db.budgetservices.deleteMany({}); db.orcamentos.deleteMany({});\" > aux.js; mongosh --file aux.js && rm aux.js"
echo Banco de dados resetado com sucesso!;