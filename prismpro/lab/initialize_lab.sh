#!/bin/bash
#!/usr/bin/expect -f
set -x

PC_IP="$1"
PC_USER="$2"
PC_PASS="$3"

echo "Temporarily fixing NCC Bug that Prevents SeedPC from working"
# ENG-432422 PART 1
cp ~/ncc/lib/py/nutanix_serviceability-lib.egg nutanix_serviceability-lib-previous.egg
cp nutanix_serviceability-lib.egg ~/ncc/lib/py/nutanix_serviceability-lib.egg


# Update sizer timeout and restart sizer
# https://jira.nutanix.com/browse/ENG-430580
# Add DCBC_TIMEOUT_MS=1000 flag to the java call in sizer_service.sh
source /etc/profile
sed -i '/-DCBC_PATH*/a \  -DCBC_TIMEOUT_MS=1000 \\' /home/nutanix/neuron/bin/sizer_service.sh
ps aux | grep sizer | grep java | grep -v grep | awk '{print $2}' > /home/nutanix/pid.txt

# then kill sizer
sleep 5
kill -9 $(cat /home/nutanix/pid.txt)
sleep 5

# Stop cluster health for the NCC Bug ENG-432422
genesis stop cluster_health
# Stop neuron for both sizer and ncc bug
genesis stop neuron
# now restart the services
cluster start

echo "Enabling App Discovery and vCenter Monitoring Services"

python enable_services.py $PC_IP $PC_USER $PC_PASS

echo "Creating cron job for capacity"

( crontab -l 2>/dev/null; echo '@hourly /usr/bin/timeout 1h bash -lc "cd /home/nutanix/lab/capacity_data/;python capacity_prismpro_write.py" > /tmp/debug.log' ) | crontab -
crontab -l

cd capacity_data

echo 'Writing VMBL Data'
# Write VBML data to IDF
python xfit_prismpro_write.py

cd ../

# ENG-432422 PART 2 replace the ncc egg back to prevent any issues now that the seeding is complete
cp nutanix_serviceability-lib-previous.egg ~/ncc/lib/py/nutanix_serviceability-lib.egg

echo "Seeding Application Discovery Data"

cp mock_epoch_response.json ~/config/xdiscovery/mock_epoch_response.json

# Wait for the discovery service to come up
sleep 60

echo "Now restart the Discovery Service"
genesis stop dpm_server
genesis stop xdiscovery
# Stop cluster health and neuron for the NCC Bug ENG-432422
genesis stop cluster_health
genesis stop neuron
# now restart the services
cluster start
sudo systemctl start iptables

# ~~~ Comment out until vCenter is supported for bootcamps ~~~
# echo "Registering vCenter Cluster"
# python vcenter_con.py $PC_IP $PC_USER $PC_PASS

# ~~~ BEGIN Comment out for Automatically Register PP Cluster ~~~
# We don't automatically register PP Cluster because the PP cluster prevents users from being able to upgrade their PCs.
# We will have the webserver do this.
# Note that for other setups like Test Drive the below portion would be needed

# echo "Registering the Prism Pro Cluster"

# # Register the PE
# python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# sleep 60

# # Check that Prism-Pro-Cluster exists in clusters/list, if not, run the create_zeus_entity.py command again

# echo "Checking that Prism-Pro-Cluster exists"

# /bin/bash verify_init.sh $PC_IP > /home/nutanix/verify_init.log 2>&1
# ~~~ END Comment out for Automatically Register PP Cluster ~~~
