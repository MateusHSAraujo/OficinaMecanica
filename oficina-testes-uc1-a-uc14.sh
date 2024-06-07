#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo "Digite 'l' se esse pretende abrir os testes em uma máquina linux nativa ou 'w' se pretende abrir os testes em WSL:"
read -n 1 char
echo 
if [ "$char" == "l" ]; 
    then
    bash $SCRIPTPATH/app/Scripts/cypress_linux.sh
fi
if [ "$char" == "w" ]; then
    bash $SCRIPTPATH/app/Scripts/cypress.sh
fi



