#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
script_file=$(mktemp)
bash $SCRIPTPATH/createClient.sh;
bash $SCRIPTPATH/createPieces.sh;
echo "  db.users.deleteMany({role:'mecanico'}); \
        db.employees.deleteMany({}); \
        mecanico = db.users.insertOne({ \
                username: 'mecanico', \
                password: 'mecanico', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee1 = db.employees.insertOne({ \
                name: 'Mechanic1', \
                jobsRelated: 0, \
                user: mecanico.insertedId \
        }); \
        db.users.findOneAndUpdate({_id:mecanico.insertedId},{\$set : {accountData: employee1.insertedId} }); \
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
        db.repairservices.deleteMany({}); \
        db.budgetservices.deleteMany({}); \
        db.orcamentos.deleteMany({}); \
        b1 = db.orcamentos.insertOne({ \
                status: 'Aprovado', \
                total_cost: 100, \
                parts_cost: 50, \
                service_cost: 50 \
                }); \
        b2 = db.orcamentos.insertOne({ \
                status: 'Aprovado', \
                total_cost: 200, \
                parts_cost: 150, \
                service_cost: 50 \
                }); \
        b3 = db.orcamentos.insertOne({ \
                status: 'Aprovado', \
                total_cost: 300, \
                parts_cost: 250, \
                service_cost: 50 \
                }); \
        b4 = db.orcamentos.insertOne({ \
                status: 'Aprovado', \
                total_cost: 400, \
                parts_cost: 250, \
                service_cost: 150 \
                }); \
        bs1= db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico.insertedId, \
                client: cliente._id, \
                vehicle: vehicle1._id, \
                budget: b1.insertedId ,\
                repairType: 'Pintura', \
                requestedRepair: true, \
                details: 'Pintar de preto', \
                date: '2023-10-11', \
                time: '10:30', \
                status: 'Serviço encerrado', \
                mechanicComment: 'Serviço pode ser executado sem maiores problemas' \
        }); \
        bs2 = db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico.insertedId, \
                client: cliente._id, \
                vehicle: vehicle2._id, \
                budget: b2.insertedId, \
                repairType: 'Conserto de lataria', \
                requestedRepair: true, \
                details: 'Consertar amassado no capo', \
                date: '2023-11-04', \
                time: '15:30', \
                status: 'Serviço encerrado', \
                mechanicComment: 'Serviço pode ser executado sem maiores problemas' \
        }); \
        bs3 = db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico.insertedId, \
                client: cliente._id, \
                vehicle: vehicle3._id, \
                budget: b3.insertedId, \
                repairType: 'Troca de peça', \
                requestedRepair: true, \
                details: 'Trocar filtro de ar-condicionado', \
                date: '2023-05-05', \
                time: '14:00', \
                status: 'Serviço encerrado', \
                mechanicComment: 'Serviço pode ser executado sem maiores problemas' \
        }); \
        bs4 = db.budgetservices.insertOne({ \
                budgetManager: gerente.insertedId, \
                mechanic: mecanico.insertedId, \
                client: cliente._id, \
                vehicle: vehicle4._id, \
                budget: b4.insertedId, \
                status: 'Em andamento', \
                repairType: 'Outro', \
                requestedRepair: true, \
                details: 'Consertar barulho estranho do motor', \
                date: '2023-11-15', \
                time: '16:30', \
                status: 'Serviço encerrado', \
                mechanicComment: 'Serviço pode ser executado sem maiores problemas' \
        }); \
        db.repairservices.insertOne({ \
                client: cliente._id, \
                mechanic: mecanico.insertedId, \
                budgetService: bs1.insertedId, \
                status: 'Em andamento', \
                date: '2023-11-20', \
                time: '14:30', \
                completed: false \
        });
        db.repairservices.insertOne({ \
                client: cliente._id, \
                mechanic: mecanico.insertedId, \
                budgetService: bs2.insertedId, \
                status: 'Em andamento', \
                date: '2023-11-21', \
                time: '15:30', \
                completed: false \
        }); \
        db.repairservices.insertOne({ \
                client: cliente._id, \
                mechanic: mecanico.insertedId, \
                budgetService: bs3.insertedId, \
                status: 'Em andamento', \
                date: '2023-11-22', \
                time: '16:30', \
                completed: false \
        }); \
        db.repairservices.insertOne({ \
                client: cliente._id, \
                mechanic: mecanico.insertedId, \
                budgetService: bs4.insertedId, \
                status: 'Em andamento', \
                date: '2023-11-23', \
                time: '17:30', \
                completed: false
        }); " > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"