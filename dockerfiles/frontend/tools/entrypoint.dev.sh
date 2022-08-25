if [ -n "$NPM_CLEAN_INSTALL" ]; then
  npm clean-install
else
  npm install
fi

# https://stackoverflow.com/questions/70012970/running-a-vite-dev-server-inside-a-docker-container
exec npm run dev -- --host