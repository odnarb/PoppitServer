#!/bin/bash

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
git clone git@github.com:odnarb/PoppitServer.git

# Create db assets
sudo mysql -u root -p < PoppitServer/sql/create_user_and_db.sql
sudo mysql -u root -p poppit < PoppitServer/sql/schema.sql

# replace path service script
sed -i 's/__FOREVER_START_SCRIPT__/\/home\/brandon\/git-projects\/PoppitServer\/scripts\/forever-start.sh/g' PoppitServer/scripts/poppit.service
sed -i 's/__FOREVER_START_USER__/brandon/g' PoppitServer/scripts/poppit.service
sed -i 's/__FOREVER_START_GROUP__/brandon/g' PoppitServer/scripts/poppit.service

#copy the script to the systemd path
sudo cp PoppitServer/scripts/poppit.service /usr/lib/systemd/system/poppit.service

#load the service
sudo systemctl daemon-reload
sudo systemctl enable poppit.service

#prep the backup script
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' PoppitServer/scripts/backup.sh
chmod +x PoppitServer/scripts/backup.sh

#prep the crontab
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' PoppitServer/scripts/poppit.cron

#copy the crontab to the system's /etc/cron.d/ area
sudo cp PoppitServer/scripts/poppit.cron /etc/cron.d/

#add the logs paths and logrotate configs
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' PoppitServer/scripts/poppit-server-logrotate.conf
sudo mkdir -p /var/log/PoppitServer
sudo chown brandon:brandon /var/log/PoppitServer
sudo chown root:root PoppitServer/scripts/poppit-server-logrotate.conf
sudo chmod 644 PoppitServer/scripts/poppit-server-logrotate.conf
sudo logrotate -v PoppitServer/scripts/poppit-server-logrotate.conf
