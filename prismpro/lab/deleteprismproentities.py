import sys
sys.path.insert(0, "/home/nutanix/neuron/bin")
import env
import util.ncc.ncc_utils.globals
import env
import util.ncc.plugins.consts as consts
import util.ncc.config_module.config as config
from util.ncc.config_module.config import *
from util.ncc.ncc_utils.globals import HealthServerGlobals
from google.protobuf import text_format
hglobals = HealthServerGlobals()
db = hglobals.get_insights_da()
db.delete_entity("cluster", "00057d50-00df-b390-0000-00000000eafd")
db.delete_entity("vm", "bootcamp_constrained_1")
db.delete_entity("vm", "bootcamp_constrained_2")
db.delete_entity("vm", "bootcamp_good_1")
db.delete_entity("vm", "bootcamp_inactive1")
db.delete_entity("vm", "bootcamp_overprovisioned_1")
db.delete_entity("vm", "bootcamp_overprovisioned_2")
