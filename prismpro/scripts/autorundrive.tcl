#!/bin/tclsh
proc runtimer { seconds } {
set x 0
set timerstop 0
while {!$timerstop} {
incr x
after 1000
  if { ![ expr {$x % 60} ] } {
          set y [ expr $x / 60 ]
          puts "Timer: $y minutes elapsed"
  }
update
if {  [ vucomplete ] || $x eq $seconds } { set timerstop 1 }
    }
return
}
puts "SETTING CONFIGURATION"
dbset db mssqls
diset connection mssqls_server {(local)}
diset tpcc mssqls_driver timed
diset tpcc mssqls_rampup 1
diset tpcc mssqls_duration 2
vuset logtotemp 1
loadscript
puts "SEQUENCE STARTED"
foreach z { 1 2 4 } {
puts "$z VU TEST"
vuset vu $z
vucreate
vurun
#Runtimer in seconds must exceed rampup + duration
runtimer 200
vudestroy
after 5000
}
puts "TEST SEQUENCE COMPLETE"