#!/bin/bash

# Copyright (c) 2020 Nutanix Inc.  All rights reserved.

# To run this script please provide the following parameters:
# The Prism Central IP
# The Prism Central Username
# The Prism Central Password
# The Webhook UUID of the Playbook you would like to trigger
# The type of entity we are triggering the webhook for (vm, host, or cluster)
# Comma separated string of UUIDs to trigger on [note there will be no space between the UUIDs, just a comma)
# Example ./call_webhook_for_list 10.45.32.187 admin Nutanix.123 37e06fb3-18ee-42f3-aebc-6b29d363fef1 vm 623eec47-c50f-4453-a82e-e1cc7432bb53,79bafc76-66fe-4a62-aef1-048cd06b3df3

# Note this script requires jq to be installed in your VM.

PC_IP="$1"
PC_UI_USER="$2"
PC_UI_PASS="$3"
WEBHOOK_ID="$4"
ENTITY_TYPE="$5"
UUIDS="$6"

echo "Installing jq"
curl -k --show-error --remote-name --location https://s3.amazonaws.com/get-ahv-images/jq-linux64.dms
chmod u+x jq-linux64.dms
ln -s jq-linux64.dms jq
mv jq* ~/bin

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

IFS=',' read -ra my_array <<< "$UUIDS"

for i in "${my_array[@]}"
do
REQUEST1=$(cat <<EOF
{
  "entity_type": "$ENTITY_KIND",
  "entity_ids": ["$i"],
  "group_member_count": 100,
  "group_member_attributes": [
    {
      "attribute": "$ATTRIBUTE_NAME"
    }
  ]
}
EOF
)
    echo "Request Body 1 :  $REQUEST1"
    content=$(curl -X POST -k $GROUPS_ENDPOINT \
        --header 'Content-Type: application/json' \
        -u $PC_UI_USER:$PC_UI_PASS \
        --data "$REQUEST1" \
        | jq -r '.group_results[0].entity_results[0].data[0].values[0].values[0]'
        )


REQUEST2=$(cat <<EOF
{
 "trigger_type": "incoming_webhook_trigger",
 "trigger_instance_list": [{
   "webhook_id": "$WEBHOOK_ID",
   "entity1" : "{\"type\":\"$ENTITY_TYPE\",\"name\":\"$content\",\"uuid\":\"$i\"}"
 }]
}
EOF
)

TRIGGER_ENDPOINT="https://${PC_IP}:9440/api/nutanix/v3/action_rules/trigger"
response=$(curl -X POST -k $TRIGGER_ENDPOINT \
        --header 'Content-Type: application/json' \
        -u $PC_UI_USER:$PC_UI_PASS \
        --data "$REQUEST2" \
        )

echo "Updated successfully : $response"

done


exit 0

