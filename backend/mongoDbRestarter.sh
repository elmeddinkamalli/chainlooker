#!/bin/bash

source .env

########################################################

## Shell Script to Start MongoDB Service if down by FOSSTechNix.com   

#######################################################

if ! systemctl is-active --quiet mongodb; then
  systemctl restart mongodb
  curl -X POST -H 'Content-type: application/json' --data '{"text":"MongoDB restarted"}' $SLACK_WEBHOOK
fi
