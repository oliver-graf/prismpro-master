import sys
import requests
import time
import json

requests.packages.urllib3.disable_warnings()


class VcenterHelper(object):
  """
  VcenterHelper
  """

  def __init__(self, pc_ip, prism_user="admin", prism_password="Nutanix.123",
               provider="nutanix_vcenter",
               VCENTER_DEFAULT_USERNAME="administrator@vsphere.local",
               VCENTER_DEFAULT_PASSWORD="Nutanix/4u"):
    """
    VcenterHelper __init__
    Args:
      pc_ip(str):
      prism_user(str):
      prism_password(str):
      provider(str):
      VCENTER_DEFAULT_USERNAME(str):
      VCENTER_DEFAULT_PASSWORD(str):
    """
    self.pc_ip = pc_ip
    self.prism_user = prism_user
    self.prism_password = prism_password
    self.provider = provider
    self.vcenter_default_username = VCENTER_DEFAULT_USERNAME
    self.vcenter_default_password = VCENTER_DEFAULT_PASSWORD

  def get_metrics_data_provider_uuid(self):
    """
    get_metrics_data_provider_uuid
    Args:
      pc_ip:
      provider:
      username:
      password:
    Returns:

    """
    data = {
      "entity_type": "metrics_data_provider",
      "filter_criteria": "name==%s" % self.provider,
      "group_member_attributes": [
        {
          "attribute": "enabled"
        }
      ],
      "group_member_offset": 0
    }
    groups_res = self.get_groups_data(data, silent=True)
    entities = self.retrieve_entity_data(groups_res)
    metrics_data_provider_uuids = [entity["entity_id"] for entity in entities]
    if metrics_data_provider_uuids:
      return metrics_data_provider_uuids[0]
    raise Exception("metrics_data_provider not Loaded..")

  def get_external_entity_schema_uuid(self, provider_uuid):
    # type: (object) -> object
    """
    get_metrics_data_provider_uuid
    Args:
      pc_ip:
      provider_uuid:
      target_type
      username:
      password:
    Returns:

    """
    data = {
      "entity_type": "external_entity_schema",
      "filter_criteria": "data_provider_uuid==%s;type==vcenter" % (
        provider_uuid),
      "group_member_attributes": [
        {
          "attribute": "enabled"
        }
      ],
      "group_member_offset": 0
    }
    groups_res = self.get_groups_data(data, silent=True)
    entities = self.retrieve_entity_data(groups_res)
    external_entity_schema_uuids = [entity["entity_id"] for entity in entities]
    if external_entity_schema_uuids:
      return external_entity_schema_uuids[0]
    raise Exception("Entity Schema not Loaded..")

  def get_data(self, ip_address, cluster_name):
    """
    get_data
    Args:
      ip_address:
      cluster_name

    Returns:

    """
    data_provider_uuid = self.get_metrics_data_provider_uuid()
    external_schema_uuid = self.get_external_entity_schema_uuid(
      provider_uuid=data_provider_uuid)
    data = {
      "app_config":
        {
          "config_json": {
            "name": ip_address,
            "connectionInfo": {
              "vCenter_Host": ip_address,
              "vCenter_User": self.vcenter_default_username,
              "vCenter_Password": self.vcenter_default_password,
              "vCenter_ClusterList": cluster_name
            },
            "collectionEnabled": True,
            "collectionInterval": 1,
            "endpointType": "vcenter"
          }
        },
      "data_provider_name": "nutanix_vcenter",
      "data_provider_uuid": data_provider_uuid,
      "external_entity_schema_uuid": external_schema_uuid,
      "name": ip_address,
      "type": "vcenter",
      "landing_entity_type": "vcenter_instance",
      "ip_address": ip_address
    }
    return data

  def register_vcenter(self, ip_addresses, cluster_name):
    """

    Args:
      ip_addresses:
      cluster_name:
    Returns:

    """
    for index, ip_address in enumerate(ip_addresses):
        data = self.get_data(ip_address=ip_address, cluster_name=cluster_name)
        url = "https://%s:9440/api//aiops/v4.r0.a1/perfmon/test/" \
              "target/configurations" % self.pc_ip
        print("test url is {}".format(url))
        print("data is {}".format(data))
        res = requests.post(url, json=data,
                            auth=(self.prism_user, self.prism_password),
                            verify=False)
        print("response is {}".format(res))
        print("\n %s ****************%s****************" % (index, ip_address))
#        print("\tTEST CONNECTION: %s" % res.json()["status"])

        # if "SUCCEEDED" in res.json()["status"]:
        url = "https://%s:9440/api/aiops/v4.r0.a1/perfmon/" \
              "target/instance" % self.pc_ip
        print("url is %s" % url)
        print("data is {}".format(data))
        res = requests.post(url, json=data,
                            auth=(self.prism_user, self.prism_password),
                            verify=False)

        print "\tConfiguration Status: %s" % res
        print("response is %s" % res)
        res = res.json()
        task_uuid = res["task_uuid"]
        # self.poll_current_task(task_uuid=task_uuid)
        # else:
        #   print "***************FAILED***********: %s" % ip_address
        # print(res, ip_address)


  def get_external_entity_configs(self, attribute="entity_id", filter_ip=None):
    """
    Args:
      attribute(str):
      filter_ip(str):
    Returns:
      entity_ids
    """
    data = {
      "entity_type": "external_entity_config",
      "group_member_offset": 0,
      "group_member_sort_order": "ASCENDING",
      "group_member_attributes": [
        {
          "attribute": "name"
        },
        {
          "attribute": "ip_address"
        }
      ],
      "group_attributes": [],
      "group_offset": 0,
      "group_member_sort_attribute": "name"
    }

    data["filter_criteria"] = "data_provider_name==%s" % self.provider

    if filter_ip:
      data["filter_criteria"] = data["filter_criteria"] + \
                                ";ip_address==%s" % filter_ip

    resp = self.get_groups_data(data, silent=True)
    entities = self.retrieve_entity_data(resp)
    if attribute == "entity_id":
      entity_list = [entity["entity_id"] for entity in entities]
    else:
      entity_list = [entity[attribute][0] for entity in entities]

    print("Entities: %s" % entities)
    print("Entity IDs: %s" % entity_list)
    return entity_list

  def get_groups_data(self, data=None, silent=False):
    """
    get_groups_data
    Args:
      data(dict):
      cluster_ip(str):
      silent(bool):
      username(str):
      password(str):
    Returns:
      resp
    """
    import requests
    url = "https://%s:9440/api/nutanix/v3/groups" % self.pc_ip
    # res = self.http_client.post(url=url, json=data)

    try:
      # print("POST %s" % url)
      res = requests.post(url=url, json=data, verify=False, auth=(
        self.prism_user, self.prism_password))
      if res.ok:
        resp = res.json()
        if not silent:
          print("URL: %s" % url)
          print("Groups Request Payload: %s" % (json.dumps(data, indent=4)))
          print("Groups Response: %s" % (json.dumps(resp, indent=4)))
        return resp
    except Exception as error:
      print("Error Occurred while Get Groups Data: %s" % error.message)
    return {}

  def poll_current_task(self, task_uuid):
    """
    get_current_task
    Args:
      task_uuid(str):
    Returns:

    """
    endtime = time.time() + 300
    while endtime > time.time():
      URL = "https://%s:9440/api/nutanix/v3/tasks/%s" % (
        self.pc_ip, task_uuid)
      res = requests.get(url=URL, json={}, verify=False, auth=(
        self.prism_user, self.prism_password))
      resp = res.json()
      status = resp.get("status")
      if status in ["SUCCEEDED", "FAILED"]:
        print("\tTask Status: %s" % status)
        return
      # # result = self.ecli_client._ecli.execute("task", "poll %s" % task_uuid)
      # print("Response: %s" % result["data"])
      # if result["data"].get("completed_tasks"):
      #   return result["data"]["completed_tasks"][0]

  def retrieve_entity_data(self, entities_data):
    """
    Returns the dictionary of list of entity property from the ret output.
    Args:
      entities_data (dict): Rest output.
    Returns:

    """
    # Check if group results has more than one row
    if entities_data.get("group_results") and "entity_results" in \
      entities_data["group_results"][0]:
      return self.retrieve_entity_data_list(entities_data["group_results"])

    entity_details = []
    if not entities_data["group_results"]:
      return entity_details

    if entities_data:
      for datas in entities_data:
        data = datas['data']
        item_dic = {}
        for item in data:
          value = []
          if len(item['values']) >= 1:
            value += item['values'][0]['values']
          item_dic[item['name']] = value
        item_dic['entity_id'] = datas['entity_id']
        entity_details.append(item_dic)

    return entity_details

  def retrieve_entity_data_list(self, group_results):
    """
    Returns the dictionary of list of entity property from the ret output.
    Args:
      group_results (dict): Rest output.
    Returns:
      List of entity details from group API
    """
    entity_details = []
    if group_results is not None:
      for entity_results in group_results:
        for datas in entity_results["entity_results"]:
          data = datas['data']
          item_dic = {}
          for item in data:
            value = []
            if len(item['values']) >= 1:
              value += item['values'][0]['values']
            item_dic[item['name']] = value
          item_dic['entity_id'] = datas['entity_id']
          entity_details.append(item_dic)

    return entity_details

  def delete_endpoints(self, ip_address=None):
    """
    Delete Endpoints.
    Args:
      ip_address(str):

    Returns:

    """
    entity_ids = self.get_external_entity_configs(attribute="entity_id",
                                                  filter_ip=ip_address)
    for entity_id in entity_ids:
      url = "https://%s:9440/api/aiops/v4.r0.a1/perfmon/target/instance/%s" % (
        self.pc_ip, entity_id)
      res = requests.delete(url, verify=False, auth=(
        self.prism_user, self.prism_password))
      print("Delete Status: %s" % res)
      task_uuid = res.json()["task_uuid"]
      # self.poll_current_task(task_uuid=task_uuid)

if __name__ == "__main__":
  PC_IP = sys.argv[1]
  PRISM_USER = sys.argv[2]
  PRISM_PASSWORD = sys.argv[3]
  VCENTER_DEFAULT_USERNAME = "administrator@vsphere.local"
  VCENTER_DEFAULT_PASSWORD = "Nutanix/4u"


  vcenterconnection = VcenterHelper(pc_ip=PC_IP, prism_user=PRISM_USER,
                     prism_password=PRISM_PASSWORD,
                     VCENTER_DEFAULT_USERNAME=VCENTER_DEFAULT_USERNAME,
                     VCENTER_DEFAULT_PASSWORD=VCENTER_DEFAULT_PASSWORD)

  ip_addresses = ["10.46.1.213"]
  cluster_name = "Vcenter_Collector-2"

  vcenterconnection.register_vcenter(ip_addresses=ip_addresses, cluster_name=cluster_name)
