#!/bin/bash

set -e




echo "Running fix in ${PWD}"

for D in `find . -type d | grep -v ^\.$ | grep -v node_modules | grep -v _esm`
do
  dir=$D
  #dir="../dist${D#.}"
  echo $dir
  newdir=$(echo "$dir" | sed -e 's/[^\/]*\//..\//g' | sed -e 's/\/.*$//')
  newdir="${newdir}/_esm${dir#.}"
  #mkdir -p $dir
  var="
{
  \"sideEffects\": false,
  \"module\": \"${newdir}/index.js\",
  \"typings\": \"./index.d.ts\"
}
"
  echo $var > "${dir}/package.json"
done
