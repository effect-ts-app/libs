
for d in `find . -type d$ | grep -v node_modules`
do
echo "\"${d}\": { \"module\": \"_esm/${d}/index.mjs\", \"default\": \"${d}/index.js\", },"
done


for f in `find . -type f | grep .ts$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
echo "\"${f%.ts}\": { \"module\": \"_esm/${f%.ts}.mjs\", \"default\": \"${f%.ts}.js\","
done

for f in `find . -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
echo "\"${f%.tsx}\": { \"module\": \"_esm/${f%.tsx}.mjs\", \"default\": \"${f%.ts}.js\","
done
