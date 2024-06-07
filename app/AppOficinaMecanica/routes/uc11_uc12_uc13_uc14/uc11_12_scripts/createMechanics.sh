#! /bin/bash
script_file=$(mktemp)
echo "  db.users.deleteMany({role:'mecanico'}); \
        db.employees.deleteMany({}); \
        user1 = db.users.insertOne({ \
                username: 'mechanic1', \
                password: 'mechanic1', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee1 = db.employees.insertOne({ \
                name: 'Cláudio', \
                jobsRelated: 0, \
                user: user1.insertedId \
        }); \
        user2 = db.users.insertOne({ \
                username: 'mechanic2', \
                password: 'mechanic2', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee2 = db.employees.insertOne({ \
                name: 'Mechanic2', \
                jobsRelated: 0, \
                user: user2.insertedId \
        }); \
        user3 = db.users.insertOne({ \
                username: 'mechanic3', \
                password: 'mechanic3', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee3 = db.employees.insertOne({ \
                name: 'Mechanic3', \
                jobsRelated: 0, \
                user: user3.insertedId \
        }); \
        user4 = db.users.insertOne({ \
                username: 'mechanic4', \
                password: 'mechanic4', \
                role:  'mecanico', \
                accountDataModel: 'employee' \
        }); \
        employee4 = db.employees.insertOne({ \
                name: 'Mechanic4', \
                jobsRelated: 0, \
                user: user4.insertedId \
        }); \
        db.users.findOneAndUpdate({_id:user1.insertedId},{\$set : {accountData: employee1.insertedId} }); \
        db.users.findOneAndUpdate({_id:user2.insertedId},{\$set : {accountData: employee2.insertedId} }); \
        db.users.findOneAndUpdate({_id:user3.insertedId},{\$set : {accountData: employee3.insertedId} }); \
        db.users.findOneAndUpdate({_id:user4.insertedId},{\$set : {accountData: employee4.insertedId} }); " > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"
        