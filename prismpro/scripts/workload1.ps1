invoke-sqlcmd -ServerInstance "localhost" -U "sa" -P "Nutanix.123" -Query "Drop database tpcc;"
cd "C:\Program Files\HammerDB-3.3"
./hammerdbcli auto autorunbuild.tcl
