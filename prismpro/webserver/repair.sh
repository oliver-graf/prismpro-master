#!/bin/bash

PC_IP="$1"
PC_SSH_USER="$2"
PC_SSH_PASS="$3"

echo "Run the repair script just to be safe :)"

sshpass -p $PC_SSH_PASS ssh -o "StrictHostKeyChecking=no" $PC_SSH_USER@$PC_IP "cd lab; source /etc/profile; ./repair.sh $PC_IP"

# Remove the Known Hosts file after every time we ssh
rm  ~/.ssh/known_hosts

exit 0
