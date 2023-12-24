#!/bin/bash

set -euo pipefail

# change workdir to lang-wheel/
cd "$(dirname "${BASH_SOURCE[0]}")"

>&2 echo 'running lang wheel...'
swipl lang_wheel.pl

day_language=$(tail -1 lang-calendar.txt) # ex: "day 1: haskell"
day=$(echo "$day_language" | sed -e 's/day //' -e 's/:.*//')
day_padded=$(printf "%02d" "$day") # pad to 2 digits
input_file="../input/day${day_padded}-in.txt"
language=${day_language//*: /}

>&2 echo "curl-ing the input for today's puzzle..."
source .env
curl --silent --cookie "session=$AOC_SESSION_ID" \
    "https://adventofcode.com/2021/day/$day/input" \
    > "$input_file"

>&2 echo 'git commit...'
git add lang-calendar.txt
git add "$input_file"
git commit -m "init day $day with $language"

git show # check everything's ok, can cancel the push with ^C + Q

>&2 echo 'git push...'
git push
