#!/bin/bash

UVM_IP="$1"
UVM_USER="$2"
UVM_PASS="$3"

echo "Begin Stressing $UVM_IP"

sshpass -p $UVM_PASS ssh -o "StrictHostKeyChecking=no" $UVM_USER@$UVM_IP "yum install -y stress"
sshpass -p $UVM_PASS ssh -o "StrictHostKeyChecking=no" $UVM_USER@$UVM_IP "stress -m 4 --vm-bytes 500M </dev/null >/dev/null 2>/dev/null &"

echo "VM Stress Initiated..."

# Remove the Known Hosts file after every time we ssh
rm  ~/.ssh/known_hosts

exit 0
