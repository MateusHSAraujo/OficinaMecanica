#! /bin/bash
#xhost +
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
ID=`id -u`
GID=`id -g`
USER='user'
echo $SCRIPTPATH $ID $GID
docker run \
-it \
-d \
--rm \
--name cypress \
-h cypress \
-w /home/$USER \
-v ${SCRIPTPATH}/../AppOficinaMecanica:/home/$USER/ \
--net=ea202 \
--entrypoint=bash \
-e DISPLAY=192.168.10.110:0 \
cypress/included:12.17.4 \
-c "userdel node; \
    groupadd -g $GID $USER;\
    useradd -r -d /home/$USER -s /bin/bash -g $USER -G sudo -u $ID $USER;\
    su -c 'cypress open --browser edge --project ./Tests --e2e --config watchForFileChanges=false'  $USER"