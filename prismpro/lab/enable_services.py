import sys
import requests
import time
import json

requests.packages.urllib3.disable_warnings()


class EnableServiceHelper(object):
  """
  EnableServiceHelper
  """

  def __init__(self, pc_ip, prism_user="admin", prism_password="Nutanix.123"):
    """
    EnableServiceHelper __init__
    Args:
      pc_ip(str):
      prism_user(str):
      prism_password(str):
    """
    self.pc_ip = pc_ip
    self.prism_user = prism_user
    self.prism_password = prism_password

  def enable_v4_service(self, service):
    """
    enable v4 collector
    Args:
      service(str): Service name to be enabled('nutanix-vcenter' or 'nutanix-netflow')
    Returns:
    """
    headers = {'content-type': 'application/json;charset=UTF-8', 'X-NTNX-TREAT-EXTERNAL': 'true'}
    url = "https://{}:9440/api/aiops/v4.r0.a1/perfmon/" \
          "dataprovider/{}/$actions/enable" . format(self.pc_ip, service)
    res = requests.post(url=url,
                        auth=(self.prism_user, self.prism_password),
                        headers=headers,
                        verify=False)
    print("url is {}".format(res.url))
    print "\tConfiguration Status: %s" % res
    print("response body %s" % res.content)
    # print("headers are %s" % res.headers)

  def start_service(self, service, param):
    """
    Enable xdiscovery or dpm service on PC

    Args:
      service(str): Service Name to be Enabled ('XdiscoveryService' or
        'DpmService')
    Returns:
      None
    """
    base_url = "https://%s:9440/PrismGateway/services/rest/v1/aiops/" \
                "v2.r0.a1/" % self.pc_ip
    url = "{}perfmon/{}/$actions/enable{}" . format(base_url, service, param)
    res = requests.post(url=url,
                        auth=(self.prism_user, self.prism_password),
                        verify=False)
    print("url is {}".format(res.url))
    print "\tConfiguration Status: %s" % res
    print("response body %s" % res.content)
    # print("headers are %s" % res.headers)

if __name__ == "__main__":
  PC_IP = sys.argv[1]
  PRISM_USER = sys.argv[2]
  PRISM_PASSWORD = sys.argv[3]


  enableservicehelper = EnableServiceHelper(pc_ip=PC_IP, prism_user=PRISM_USER, prism_password=PRISM_PASSWORD)

  enableservicehelper.start_service("DpmService", "?enable=true")
  enableservicehelper.start_service("XdiscoveryService", "")
  enableservicehelper.enable_v4_service("nutanix-netflow")
  enableservicehelper.enable_v4_service("nutanix-vcenter")
