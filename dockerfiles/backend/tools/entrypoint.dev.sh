npm clean-install

npx prisma generate
npx prisma migrate dev --name init

exec npm run start:dev