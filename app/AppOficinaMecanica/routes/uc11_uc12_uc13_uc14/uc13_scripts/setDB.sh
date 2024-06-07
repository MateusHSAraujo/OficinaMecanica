#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
script_file=$(mktemp)
bash $SCRIPTPATH/createClient.sh;
echo "  db.users.deleteMany({role:'mecanico'}); \
        db.employees.deleteMany({}); \
        user1 = db.users.insertOne({ \
                username: 'mecanico', \
                password: 'mecanico', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee1 = db.employees.insertOne({ \
                name: 'Mechanic1', \
                jobsRelated: 0, \
                user: user1.insertedId \
        }); \
        db.users.findOneAndUpdate({_id:user1.insertedId},{\$set : {accountData: employee1.insertedId} }); \
        db.users.deleteMany({role:'gerente_orcamento'}); \
        gerente = db.users.insertOne({ \
                        username: 'gerente', \
                        password: 'gerente', \
                        role:  'gerente_orcamento', \
                        accountDataModel: 'employee' \
                }); \
        employee = db.employees.insertOne({ \
                name: 'Gerente', \
                jobsRelated: 0, \
                user: gerente.insertedId \
        }); \
        db.users.findOneAndUpdate({_id: gerente.insertedId},{\$set : {accountData: employee.insertedId} }); \
        cliente = db.users.findOne({role:'cliente'}); \
        vehicle1 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle2 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle3 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        vehicle4 = db.vehicles.aggregate([{\$sample: {size:1}}]).toArray()[0]; \
        mecanico = db.users.findOne({role:'mecanico'}); \
        db.budgetservices.deleteMany({}); \
        db.orcamentos.deleteMany({}); \
        b1 = db.orcamentos.insertOne({ \
                status: 'Aguardando avaliação', \
                total_cost: 10 \
                }); \
        b2 = db.orcamentos.insertOne({ \
                status: 'Aguardando avaliação', \
                total_cost: 20 \
                }); \
        b3 = db.orcamentos.insertOne({ \
                status: 'Aguardando avaliação', \
                total_cost: 30 \
                }); \
        b4 = db.orcamentos.insertOne({ \
                status: 'Aguardando avaliação', \
                total_cost: 40 \
                }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico._id, \
                client: cliente._id, \
                vehicle: vehicle1._id, \
                budget: b1.insertedId ,\
                repairType: 'Pintura', \
                requestedRepair: false, \
                details: 'Pintar de preto', \
                date: '2023-10-11', \
                time: '10:30', \
                status: 'Em andamento' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico._id, \
                client: cliente._id, \
                vehicle: vehicle2._id, \
                budget: b2.insertedId, \
                repairType: 'Conserto de lataria', \
                requestedRepair: false, \
                details: 'Consertar amassado no capo', \
                date: '2023-11-04', \
                time: '15:30', \
                status: 'Em andamento' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico._id, \
                client: cliente._id, \
                vehicle: vehicle3._id, \
                budget: b3.insertedId, \
                repairType: 'Troca de peça', \
                requestedRepair: false, \
                details: 'Trocar filtro de ar-condicionado', \
                date: '2023-05-05', \
                time: '14:00', \
                status: 'Em andamento' \
        }); \
        db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico._id, \
                client: cliente._id, \
                vehicle: vehicle4._id, \
                budget: b4.insertedId, \
                status: 'Em andamento', \
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