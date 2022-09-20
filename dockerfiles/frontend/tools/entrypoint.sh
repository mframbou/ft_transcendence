if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

npm run build

until curl -s http://backend:3000/ &> /dev/null; do
  echo "Waiting for backend..."
  sleep 1
done

echo "Backend is up, starting frontend... (Prod)"

exec node ./build/index.js