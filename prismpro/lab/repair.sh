#!/bin/bash

PC_IP="$1"

echo 'Attempting to fix capacity workflow'
# Register the PE
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster
# Try again for good luck [4th time is the charm! ;)]
python create_zeus_entity.py $PC_IP 00057d50-00df-b390-0000-00000000eafd Prism-Pro-Cluster

echo 'Rewriting the UI ready flag'
# Patch the capacity UI metric that seems to not get written
python patch.py
