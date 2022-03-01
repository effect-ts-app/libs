#/bin/bash

# shopt -s globstar
# for file in /*/dist/**/*.js; do
#   echo "$file" "${file%.js}.mjs"
# done
find ./_esm -depth -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.mjs"' _ {} \;
find ./_esm -depth -name "*.js.map" -exec sh -c 'mv "$1" "${1%.js.map}.mjs.map"' _ {} \;