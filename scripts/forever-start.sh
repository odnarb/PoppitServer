#!/bin/bash

# this script could be copied after the build process to a startup script location

#start app script with forever and piping a port
sudo -u __SYSTEM_USER__ forever --minUptime 3000 --spinSleepTime 3000 start __PROJECT_PATH__/scripts/forever-config.json