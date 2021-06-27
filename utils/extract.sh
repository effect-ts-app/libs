for f in `find . -type f | grep .ts$ | grep -v .d.ts$`
do
echo "\"${f%.ts}\": {
    \"node\": \"${f%.ts}.js\",
    \"import\": \"${f%.ts}.js\"
  },"
done
