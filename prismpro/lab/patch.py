import sys
sys.path.insert(0, "/home/nutanix/ncc/bin")

import env
import util.ncc.plugins.consts as consts
import util.ncc.config_module.config  as config

from util.ncc.data_access.data_interface import *

from util.ncc.config_module.config import *
from util.ncc.ncc_utils.globals import HealthServerGlobals
from serviceability.interface.plugin_schema_pb2 import *
from google.protobuf import text_format
import datetime
import time
import math
import copy
import os
import json

hglobals = HealthServerGlobals()
idf = hglobals.get_insights_da()

def set_ui_ready_flag(entity_id):
        now = long(time.time())*10**6
        start_time = now - 5 * 86400 * 10**6
        end_time = now + 5 * 86400 * 10**6
        values = [1]*11
        ed = EntityData()
        ed.add_field_data(entity_id, start_time, end_time, 86400, "capacity.ui_ready_flag_insights", values)
        idf.write(ed, "cluster", entity_id, ["capacity.ui_ready_flag_insights"], start_time, end_time, 86400)

set_ui_ready_flag("00057d50-00df-b390-0000-00000000eafd")
