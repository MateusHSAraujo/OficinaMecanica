#! /bin/bash
script_file=$(mktemp)
echo "  db.pecas.deleteMany({}); \
        db.pecas.insertMany([ \
            {\
                name: 'peca1',\
                price: 100,\
                quantity: 8\
            },\
            {\
                name: 'peca2',\
                price: 50,\
                quantity: 4\
            },\
            {\
                name: 'peca3',\
                price: 25,\
                quantity: 10\
            },\
            {\
                name: 'peca4',\
                price: 80,\
                quantity: 2\
            }]);" > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"