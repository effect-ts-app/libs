
for d in `find . -type d$ | grep -v node_modules`
do
echo "\"${d}\": \"${d}/index.mjs\","
done


for f in `find . -type f | grep .ts$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
echo "\"${f%.ts}\": \"${f%.ts}.mjs\","
done

for f in `find . -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
do
echo "\"${f%.tsx}\": \"${f%.tsx}.mjs\","
done
