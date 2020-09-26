#!/bin/bash

current_time=$(date "+%m.%d.%Y-%H.%M.%S")

mkdir -p __PROJECT_PATH__/backups

sudo mysqldump -u root -p poppit > __PROJECT_PATH__/backups/poppit-backup-$current_time.sql
