
for d in `find . -type d$ | grep -v node_modules | grep -v _esm`
do
echo "\"${d}\": { \"import\": { \"types\": \"${d}/index.d.ts\", \"default\": \"./_mjs${d#.}/index.mjs\" }, \"require\": \"${d}/index.js\" },"
done


for f in `find . -type f | grep .ts$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v .d.ts.map$ | grep -v node_modules`
do
f2="./_mjs${f#.}"
f2="${f2%.ts}.mjs"
echo "\"${f%.ts}\": { \"import\": { \"types\": \"${f%.ts}.d.ts\", \"default\": \"$f2\" }, \"require\": \"${f%.ts}.js\" },"
done

for f in `find . -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
f2="./_mjs${f#.}"
f2="${f2%.tsx}.mjs"
echo "\"${f%.tsx}\": { \"import\": { \"types\": \"${f%.tsx}.d.ts\", \"default\": \"$f2\" }, \"require\": \"${f%.tsx}.js\" },"
done
