puts "SETTING CONFIGURATION"
global complete
proc wait_to_complete {} {
global complete
set complete [vucomplete]
if {!$complete} { after 5000 wait_to_complete } else { exit }
}
puts "SETTING CONFIGURATION"
dbset db mssqls
diset connection mssqls_server {(local)}
diset tpcc mssqls_count_ware 10
diset tpcc mssqls_num_vu 5
vuset logtotemp 1
buildschema
wait_to_complete
vwait forever