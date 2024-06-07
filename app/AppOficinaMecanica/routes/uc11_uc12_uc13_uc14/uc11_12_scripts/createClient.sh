#! /bin/bash
script_file=$(mktemp)
echo "  db.users.deleteMany({role:'cliente'}); \
        db.clients.deleteMany({}); \
        db.vehicles.deleteMany({}); \
        user1 = db.users.insertOne({ \
                username: 'dummy1', \
                password: 'dummy1', \
                role:  'cliente', \
                accountDataModel: 'client' \
        }); \
        client1 = db.clients.insertOne({ \
                name: 'José', \
                surname: 'Carlos', \
                cpf: '11122233344', \
                cep: '77889955', \
                email: 'dummy@gmail.com', \
                address: 'street abc', \
                birthday: '2000-05-05', \
                phone: '89858486251', \
                user: user1.insertedId \
        }); \
        db.users.findOneAndUpdate({_id:user1.insertedId},{\$set : {accountData: client1.insertedId} }); \
        vehicle1 = db.vehicles.insertOne({ \
            licensePlate: 'BRA0S19', \
            year: '2020', \
            model: 'Pegout 208', \
            owner: user1.insertedId \
        }); \
        vehicle2 = db.vehicles.insertOne({ \
            licensePlate: 'AAA0B22', \
            year: '2000', \
            model: 'Savero', \
            owner: user1.insertedId \
        }); \
        vehicle3 = db.vehicles.insertOne({ \
            licensePlate: 'CCC0D44', \
            year: '2010', \
            model: 'Celta', \
            owner: user1.insertedId \
        }); " > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"