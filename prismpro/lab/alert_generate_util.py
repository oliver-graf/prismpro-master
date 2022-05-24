"""
This Module is to generate the fake alerts based on schema on the cluster, and
this module is not consumable on the local framework. Intended to copy and use
it on the cluster.
"""
#
# Copyright (c) 2015 Nutanix Inc.  All rights reserved.
#
# Author: akumar@nutanix.com  (Avinash Kumar)
#
# Python util and test to create a alert.
#
# Example usage:
#  alert_util = AlertGenerateUtil()
#  alert_util.generate_alert(alert_name, AlertProto.kCritical,
#       primary_entity, params_list):
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
# pylint: disable=undefined-variable
# pylint: disable=no-value-for-parameter, multiple-imports

import sys
sys.path.insert(0, '/home/nutanix/serviceability/bin')
import os
import re
import env
import traceback, threading
import gflags
import serviceability.interface.utils as utils
import util.base.log as log
import util.cluster.version as cluster_version

from alerts.interface.alert_pb2 import *
from alerts.interface.notification_pb2 import *
from serviceability.interface.analytics_data_transfer_pb2 import *
from util.misc.protobuf import safe_has_field
from util.ncc.config_module.config import ConfigModule
from util.ncc.ncc_utils.alert_helper import AlertManagerHelper
from util.ncc.ncc_utils.globals import HealthServerGlobals

FLAGS = gflags.FLAGS

class AlertGenerateUtil(object):
  """
  class for alert generate module.
  """

  def __init__(self):
    """
    initializer for AlertGenerateUtil
    """
    self.__config_module = ConfigModule(FLAGS.config_file_dir)

  def generate_alert(self, alert_id, severity, primary_entity, params_list):
    """
    Generates alert using alert name , severity, primary entity and params list.
    Args:
      alert_id(str): Alert Id of the alert
      severity(str): Serverity of the alert
      primary_entity(tuple): The primary arithmos_entity name value tuple
      params_list(list): Params in the alert message. List of name/value tuples.
    Returns:
      bool
    """

    plugin_check_schema = \
      self.__config_module.get_check_schema_from_alert_id(alert_id)
    if not plugin_check_schema:
      print("Failed to find check schema for alert id %s" % alert_id)
      return None

    check_id = long(plugin_check_schema.id)

    if len(plugin_check_schema.affected_entities_list) > 1:
      print("Multiple entities within a schema is currently not supported  "
            "for external alerts.")
      return None
    arithmos_entity_type = plugin_check_schema.affected_entities_list[0]
    print("Entity type is %d." % arithmos_entity_type)

    arithmos_entity_id = self.__get_arithmos_entity_id(arithmos_entity_type,
                                                       primary_entity)
    if not arithmos_entity_id:
      print("Failed to get arithmos entity id.")
      return None

    alert_config = self.__get_alert_config(plugin_check_schema, severity)

    if alert_config is None:
      print("Failed to get alert_config.")
      return None

    alert_uid = alert_config.alert_id
    alert_title = alert_config.alert_title
    alert_message = alert_config.alert_msg

    params_list.append(primary_entity)

    print("Alert Generate Params:"
          "arithmos_entity_type - %s,\n"
          "arithmos_entity_id - %s,\n"
          "check_id - %s,\n"
          "alert_uid - %s,\n"
          "alert_title - %s,\n"
          "alert_message - %s,\n"
          "severity - %s\n" %
          (
            str(arithmos_entity_type), str(arithmos_entity_id), str(check_id),
            str(alert_uid), str(alert_title), str(alert_message),
            str(severity)))
    print "params_list:"
    for param in params_list:
      print str(param)

    version = re.findall(r'\d+\.\d+', cluster_version.get_cluster_version())

    if version and version[0] <= '5.1':
      AlertManagerHelper.handle_alert(
        arithmos_entity_type, arithmos_entity_id, check_id,
        alert_config, severity, params_list)
    else:
      AlertManagerHelper.handle_alert(
        plugin_check_schema, arithmos_entity_type, arithmos_entity_id,
        severity, params_list)

    return True

  def __get_alert_config(self, check_schema, severity):
    """
    Gets the alert config based on check schema and severity.
    Args:
      check_schema(obj): check schema
      severity(str): severity
    Returns:
      alert_config
    """
    if not safe_has_field(check_schema, "alert_config"):
      print "No alert config found"
      return None

    alert_config = check_schema.alert_config

    alert_severity = None
    if (severity == AlertProto.kCritical and
        safe_has_field(alert_config, "critical_threshold")):
      alert_severity = AlertProto.kCritical
    elif (severity == AlertProto.kWarning and
          safe_has_field(alert_config, "warning_threshold")):
      alert_severity = AlertProto.kWarning
    elif (severity == AlertProto.kInfo and
          safe_has_field(alert_config, "info_threshold")):
      alert_severity = AlertProto.kInfo

    if alert_severity is None:
      print "Specified severity %d doesn't exist in alert config." % severity
      return None

    return alert_config

  def __get_arithmos_entity_id(self, arithmos_entity_type, primary_entity):
    """
    Gets the arithmos specific entity id based on arithmos_entity_type and
    primary_entity
    Args:
      arithmos_entity_type(str): arithmos_entity_type
      primary_entity(str): primary_entity
    Returns:
      entity_id(str)
    """
    entity_proto = DataExchangeProto.EntityProto()
    entity_proto.type = arithmos_entity_type
    identifier = entity_proto.identifiers.add()
    identifier.key_name = primary_entity.member_name
    if safe_has_field(primary_entity.member_value, "bool_value"):
      identifier.bool_value = primary_entity.member_value.bool_value
    if safe_has_field(primary_entity.member_value, "int64_value"):
      identifier.int_value = primary_entity.member_value.int64_value
    if safe_has_field(primary_entity.member_value, "string_value"):
      identifier.string_value = primary_entity.member_value.string_value
    log.INFO(entity_proto)
    entity_id = (
      HealthServerGlobals().get_arithmos_interface().get_entity_id(
        entity_proto))
    return entity_id

if __name__ == "__main__":
  alert_util = AlertGenerateUtil()

  alert_id = "A1030"

  params_list = list()
  member = NotificationProto.Member()
  member.member_name = "ip_address"
  member.member_value.string_value = utils.service_vm_external_ip()
  params_list.append(member)

  member = NotificationProto.Member()
  member.member_name = "downtime"
  member.member_value.int64_value = 1111
  params_list.append(member)

  member = NotificationProto.Member()
  member.member_name = "available"
  member.member_value.bool_value = False
  params_list.append(member)

  member = NotificationProto.Member()
  member.member_name = "service_vm_id"
  member.member_value.int64_value = utils.service_vm_id()
  params_list.append(member)

  member = NotificationProto.Member()
  member.member_name = "arithmos_id"
  member.member_value.int64_value = utils.service_vm_id()
  primary_entity = member

  if alert_util.generate_alert(alert_id, AlertProto.kCritical,
                               primary_entity, params_list):
    print("Alert Generated")
  else:
    print("Failed to generate alert.")

  # We have some zookeeper threads listening for changes. Call exit explicitly
  # to terminate.
  os._exit(0)
