#!/bin/bash

echo "Creating cron job for capacity"

( crontab -l 2>/dev/null; echo '@hourly /usr/bin/timeout 1h bash -lc "cd /home/nutanix/lab/capacity_data/;python capacity_prismpro_write.py" > /tmp/debug.log' ) | crontab -

crontab -l

