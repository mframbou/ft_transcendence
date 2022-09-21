if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npx prisma generate
npx prisma migrate dev --name init

# https://stackoverflow.com/questions/6405127/how-do-i-specify-a-password-to-psql-non-interactively
until PGPASSWORD="$POSTGRES_PASSWORD" psql --no-password --host="$POSTGRES_HOST" --username="$POSTGRES_USER" --command="\q" "$POSTGRES_DB"; do
  >&2 echo "Waiting for Postgres..."
  sleep 1
done

>&2 echo "Postgres is up, starting NestJS..."

exec npm run start:dev