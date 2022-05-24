#!/bin/bash

# Copyright (c) 2020 Nutanix Inc.  All rights reserved.

# To run this script please provide the following parameters:
# The Prism Central IP
# The Prism Central Username
# The Prism Central Password
# The type of entity we are removing from the category (vm, host, or cluster)
# The UUID of the entity we are removing from the category
# The category name
# The category value
# Example ./remove_from_category.sh 1.2.3.4 admin Nutanix/4u vm 290d76cc-4819-4605-8013-71fd0a3307a6 Cat123 Test123

# Note this script requires jq to be installed in your VM.

PC_IP="$1"
PC_UI_USER="$2"
PC_UI_PASS="$3"
CATEGORY_TYPE="$4"
ENTITY_UUID="$5"
CATEGORY_NAME="$6"
CATEGORY_VALUE="$7"

if [ "$CATEGORY_TYPE" == "vm" ]; then
    CATEGORY_TYPE="mh_vms"
elif [ "$CATEGORY_TYPE" == "host" ]; then
    CATEGORY_TYPE="hosts"
elif [ "$CATEGORY_TYPE" == "cluster" ]; then
    CATEGORY_TYPE="clusters"
else
    echo "Incorrect category type" $CATEGORY_TYPE
    exit 0
fi

GET_ENDPOINT="https://${PC_IP}:9440/api/nutanix/v3/${CATEGORY_TYPE}/${ENTITY_UUID}"

output=$(curl -s -u $PC_UI_USER:$PC_UI_PASS -H 'Accept:application/json' -k $GET_ENDPOINT \
| jq  'del(.status)' \
| jq  'del(.metadata.categories_mapping.'$CATEGORY_NAME')' \
| jq  --argjson catmap "{\"use_categories_mapping\": true}" '.metadata += $catmap'
)

content=$(curl -X PUT -k $GET_ENDPOINT \
        --header 'Content-Type: application/json' \
        -u $PC_UI_USER:$PC_UI_PASS \
        --data "$output"
        )

echo "Updated successfully : $content"

exit 0

