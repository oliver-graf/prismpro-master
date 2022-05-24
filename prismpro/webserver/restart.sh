#!/bin/bash

PC_IP="$1"
PC_USER="$2"
PC_PASS="$3"
PC_SSH_USER="$4"
PC_SSH_PASS="$5"


echo "Register the Cluster $PC_IP $PC_SSH_USER $PC_SSH_PASS"

sshpass -p $PC_SSH_PASS ssh -o "StrictHostKeyChecking=no" $PC_SSH_USER@$PC_IP "cd lab; source /etc/profile; ./repair.sh $PC_IP"

# Remove the Known Hosts file after every time we ssh
rm  ~/.ssh/known_hosts

echo "Restarting Node JS Server with $PC_IP $PC_USER $PC_PASS"

rm my_local_config.js

echo "var env={app:{proxyHost:\"$PC_IP\",userName:\"$PC_USER\",userPass:\"$PC_PASS\"}};module.exports=env;" >> my_local_config.js; pm2 restart prismpro-webserver

echo "Node JS Server RE-Initialized...."

exit 0
