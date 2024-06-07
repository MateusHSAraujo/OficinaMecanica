#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
script_file=$(mktemp)
bash $SCRIPTPATH/createClient.sh;
bash $SCRIPTPATH/createMechanics.sh;
echo "  db.users.deleteMany({role:'gerente_orcamento'}); \
        gerente = db.users.insertOne({ \
                        username: 'gerente', \
                        password: 'gerente', \
                        role:  'gerente_orcamento', \
                        accountDataModel: 'employee' \
                }); \
        employee = db.employees.insertOne({ \
                name: 'Rodrigo', \
                jobsRelated: 0, \
                user: gerente.insertedId \
        }); \
        db.users.findOneAndUpdate({_id: gerente.insertedId},{\$set : {accountData: employee.insertedId} }); \
        cliente = db.users.findOne({role:'cliente'}); \
        vehicle1 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle2 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle3 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle4 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        mecanico1 = db.users.aggregate([{\$match: {role:'mecanico'}},{\$sample: {size:1}}]).toArray()[0]; \
        mecanico2 = db.users.aggregate([{\$match: {role:'mecanico'}},{\$sample: {size:1}}]).toArray()[0]; \
        mecanico3 = db.users.aggregate([{\$match: {role:'mecanico'}},{\$sample: {size:1}}]).toArray()[0]; \
        db.budgetservices.deleteMany({}); \
        db.orcamentos.deleteMany({}); \
        b1 = db.orcamentos.insertOne({ \
                status: 'Aprovação pendente', \
                total_cost: 10 \
                }); \
        b2 = db.orcamentos.insertOne({ \
                status: 'Rejeição pendente', \
                total_cost: 20 \
                }); \
        b3 = db.orcamentos.insertOne({ \
                status: 'Aprovado', \
                total_cost: 30 \
                }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico1._id, \
                client: cliente._id, \
                vehicle: vehicle1._id, \
                budget: b1.insertedId ,\
                repairType: 'Pintura', \
                requestedRepair: false, \
                details: 'Pintar de preto', \
                date: '2023-10-11', \
                time: '10:30', \
                status: 'Avaliação finalizada' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico2._id, \
                client: cliente._id, \
                vehicle: vehicle2._id, \
                budget: b2.insertedId, \
                repairType: 'Conserto de lataria', \
                requestedRepair: false, \
                details: 'Consertar amassado no capo', \
                date: '2023-11-04', \
                time: '15:30', \
                status: 'Avaliação finalizada' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico3._id, \
                client: cliente._id, \
                vehicle: vehicle3._id, \
                budget: b3.insertedId, \
                repairType: 'Troca de peça', \
                requestedRepair: false, \
                details: 'Trocar filtro de ar-condicionado', \
                date: '2023-05-05', \
                time: '14:00', \
                status: 'Serviço encerrado' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                client: cliente._id, \
                vehicle: vehicle4._id, \
                status: 'Solicitação de serviço enviada', \
                repairType: 'Outro', \
                requestedRepair: false, \
                details: 'Consertar barulho estranho do motor', \
                date: '2023-11-15', \
                time: '16:30' \
                });" > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"