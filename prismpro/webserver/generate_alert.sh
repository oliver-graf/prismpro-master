#!/bin/bash

PC_IP="$1"
PC_SSH_USER="$2"
PC_SSH_PASS="$3"
ALERT_UID="$4"
CONFIG_FILE_DIR="$5"
VM_ID="$6"
VM_NAME="$7"

echo "Generate Alert for PC $PC_IP and alert ID $ALERT_UID"

echo "Config file directory $CONFIG_FILE_DIR"

sshpass -p $PC_SSH_PASS ssh -o "StrictHostKeyChecking=no" $PC_SSH_USER@$PC_IP "bash -lc 'python lab/gen_alert_wrapper.py --config_file_dir=$CONFIG_FILE_DIR lab/alert_wrapper_input.json $ALERT_UID $VM_ID \"$VM_NAME\"'"

# Remove the Known Hosts file after every time we ssh
rm  ~/.ssh/known_hosts

exit 0
