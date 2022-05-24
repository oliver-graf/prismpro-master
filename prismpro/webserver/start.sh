npm install
npm install pm2 -g
# TODO - make this check if the process is already running....
pm2 start -o out.log -e err.log prismpro-webserver.js; pm2 save;
