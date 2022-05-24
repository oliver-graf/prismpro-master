import sys
import os
sys.path.append("/home/nutanix/bin")
import env
sys.path.append(".")
from zeus_util import ZeusUtil

import util.base.log as log
#from qa.tools.serviceability.capacity_planning_fw_tools.zeus_util import ZeusUtil


if __name__ == "__main__":
  ip = sys.argv[1]
  uuid = sys.argv[2]
  cluster_name = sys.argv[3]
  log.initialize("zeus.log")
  print ip, uuid, cluster_name
  zeus_util = ZeusUtil(ip)
  #zeus_util.clean_zeus()
  #zeus_util.create_pe_entry(uuid)
  zeus_util.create_external_cluster_entry(uuid)
  zeus_util.create_zeusconfig_entry(uuid, cluster_name, None)
  zeus_util.create_clusterdatastate_entry(uuid)

  print zeus_util.read_zeusconfig_entry(uuid)

