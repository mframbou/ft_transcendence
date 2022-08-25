if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npm run build

exec node ./build/index.js