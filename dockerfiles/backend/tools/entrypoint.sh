if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npm run build
npx prisma generate

exec node ./dist/main.js