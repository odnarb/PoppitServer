#!/bin/bash

#execute such as: ./server-deployment.sh odnarb PoppitServer

#check for args: $1 == git project name, $2 == odnarb
GIT_REPO_NAME=$1
GIT_PROJECTNAME=$2

echo "GIT_REPO_NAME: $GIT_REPO_NAME"
echo "GIT_PROJECTNAME: $GIT_PROJECTNAME"

SERVICE_NAME=poppit
DBUSER=poppit
DBNAME=poppit
DBPW=poppit123

PROJECT_PATH="\/home\/brandon\/test-deployment/$SERVICE_NAME"
PATHCONTENT="/home/brandon/.nvm/versions/node/v12.18.4/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"

SYSUSER=brandon
SYSGROUP=brandon

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
git clone git@github.com:$GIT_REPO_NAME/$GIT_PROJECTNAME.git $SERVICE_NAME

cd $SERVICE_NAME
git checkout .
git checkout whitelabeling-part-1

echo "Replacing db info..."

# replace path service script
sed -i "s/__DB_USER__/$DBUSER/g" sql/create_user_and_db.sql
sed -i "s/__DB_PASSWORD__/$DBPW/g" sql/create_user_and_db.sql
sed -i "s/__DB_NAME__/$DBNAME/g" sql/create_user_and_db.sql

echo "Creating db, user and importing db schema..."

# Create db assets
sudo mysql -u root -p < sql/create_user_and_db.sql
sudo mysql -u root -p $DBNAME < sql/schema.sql

echo "Prepping forever config..."

#replace forever options
sed -i "s/__SCRIPT_PATH__/$PROJECT_PATH\/app.js/g" scripts/forever-config.json
sed -i "s/__PROJECT_PATH__/$PROJECT_PATH/g" scripts/forever-config.json
sed -i "s/__SERVICE_NAME__/$SERVICE_NAME/g" scripts/forever-config.json
sed -i "s/__LOGS_FOREVER_PATH__/\/var\/log\/$SERVICE_NAME\/forever.log/g" scripts/forever-config.json
sed -i "s/__LOGS_OUT_PATH__/\/var\/log\/$SERVICE_NAME\/out.log/g" scripts/forever-config.json
sed -i "s/__LOGS_ERROR_PATH__/\/var\/log\/$SERVICE_NAME\/error.log/g" scripts/forever-config.json

echo "Prepping forever start script..."

#replace forever start script options
sed -i "s/__SYSTEM_USER__/$SYSUSER/g" scripts/forever-start.sh
sed -i "s/__PROJECT_PATH__/$PROJECT_PATH/g" scripts/forever-start.sh

echo "Prepping system-level startup script..."

# replace slugs in service script
sed -i "s/__SERVICE_NAME__/$SERVICE_NAME/g" scripts/app.service
sed -i "s/__FOREVER_START_SCRIPT__/$PROJECT_PATH\/scripts\/forever-start.sh/g" scripts/app.service
sed -i "s/__FOREVER_START_USER__/$SYSUSER/g" scripts/app.service
sed -i "s/__FOREVER_START_GROUP__/$SYSGROUP/g" scripts/app.service
sed -i "s/__PATH_CONTENT__/$PATHCONTENT/g" scripts/app.service

echo "Copying system-level start script..."

#copy the script to the systemd path
sudo cp scripts/app.service /usr/lib/systemd/system/$SERVICE_NAME.service

echo "Register startup script with system.."

#load the service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME.service

echo "Prep db backups..."

#prep the backup script
sed -i "s/__PROJECT_PATH__/$PROJECT_PATH/g" scripts/backup.sh
sed -i "s/__SERVICE_NAME__/$SERVICE_NAME/g" scripts/backup.sh

mkdir -p backups
chmod +x scripts/backup.sh

echo "Prep Crontab..."

#prep the crontab
sed -i "s/__PROJECT_PATH__/$PROJECT_PATH/g" scripts/server.cron

cp scripts/server.cron scripts/$SERVICE_NAME.cron

#copy the crontab to the system's /etc/cron.d/ area
sudo crontab scripts/$SERVICE_NAME.cron

echo "Prop logrotate..."

#add the logs paths and logrotate configs
sed -i "s/__PROJECT_PATH__/$PROJECT_PATH/g" scripts/server-logrotate.conf
sed -i "s/__LOGS_FOREVER_PATH__/\/var\/log\/$SERVICE_NAME\/forever.log/g" scripts/server-logrotate.conf
sed -i "s/__LOGS_OUT_PATH__/\/var\/log\/$SERVICE_NAME\/out.log/g" scripts/server-logrotate.conf
sed -i "s/__LOGS_ERROR_PATH__/\/var\/log\/$SERVICE_NAME\/error.log/g" scripts/server-logrotate.conf

sudo mkdir -p /var/log/$SERVICE_NAME
sudo chown $SYSUSER:$SYSGROUP /var/log/$SERVICE_NAME
sudo chown root:root scripts/server-logrotate.conf
sudo chmod 644 scripts/server-logrotate.conf
sudo logrotate -v scripts/server-logrotate.conf

echo "Done!"
