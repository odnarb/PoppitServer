#!/bin/bash

#execute such as: ./server-deployment.sh odnarb PoppitServer

#check for args: $1 == git project name, $2 == odnarb
$REPO_NAME=$1
PROJECTNAME=$2

# Install mysql redis-server curl vim wget
sudo apt-get -y install mysql-server redis-server curl vim wget git build-essential nginx logrotate

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Install in shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# Install latest  long term support version of node (most stable)
nvm install --lts

# Install forever
npm install -g forever

# Git clone project
git clone git@github.com:$REPO_NAME/$PROJECTNAME.git

cd $PROJECTNAME

# replace path service script
sed -i 's/__DB_USER__/poppit/g' sql/create_user_and_db.sql
sed -i 's/__DB_PASSWORD__/88s87dp0pp\!t23H/g' sql/create_user_and_db.sql

# Create db assets
sudo mysql -u root -p < sql/create_user_and_db.sql
sudo mysql -u root -p poppit < sql/schema.sql

# replace path service script
sed -i 's/__SERVICE_NAME__/poppit/g' scripts/app.service
sed -i 's/__FOREVER_START_SCRIPT__/\/home\/brandon\/git-projects\/PoppitServer\/scripts\/forever-start.sh/g' scripts/app.service
sed -i 's/__FOREVER_START_USER__/brandon/g' scripts/app.service
sed -i 's/__FOREVER_START_GROUP__/brandon/g' scripts/app.service

#replace forever options
sed -i 's/__SCRIPT_PATH__/\/home\/brandon\/git-projects\/PoppitServer\/app.js/g' scripts/forever-config.json
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/forever-config.json
sed -i 's/__PROJECT_NAME__/poppit/g' scripts/forever-config.json
sed -i 's/__LOGS_FOREVER_PATH__/\/var\/log\/PoppitServer\/forever.log/g' scripts/forever-config.json
sed -i 's/__LOGS_OUT_PATH__/\/var\/log\/PoppitServer\/out.log/g' scripts/forever-config.json
sed -i 's/__LOGS_ERROR_PATH__/\/var\/log\/PoppitServer\/error.log/g' scripts/forever-config.json

#replace forever start script options
sed -i 's/__SYSTEM_USER__/brandon/g' scripts/forever-start.sh
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/forever-start.sh

#inject our path content
PATHCONTENT="/home/brandon/.nvm/versions/node/v12.18.4/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
sed -i 's/__PATH_CONTENT__/$PATHCONTENT/g' scripts/app.service

#copy the script to the systemd path
sudo cp scripts/app.service /usr/lib/systemd/system/poppit.service

#load the service
sudo systemctl daemon-reload
sudo systemctl enable poppit.service

#prep the backup script
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/backup.sh
sed -i 's/__PROJECT_NAME__/poppit/g' scripts/backup.sh

mkdir -p backups
chmod +x scripts/backup.sh

#prep the crontab
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/server.cron

#copy the crontab to the system's /etc/cron.d/ area
sudo crontab scripts/poppit.cron

#add the logs paths and logrotate configs
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/server-logrotate.conf
sed -i 's/__LOGS_FOREVER_PATH__/\/var\/log\/PoppitServer\/forever.log/g' scripts/server-logrotate.conf
sed -i 's/__LOGS_OUT_PATH__/\/var\/log\/PoppitServer\/out.log/g' scripts/server-logrotate.conf
sed -i 's/__LOGS_ERROR_PATH__/\/var\/log\/PoppitServer\/error.log/g' scripts/server-logrotate.conf

sudo mkdir -p /var/log/$PROJECTNAME
sudo chown brandon:brandon /var/log/$PROJECTNAME
sudo chown root:root scripts/server-logrotate.conf
sudo chmod 644 scripts/server-logrotate.conf
sudo logrotate -v scripts/server-logrotate.conf
