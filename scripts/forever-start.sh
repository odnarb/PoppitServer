#!/bin/bash

# this script could be copied after the build process to a startup script location

#start app script with forever and piping a port
forever start __PROJECT_PATH__/scripts/forever-config.json
