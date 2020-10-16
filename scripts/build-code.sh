#!/bin/bash

# install dependencies for this project
npm install
npm run lint || { echo 'JS Lint Failed, exiting build process' ; exit 1; }

# get the env file ready
cp .env-dev .env

#replace env options for app
sed -i 's/__DB_HOST__/mydbhost/g' .env
sed -i 's/__DB_PASS__/mydbpass123/g' .env
sed -i 's/__DB_USER__/mydbuser/g' .env
sed -i 's/__DB_NAME__/mydbname/g' .env
sed -i 's/__APP_NAME__/POPPIT GAMES/g' .env
sed -i 's/__APP_URL__/poppitgames.io/g' .env
sed -i 's/__ADMIN_EMAIL__/no-reply@poppitgames.io/g' .env
sed -i 's/__ADMIN_EMAIL_LOGIN__/emailsender@poppitgames.io/g' .env
sed -i 's/__ADMIN_EMAIL_PASSWORD__/abc123/g' .env
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' .env
sed -i 's/__REDIS_HOST__/localhost/g' .env
sed -i 's/__REDIS_PORT__/6379/g' .env
sed -i 's/__REDIS_TTL__/86400/g' .env

#replace forever options
sed -i 's/__SCRIPT_PATH__/\/home\/brandon\/git-projects\/PoppitServer\/app.js/g' scripts/forever-config.json
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/forever-config.json
sed -i 's/__LOGS_FOREVER_PATH__/\/var\/log\/PoppitServer\/forever.log/g' scripts/forever-config.json
sed -i 's/__LOGS_OUT_PATH__/\/var\/log\/PoppitServer\/out.log/g' scripts/forever-config.json
sed -i 's/__LOGS_ERROR_PATH__/\/var\/log\/PoppitServer\/error.log/g' scripts/forever-config.json

#replace forever start script options
sed -i 's/__SYSTEM_USER__/brandon/g' scripts/forever-start.sh
sed -i 's/__PROJECT_PATH__/\/home\/brandon\/git-projects\/PoppitServer/g' scripts/forever-start.sh
