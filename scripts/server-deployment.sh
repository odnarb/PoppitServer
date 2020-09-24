#!/bin/bash

# Install mysql redis-server curl vim wget
sudo apt-get -y install mysql-server redis-server curl vim wget git build-essential nginx

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Install in shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

#Install latest  long term support version of node (most stable)
nvm install --lts

#Install forever
npm install -g forever

#Git clone project
git clone git@github.com:odnarb/PoppitServer.git

sudo mysql -u root -p < PoppitServer/sql/create_user_and_db.sql

sudo mysql -u root -p poppit < PoppitServer/sql/schema.sql

sudo mkdir -p /var/log/PoppitServer
sudo chown brandon:brandon /var/log/PoppitServer

# replace path service script
sed -i 's/__FOREVER_START_SCRIPT__/\/home\/brandon\/git-projects\/PoppitServer\/scripts\/forever-start.sh/g' PoppitServer/scripts/poppit.service

#copy the script to the systemd path
sudo cp PoppitServer/scripts/poppit.service /etc/systemd/system/poppit.service

#load the service
sudo systemctl daemon-reload
sudo systemctl enable poppit.service