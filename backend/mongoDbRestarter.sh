#!/bin/bash
  

########################################################

## Shell Script to Start MongoDB Service if down by FOSSTechNix.com   

#######################################################

if ! systemctl is-active --quiet mongodb; then
  systemctl restart mongodb
  curl -X POST -H 'Content-type: application/json' --data '{"text":"MongoDB restarted"}' https://hooks.slack.com/services/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
fi
