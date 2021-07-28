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

for D in `find _esm -type d | grep -v ^\.$ | grep -v node_modules`
do
  #dir="../dist${D#.}"
  dir=$D
  #mkdir -p $dir
  echo $VAR > "${dir}/package.json"
done

# must use mv, as we are dealing with files in the same dir..

# for f in `find . -type f | grep .d.ts$ | grep -v node_modules`
# do
#   #dest="../dist${f#.}"
#   dest=$f
#   mv -f -- "${f}.map" "${dest}.map"
#   mv -f -- "$f" "${dest}"
# done


for f in `find _esm -type f | grep .js$ | grep -v .mjs | grep -v .eslintrc.js | grep -v node_modules`
do
  #dest="../dist${f#.}"
  dest=$f
  # the references to maps are not yet rewritten, so they stay ".js.map"
  #mv -f -- "$f.map" "${dest%.js}.mjs.map"
  mv -f -- "$f" "${dest%.js}.mjs"
done
