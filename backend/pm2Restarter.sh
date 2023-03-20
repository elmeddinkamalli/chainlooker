line=$( tail -n 1 test.txt )
possibleErrors=("Error occurred" "Another error")

if [[ " ${possibleErrors[*]} " =~ " ${line} " ]]; then
    echo "found"
fi