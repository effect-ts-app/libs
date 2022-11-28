
# for d in `find _src -type d$ | grep -v node_modules | grep -v _esm`
# do
# d=`echo $d | cut -c 6-`
# d=./$d
# echo "\"${d}\": { \"import\": { \"types\": \"${d}/index.d.ts\", \"default\": \"./_esm${d#.}/index.mjs\" }, \"require\": \"${d}/index.js\" },"
# done

for f in `find _src -type f | grep .ts$`
do
f=`echo $f | cut -c 6-`
f=./$f
f2="./dist${f#.}"
f2="${f2%.ts}.js"
f3="./_cjs${f2#./dist}"
f3="${f3%.js}.cjs"
echo "\"${f%.ts}\": { \"import\": { \"types\": \"${f2%.js}.d.ts\", \"default\": \"$f2\" }, \"require\": { \"types\": \"${f2%.js}.d.ts\", \"default\": \"${f3}\" } },"
done

# for f in `find _src -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$ | grep -v node_modules`
# do
# f=`echo $f | cut -c 6-`
# f=./$f
# f2="./_esm${f#.}"
# f2="${f2%.tsx}.mjs"
# echo "\"${f%.tsx}\": { \"import\": { \"types\": \"${f%.tsx}.d.ts\", \"default\": \"$f2\" }, \"require\": \"${f%.tsx}.js\" },"
# done
