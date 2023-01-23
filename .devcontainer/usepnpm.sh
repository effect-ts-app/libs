NPM_PATH=$(which npm)
npm () {
  if [ -e pnpm-lock.yaml ]
  then
    echo "Please use PNPM with this project"
  elif [ -e yarn.lock ]
  then
    echo "Please use Yarn with this project"
  else
    $NPM_PATH "$@"
  fi
}


YARN_PATH=$(which yarn)
yarn () {
  if [ -e pnpm-lock.yaml ]
  then
    echo "Please use PNPM with this project"
  elif [ -e package-lock.json ]
  then
    echo "Please use NPM with this project"
  else
    $YARN_PATH "$@"
  fi
}