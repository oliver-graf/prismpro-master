#!/bin/bash

# Copyright (c) 2020 Nutanix Inc.  All rights reserved.

# To run this script please provide the following parameters:
# The Prism Central IP
# The Prism Central Username
# The Prism Central Password
# The Webhook UUID of the Playbook you would like to trigger
# The type of entity we are triggering the webhook for (vm, host, or cluster)
# The category name
# The category value
# Example ./call_webhook_for_category.sh 1.2.3.4 admin Nutanix/4u 290d76cc-4819-4605-8013-71fd0a3307a6 vm Cat123 Test123

# Note this script requires jq to be installed in your VM.

PC_IP="$1"
PC_UI_USER="$2"
PC_UI_PASS="$3"
WEBHOOK_ID="$4"
ENTITY_TYPE="$5"
CATEGORY_NAME="$6"
CATEGORY_VALUE="$7"

ATTRIBUTE_NAME=""

if [ "$ENTITY_TYPE" == "vm" ]; then
    ENTITY_KIND="mh_vm"
    ATTRIBUTE_NAME="vm_name"
elif [ "$ENTITY_TYPE" == "host" ]; then
    ENTITY_KIND="host"
    ATTRIBUTE_NAME="node_name"
elif [ "$ENTITY_TYPE" == "cluster" ]; then
    ENTITY_KIND="cluster"
    ATTRIBUTE_NAME="cluster_name"
else
    echo "Incorrect category type" $ENTITY_TYPE
    exit 0
fi

GROUPS_ENDPOINT="https://${PC_IP}:9440/api/nutanix/v3/groups"

REQUEST1=$(cat <<EOF
{
  "entity_type": "$ENTITY_KIND",
  "group_member_count": 500,
  "filter_criteria": "category_name==$CATEGORY_NAME;category_value==$CATEGORY_VALUE",
  "group_member_attributes": [
    {
      "attribute": "$ATTRIBUTE_NAME"
    }
  ]
}
EOF
)

echo "Request Body 1 :  $REQUEST1"

response1=$(curl -X POST -k $GROUPS_ENDPOINT \
        --header 'Content-Type: application/json' \
        -u $PC_UI_USER:$PC_UI_PASS \
        --data "$REQUEST1"
        )

len=$(jq -r  '.group_results[0].entity_results | length' <<< "${response1}" )

len=$(( 10#$len ))
value=0
while [ $value -lt $len ]
do

echo "iterating $value"
entity_id=$(jq -r  ".group_results[0].entity_results["$value"].entity_id" <<< "${response1}" )

echo "Entity ID $entity_id"

name=$(jq -r  ".group_results[0].entity_results["$value"].data[0].values[0].values[0]" <<< "${response1}" )

echo "Name $name"

((value=value+1))

REQUEST2=$(cat <<EOF
{
 "trigger_type": "incoming_webhook_trigger",
 "trigger_instance_list": [{
   "webhook_id": "$WEBHOOK_ID",
   "entity1" : "{\"type\":\"$ENTITY_TYPE\",\"name\":\"$name\",\"uuid\":\"$entity_id\"}"
 }]
}


EOF
)

echo "$REQUEST2"

TRIGGER_ENDPOINT="https://${PC_IP}:9440/api/nutanix/v3/action_rules/trigger"
response2=$(curl -X POST -k $TRIGGER_ENDPOINT \
        --header 'Content-Type: application/json' \
        -u $PC_UI_USER:$PC_UI_PASS \
        --data "$REQUEST2" \
        )

echo "Updated successfully : $response2"


done


exit 0

