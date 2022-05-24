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
options = {"create_entity" : True}


current_time = int(round(time.time()))
april_25 = "04/25/2019"
time_delta = int(round(time.time()) - time.mktime(datetime.datetime.strptime(april_25, "%m/%d/%Y").timetuple()))

all_files = {}

for entity_type, _ , entity_files in os.walk(".", topdown=False):
	if entity_type == "." or "xfit" in entity_type or ("vm" not in entity_type and "cluster" not in entity_type):
		continue
        entity_type = entity_type[2:]
	all_files[entity_type] = entity_files

# print "all files", all_files
entity_types = ["cluster", "vm"]

for entity_type in entity_types:
	path = "entity_type"

	completed_entity_ids = set()
	for file in all_files[entity_type]:

		ed_start_time = 1000000000000
		ed_end_time = -1
		ed_fields = []

		entity_id = ""
                #print "-------", file, "--" ,file.split("_attr.json")
		if len(file.split("_attr.json")) == 2:
                 #       print "----111---", file, "--" ,file.split("_attr.json")
			entity_id = file.split("_attr.json")[0]
		else:
                  #      print "---222----", file, "--" ,file.split("_metrics.json")
			entity_id = file.split("_metrics.json")[0]

		if entity_id in completed_entity_ids:
			continue
		completed_entity_ids.add(entity_id)

                # print "entity id", entity_id
		if entity_type != "vm_small":
			attribute_file = open(entity_type + "/" + entity_id + "_attr.json", "rb")
		metric_file = open(entity_type + "/" + entity_id + "_metrics.json", "rb")

                if entity_type != "vm_small":
			# print "Creating", entity_type ," with entity id = ", entity_id
			idf.register_entity(entity_type=entity_type, attribute_dict=json.loads(attribute_file.read()), entity_id=entity_id)
			# print "Created", entity_type ,"with entity id = ", entity_id

		# print "Adding metrics for ", entity_type," with entity id = ", entity_id

		# print type(metric_file.read())
		entity_data = EntityData()
		entity_data.from_jsons(metric_file.read())
		fd_list = entity_data.get_field_data_list(entity_id)

		for fd in fd_list:
			if entity_type =="vm" and ("lower" in fd.field_name or "upper" in fd.field_name):
				continue
			ed = EntityData()
			fd.start_time_usec = fd.start_time_usec + (time_delta * 1000000)
			fd.end_time_usec = current_time * 1000000

			ed_start_time = min(ed_start_time, fd.start_time_usec)
			ed_end_time = max(ed_end_time, fd.end_time_usec)

			ed_fields.append(fd.field_name)
			entity_type_temp = entity_type
			ed.append_field_data(entity_id, fd)
			if entity_type == "vm_small":
				entity_type_temp = "vm"
				# print fd.values
				last_good_value = -1
				for i in range(len(fd.values)):
					if i == 0:
						continue
					if fd.values[i] == -1:
						fd.values[i] = last_good_value
					if fd.values[i] != -1:
						last_good_value = fd.values[i]

				zeroes = 0
				non_zeroes = 0
				for x in fd.values:
					if x==0:
						zeroes = zeroes+1
					else:
						non_zeroes = non_zeroes+1
				# print "num of zeroes =",zeroes," and num of non zeroes = ",non_zeroes," for ", fd.field_name, " of ",entity_id
                        time.sleep(0.5)
                        fd.update_start_time_usec()
                        ed_start_time = (fd.start_time_usec)
                        ed_end_time = (fd.end_time_usec)
			# print "Prepared entity data object for ", entity_type," with entity id = ", entity_id
                        idf.write(ed, entity_type_temp, entity_id, [fd.field_name], fd.start_time_usec/1000000, fd.end_time_usec/1000000, fd.sampling_interval_sec)
			# print "Added metrics for ", entity_type," with entity id = ", entity_id," field_name= ",fd.field_name," and sampling interval = ",fd.sampling_interval_sec
		#print "Prepared entity data object for ", entity_type," with entity id = ", entity_id
		#idf.write(entity_data, entity_type, entity_id, ed_fields, ed_start_time, ed_end_time, sampling_interval)
		# print "Added metrics for ", entity_type," with entity id = ", entity_id





