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

for D in `find . -type d | grep -v ^\.$`
do
  #dir="../dist${D#.}"
  dir=$D
  #mkdir -p $dir
  echo $VAR > "${dir}/package.json"
done


# for f in `find . -type f | grep .d.ts$`
# do
#   #dest="../dist${f#.}"
#   dest=$f
#   mv -f -- "${f}.map" "${dest}.map"
#   mv -f -- "$f" "${dest}"
# done


for f in `find . -type f | grep .js$ | grep -v .mjs | grep -v .eslintrc.js`
do
  #dest="../dist${f#.}"
  dest=$f
  mv -f -- "$f.map" "${dest%.js}.mjs.map"
  mv -f -- "$f" "${dest%.js}.mjs"
done
