
for d in `find . -type d$`
do
echo "\"${d}\": {
    \"node\": \"${d}/index.js\",
    \"import\": \"${d}/index.js\"
  },"
done


for f in `find . -type f | grep .ts$ | grep -v index.ts$ | grep -v .d.ts$`
do
echo "\"${f%.ts}\": {
    \"node\": \"${f%.ts}.js\",
    \"import\": \"${f%.ts}.js\"
  },"
done

for f in `find . -type f | grep .tsx$ | grep -v index.ts$ | grep -v .d.ts$`
do
echo "\"${f%.tsx}\": {
    \"node\": \"${f%.tsx}.js\",
    \"import\": \"${f%.tsx}.js\"
  },"
done
