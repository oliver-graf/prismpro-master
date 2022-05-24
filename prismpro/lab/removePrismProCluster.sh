#!/bin/bash

python deleteprismproentities.py

cd ~/bin
python ./unregistration_cleanup.py 00057d50-00df-b390-0000-00000000eafd

zkrm /appliance/physical/clusterexternalstate/00057d50-00df-b390-0000-00000000eafd
zkrm /appliance/physical/clusterdatastate/00057d50-00df-b390-0000-00000000eafd
zkrm /appliance/physical/zeusconfig/00057d50-00df-b390-0000-00000000eafd
