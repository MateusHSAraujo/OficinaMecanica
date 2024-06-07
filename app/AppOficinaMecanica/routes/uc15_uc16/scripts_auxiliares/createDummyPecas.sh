#! /bin/bash
script_file=$(mktemp)

echo "  db.pecas.insertOne({ \
                name: 'Coletor de Escape', \
                car: 'Palio 2011', \
                type:  'Escapamento', \
                price: 644.40, \
                quantity: 3 \
        }); \
        db.pecas.insertOne({ \
                name: 'Vela de Ignição', \
                car: 'Gol 2003', \
                type:  'Motor', \
                price: 72.81, \
                quantity: 1 \
        }); \
        db.pecas.insertOne({ \
                name: 'Para-lama dianteiro', \
                car: 'Onix 2007', \
                type:  'Carroceria', \
                price: 303.86, \
                quantity: 5 \
        });
        " > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"
