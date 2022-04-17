#/bin/bash

# shopt -s globstar
# for file in /*/dist/**/*.js; do
#   echo "$file" "${file%.js}.mjs"
# done
cd ./_esm
find . -depth -name "*.d.ts" -exec sh -c 'mv "$1" ".${1}"' _ {} \;
find . -depth -name "*.d.ts.map" -exec sh -c 'sed -i "" "s/\.\.\/_src/_src/" $1' _ {} \;
find . -depth -name "*.d.ts.map" -exec sh -c 'mv "$1" ".${1}"' _ {} \;


cd ../_cjs
find . -depth -name "*.js.map" -exec sh -c 'sed -i "" "s/\.\.\/_src/_src/" $1' _ {} \;
find . -depth -name "*.js*" -exec sh -c 'mv "$1" ".${1}"' _ {} \;
