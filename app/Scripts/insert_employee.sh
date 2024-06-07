#! /bin/bash

# Mostra forma correta de uso
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <username> <password> <role> <name>"
    exit 1
fi

username="$1"
password="$2"
role="$3"
name="$4"

if [ "$role" != "gerente_orcamento" ] && [ "$role" != "mecanico" ] && [ "$role" != "gerente_estoque" ]; then
    echo "$role não é um papel válido."
    echo "employee roles: gerente_orcamento, mecanico, gerente_estoque."
    exit 1
fi

# Arquivo temporário com o comando
script_file=$(mktemp)
echo "newUser = db.users.insertOne({username: \"$username\", password: \"$password\", role: \"$role\",accountData: '',accountDataModel:'employee'});\
      newEmployee = db.employees.insertOne({name: \"$name\", user: newUser.insertedId, jobsRelated: 0});\
      db.users.updateOne({_id: newUser.insertedId},{\$set : {accountData : newEmployee.insertedId}});" > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"
