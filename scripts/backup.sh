#!/bin/bash

current_time=$(date "+%m.%d.%Y-%H.%M.%S")

sudo mysqldump -u root -p __PROJECT_NAME__ > __PROJECT_PATH__/backups/__PROJECT_NAME__-backup-$current_time.sql
