#!/bin/bash

# Install mysql redis-server curl vim wget
sudo apt-get -y install mysql-server redis-server curl vim wget git build-essential nginx

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Install in shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

#Install latest version of node
nvm install node

#Install forever
npm install -g forever

#Git clone project
git clone git@github.com:odnarb/PoppitServer.git

cd PoppitServer

sudo mysql -u root -p < sql/create_user_and_db.sql

sudo mysql -u root -p poppit < sql/schema.sql

# These next steps are mainly for the build process
# do some replace statements against .env now
npm install
cp .env-dev .env