#!/bin/bash

for d in `find dist -type d | grep -v dist$`
do
  src_d="_src/${d#dist/}"
  if [ ! -d "$src_d" ]; then
    echo "Removing $d"
    rm -rf $d
  fi
done

for f in `find dist -type f | grep \\\.mjs$`
do
  src_f="_src/${f#dist/}"
  src_f="${src_f%.mjs}.mts"
  raw="${f%.mjs}"
  if [ ! -f "$src_f" ]; then
    echo "Removing $raw.mjs"
    rm -f $raw.mjs $raw.mjs.map $raw.d.mts $raw.d.mts.map
  fi
done


for f in `find dist -type f | grep \\\.js$`
do
  src_f="_src/${f#dist/}"
  src_f="${src_f%.js}.ts"
  raw="${f%.js}"
  if [ ! -f "$src_f" ]; then
    echo "Removing $raw.js"
    rm -f $raw.js $raw.js.map $raw.d.ts $raw.d.ts.map
  fi
done