"""
This Module is to generate the fake alerts based on schema on the cluster, and
this module is not consumable on the local framework. Intended to copy and use
it on the cluster.
"""
#!/usr/bin/env python
#
# Copyright (c) 2015 Nutanix Inc. All rights reserved.
#
# Author: ssundhar@nutanix.com (Sundar Sundhararajan)
#
# This file contains calls that generates fake alerts. It uses
# generate_alert_util and passes needed params for each alert. The input
# params are configured in a json file and the input file passed as command
# line params.
# Copy this file, alert_generate_util.py and the input json file under
# ~/serviceability/bin directory into the CVM. To execute the script,
#
# Eg, python /home/nutanix/serviceability/bin/gen_alert_wrapper.py /home/nutanix/serviceability/bin/
#        alert_wrapper_input.json
# Eg, python /home/nutanix/serviceability/bin/gen_alert_wrapper.py /home/nutanix/serviceability/bin/
#        alert_wrapper_input.json A1001
# Eg, python /home/nutanix/serviceability/bin/gen_alert_wrapper.py /home/nutanix/serviceability/bin/
#        alert_wrapper_input.json A1001,A1005,A1044
#
#   alert_wrapper_input.json can be edited to include newer alerts
# Following line avoids "no-member error" of pylint.
# pylint: disable=unused-wildcard-import
# pylint: disable=unused-import
# pylint: disable=superfluous-parens
# pylint: disable=invalid-name
# pylint: disable=import-error
# pylint: disable=redefined-outer-name
# pylint: disable=no-self-use
# pylint: disable=protected-access
# pylint: disable=wildcard-import
# pylint: disable=too-many-locals
# pylint: disable=too-many-statements
# pylint: disable=multiple-statements
# pylint: disable=undefined-variable

from alert_generate_util import AlertGenerateUtil
import sys
sys.path.insert(0, '/home/nutanix/serviceability/bin')
import env
import json
import random
import time
import gflags

from alerts.interface.alert_pb2 import *
import serviceability.interface.utils as utils
from alerts.interface.notification_pb2 import *


FLAGS = gflags.FLAGS

gflags.DEFINE_string("alert_rca_config_file",
                     "/home/nutanix/serviceability/bin/alert_wrapper_input.json",
                     "File contains all RCA alerts params")

gflags.DEFINE_string("plugin_file",
                     None,
                     "If specified, only this file is validated.")

gflags.DEFINE_boolean("force_duplicate_alerts",
                      True,
                      "Generates duplicate alerts if this flag is set to True.")

gflags.DEFINE_integer("repeat",
                      1,
                      "Generates alerts for the specified number of times.")

cvm_ip_list = utils.svm_ips()
host_ip_list = utils.host_ips()
ipmi_ip_list = utils.ipmi_ips()

#If the cluster is a null cluster we can keep the cvm ip as host and ipmi
if not host_ip_list:
  host_ip_list = cvm_ip_list
  ipmi_ip_list = cvm_ip_list

if not ipmi_ip_list:
  ipmi_ip_list = cvm_ip_list


class FakeAlertGenerateUtil(object):
  """
  class to gen_alert_wrapper module.
  """

  def generate_alert(self, alert_input_dict):
    """
    Generate fake alert.
    Args:
      alert_input_dict(dict): Alert Input Dictionary
    """
    sp = {}
    ctr = {}
    disk_list = self.get_disk_list()
    disk_id = random.choice(disk_list.keys())
    disk = disk_list[disk_id]

    sp_list = self.get_sp_list()
    if sp_list:
      sp = sp_list[sp_list.keys()[0]]

    ctr_list = self.get_ctr_list()
    if ctr_list:
      ctr_id = random.choice(ctr_list.keys())
      ctr = ctr_list[ctr_id]

    host_list = self.get_node_list()
    host_id = random.choice(host_list.keys())
    # host = host_list[host_id]

    params_list = list()
    severity = AlertProto.kCritical
    for param_name in alert_input_dict.keys():
      member = NotificationProto.Member()

      if alert_input_dict[param_name] == "cvm_ip":
        member.member_name = param_name
        member.member_value.string_value = random.choice(cvm_ip_list)
      elif alert_input_dict[param_name] == "host_ip":
        member.member_name = param_name
        member.member_value.string_value = random.choice(host_ip_list)
      elif alert_input_dict[param_name] == "ipmi_ip":
        member.member_name = param_name
        member.member_value.string_value = random.choice(ipmi_ip_list)
      elif disk.has_key(alert_input_dict[param_name]):
        member.member_name = param_name
        member.member_value.string_value = disk[alert_input_dict[param_name]]
      elif sp.has_key(alert_input_dict[param_name]):
        member.member_name = param_name
        member.member_value.string_value = sp[alert_input_dict[param_name]]
      elif ctr.has_key(alert_input_dict[param_name]):
        member.member_name = param_name
        member.member_value.string_value = ctr[alert_input_dict[param_name]]
      else:
        if alert_input_dict["severity"] == "kWarning":
          severity = AlertProto.kWarning
        elif alert_input_dict["severity"] == "kInfo":
          severity = AlertProto.kInfo

        member.member_name = param_name
        member.member_value.string_value = alert_input_dict[param_name]

      params_list.append(member)

    member = NotificationProto.Member()
    member.member_name = "service_vm_id"
    member.member_value.int64_value = host_id
    params_list.append(member)

    # Set this flag to True inorder to generate duplicate alerts.
    if FLAGS.force_duplicate_alerts:
      member = NotificationProto.Member()
      member.member_name = ""
      member.member_value.int64_value = int(time.time())
      params_list.append(member)

    member = NotificationProto.Member()
    member.member_name = "arithmos_id"
    member.member_value.int64_value = host_id
    primary_entity = member

    if alert_util.generate_alert(alert_input_dict["alert_id"], severity,
                                 primary_entity, params_list):
      print "Alert generated for alert id %s" % alert_input_dict["alert_id"]

  def get_disk_list(self):
    """
    Get disk link
    Returns:
      disk_list(list)
    """
    disk_list = {}
    proto = utils.zeus_config_cache_proto()
    if proto is None:
      return None
    else:
      disk_list = dict((disk.disk_id, {
        "disk_serial": disk.disk_serial_id,
        "disk_location": str(disk.disk_location),
        "disk_cvm_ip": self.get_ip_from_svm_id(disk.service_vm_id),
        "mount_path": disk.mount_path,
        "disk_id": str(disk.disk_id),
        "disk_uuid": disk.disk_uuid})
                       for disk in proto.disk_list)

    return disk_list

  def get_node_list(self):
    """
    get node list
    Returns:
      node_list(list)
    """
    node_list = {}
    proto = utils.zeus_config_cache_proto()
    if proto is None: return None
    else:
      node_list = dict((node.service_vm_id,
                        {
                          "service_vm_id": str(node.service_vm_id),
                          "host_cvm_ip": node.service_vm_external_ip,
                          "host_host_ip": node.management_server_name,
                          "node_serial": node.node_serial})
                       for node in proto.node_list)

    return node_list

  def get_sp_list(self):
    """
    get sp_list.
    Returns:
      sp_list(list)
    """
    sp_list = {}
    proto = utils.zeus_config_cache_proto()
    if proto is None: return None
    else:
      sp_list = dict((sp.storage_pool_id,
                      {
                        "storage_pool_id" : str(sp.storage_pool_id),
                        "storage_pool_name" : sp.storage_pool_name,
                        "storage_pool_uuid" : sp.storage_pool_uuid})
                     for sp in proto.storage_pool_list)

    return sp_list

  def get_ctr_list(self):
    """
    Get ctr list.
    Returns:
      ctr_list(list)
    """
    ctr_list = {}
    proto = utils.zeus_config_cache_proto()
    if proto is None: return None
    else:
      ctr_list = dict((ctr.container_id,
                       {
                         "container_id": str(ctr.container_id),
                         "container_name": ctr.container_name,
                         "container_uuid": ctr.container_uuid})
                      for ctr in proto.container_list)

    return ctr_list

  def get_ip_from_svm_id(self, svm_id):
    """
    Get ip from svm_id.
    Args:
      svm_id(str): svm_id
    Returns:
      ip(str)
    """
    proto = utils.zeus_config_cache_proto()
    if proto is None: return None
    for node in proto.node_list:
      if (node.service_vm_id == svm_id):
        return node.service_vm_external_ip

if __name__ == "__main__":
  args = FLAGS(sys.argv)
  alert_util = AlertGenerateUtil()
  fake_alert = FakeAlertGenerateUtil()
  print "<<<< Number of times to generate alerts = %d >>>>" \
        " <<<< force duplicates: %s >>>>" \
        %(FLAGS.repeat, FLAGS.force_duplicate_alerts)

  with open(args[1], 'r') as test_file:
    alert_param_dict_list = json.load(test_file)

  alert_ids = ""
  alert_id_list = ""

  # If alert id(s) passed as parameter, convert it to a list and generate alert
  if len(args) >= 3:
    alert_ids = args[2]
    print "Alert Ids >>>>>>>>>>>>>> %s" %alert_ids
    alert_id_list = alert_ids.split(',')

    repeats = [arg for arg in args if "repeat" in arg]
    if repeats:
      FLAGS.repeat = int(repeats[0].split('=')[-1].strip())
      print "REPEAT :%s" %FLAGS.repeat
      FLAGS.force_duplicate_alerts = True

  # if vm name and vm uuid param are passed
  if len(args) >= 5:
    vm_uuid = args[3]
    vm_name = args[4]
    # Set the uuid and name for each alert....
    for alert in alert_param_dict_list:
      alert["vm_uuid"]=vm_uuid
      alert["vm_name"]=vm_name
    print "SARAH +++ Alert Dict >>>>>>>>>>>>>> %s" %alert_param_dict_list

  # Run generate_alert only for the given alert Id's
  if alert_ids:
    if FLAGS.repeat != 1:
      for i in range(0, FLAGS.repeat):
        sleep_secs = [0.1, 0.5, 1, 2]
        for alert_param_dict in alert_param_dict_list:
          for alert_id in alert_id_list:
            if alert_id in alert_param_dict.values():
              fake_alert.generate_alert(alert_param_dict)
              time.sleep(random.choice(sleep_secs))
        print "<<<<<< Completed generating all alerts: %d >>>>>>>>" % (i+1)
    else:
      for alert_param_dict in alert_param_dict_list:
        for alert_id in alert_id_list:
          if alert_id in alert_param_dict.values():
            print "<<<<<<<< Alert Id: %s >>>>>>>>>" %alert_id
            fake_alert.generate_alert(alert_param_dict)
  else:
    for i in range(0, FLAGS.repeat):
      for alert_param_dict in alert_param_dict_list:
        fake_alert.generate_alert(alert_param_dict)
      print "<<<<<<Completed generating all alerts: %d >>>>>>>>" % (i+1)
