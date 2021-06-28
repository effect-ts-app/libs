#!/bin/bash

set -e


VAR="
{
  \"sideEffects\": false,
  \"module\": \"./index.mjs\",
  \"typings\": \"./index.d.ts\"
}
"

echo "Running fix in ${PWD}"

for D in `find . -type d | grep -v ^\.$ | grep -v node_modules`
do
  #dir="../dist${D#.}"
  dir=$D
  #mkdir -p $dir
  echo $VAR > "${dir}/package.json"
done


# for f in `find . -type f | grep .d.ts$ | grep -v node_modules`
# do
#   #dest="../dist${f#.}"
#   dest=$f
#   cp -f -- "${f}.map" "${dest}.map"
#   cp -f -- "$f" "${dest}"
# done


for f in `find . -type f | grep .js$ | grep -v .mjs | grep -v .eslintrc.js | grep -v node_modules`
do
  #dest="../dist${f#.}"
  dest=$f
  # the references to maps are not yet rewritten, so they stay ".js.map"
  #cp -f -- "$f.map" "${dest%.js}.mjs.map"
  cp -f -- "$f.map" "${dest}.map"
  cp -f -- "$f" "${dest%.js}.mjs"
done
