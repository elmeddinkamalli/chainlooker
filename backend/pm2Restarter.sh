#!/bin/bash

declare -A pm2s
pm2s[7]="test.txt"
pm2s[8]="test2.txt"
possibleErrors=("Error occurred" "Another error" "Something went wrong")

for key in ${!pm2s[@]}; do
    line=$( tail -n 1 ${pm2s[${key}]} )
    if [[ " ${possibleErrors[*]} " =~ " ${line} " ]]; then
        $(curl -X POST -H 'Content-type: application/json' --data '{"text":"'"Error: $line \nPID: $key restarted"'"}' https://hooks.slack.com/services/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)
    fi
done

exit 0