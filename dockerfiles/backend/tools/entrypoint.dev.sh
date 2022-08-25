if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npx prisma generate
npx prisma migrate dev --name init

exec npm run start:dev