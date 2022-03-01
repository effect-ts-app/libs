#/bin/bash

# shopt -s globstar
# for file in /*/dist/**/*.js; do
#   echo "$file" "${file%.js}.mjs"
# done
cd ./_esm
find . -depth -name "*.d.ts" -exec sh -c 'cp "$1" ".${1}"' _ {} \;
find . -depth -name "*.d.ts.map" -exec sh -c 'cp "$1" ".${1}"' _ {} \;