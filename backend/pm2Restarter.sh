#!/bin/bash

declare -A pm2s
pm2s[7]="/root/.pm2/logs/Fantom-out.log"
pm2s[8]="/root/.pm2/logs/BNB-Mainnet-out.log"
pm2s[9]="/root/.pm2/logs/Polygon-Mainnet-out.log"
pm2s[10]="/root/.pm2/logs/Ethereum-Mainnet-out.log"
pm2s[11]="/root/.pm2/logs/Avalanche-Mainnet-out.log"
possibleErrors=("Invalid JSON RPC response: {\"size\":0,\"timeout\":0}" "connect ECONNREFUSED 127.0.0.1:27017")

for key in ${!pm2s[@]}; do
    line=$( tail -n 1 ${pm2s[${key}]} )
    if [[ "${line}" != *"ChainlookerLog"* ]]; then
        lineStringified=$(node /var/www/htdocs/chainlooker/backend/stringfier.js "${line}")
        $(curl -X POST -H 'Content-type: application/json' --data '{"text":"'"Error: ${lineStringified} \nPID: $key restarted"'"}' https://hooks.slack.com/services/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)
        $(/root/.nvm/versions/node/v15.14.0/bin/pm2 restart ${key})
    fi
done

exit 0