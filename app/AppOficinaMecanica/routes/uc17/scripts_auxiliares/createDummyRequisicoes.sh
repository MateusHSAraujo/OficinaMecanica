#! /bin/bash
script_file=$(mktemp)

echo "  db.requisicaocomprapecas.insertOne({ \
                nameMechanic: 'João', \
                namePeca: 'Coletor de Escape', \
                car: 'Palio 2011', \
                type:  'Escapamento', \
                quantity: 3 \
        }); \
        db.requisicaocomprapecas.insertOne({ \
                nameMechanic: 'Mariana', \
                namePeca: 'Vela de Ignição', \
                car: 'Gol 2003', \
                type:  'Motor', \
                quantity: 1 \
        }); \
        db.requisicaocomprapecas.insertOne({ \
                nameMechanic: 'Carlos', \
                namePeca: 'Para-lama dianteiro', \
                car: 'Onix 2007', \
                type:  'Carroceria', \
                quantity: 5 \
        });
        " > "$script_file"

# Executa o comando no mongosh
docker exec -i mongo mongosh oficinaDB < "$script_file"

# Remove o arquivo temporário
rm "$script_file"
