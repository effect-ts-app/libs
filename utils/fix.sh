#!/bin/bash

set -e


VAR="
{
  \"sideEffects\": false,
  \"module\": \"./index.js\",
  \"typings\": \"./index.d.ts\"
}
"

echo "Running fix in ${PWD}"

for D in `find . -type d | grep -v ^\.$`
do
  #dir="../dist${D#.}"
  dir=$D
  #mkdir -p $dir
  echo $VAR > "${dir}/package.json"
done
