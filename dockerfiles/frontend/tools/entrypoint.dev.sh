if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

until curl -s http://backend:3000/ &> /dev/null; do
  echo "Waiting for backend..."
  sleep 1
done

echo "Backend is up, starting frontend..."

# https://stackoverflow.com/questions/70012970/running-a-vite-dev-server-inside-a-docker-container
exec npm run dev -- --host