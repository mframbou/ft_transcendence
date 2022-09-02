if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npm run build
npx prisma generate

# https://stackoverflow.com/questions/6405127/how-do-i-specify-a-password-to-psql-non-interactively
until PGPASSWORD="$POSTGRES_PASSWORD" psql --no-password --host="$POSTGRES_HOST" --username="$POSTGRES_USER" --command="\q" "$POSTGRES_DB"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - starting nest"

exec node ./dist/main.js