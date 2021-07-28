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

for D in `find _esm -type d | grep -v ^\.$ | grep -v node_modules`
do
  #dir="../dist${D#.}"
  dir=$D
  #mkdir -p $dir
  echo $VAR > "${dir}/package.json"
done
