
for d in `find . -type d$ | grep -v node_modules | grep -v _esm/`
do
echo "\"${d}\": { \"module\": \"./_esm${d#.}/index.js\", \"default\": \"${d}/index.js\", },"
done


for f in `find . -type f | grep .ts$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
f2="./_esm${f#.}"
f2="${f2%.ts}.js"
echo "\"${f%.ts}\": { \"module\": \"$f2\", \"default\": \"${f%.ts}.js\","
done

for f in `find . -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
f2="./_esm${f#.}"
f2="${f2%.ts}.js"
echo "\"${f2%.tsx}\": { \"module\": \"$f\", \"default\": \"${f%.tsx}.js\","
done
