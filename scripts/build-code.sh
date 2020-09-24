#!/bin/bash

# install dependencies for this project
npm install

# get the env file ready
cp .env-dev .env

sed -i 's/__DB_HOST__/mydbhost/g' .env
sed -i 's/__DB_PASS__/mydbpass123/g' .env
sed -i 's/__DB_USER__/mydbuser/g' .env
sed -i 's/__DB_NAME__/mydbname/g' .env
sed -i 's/__APP_NAME__/Acme/g' .env
