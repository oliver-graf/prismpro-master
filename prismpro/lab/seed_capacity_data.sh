#!/bin/bash

PC_IP="$1"

cd capacity_data

echo 'Writing Capcity Data'
# Write data to IDF
python capacity_prismpro_write.py

cd ../

echo 'Creating Prism-Pro-Cluster'
# Register the PE
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck [4th time is the charm! ;)]
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster

# Patch the capacity UI metric that seems to not get written
python patch.py
