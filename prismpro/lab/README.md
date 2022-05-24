# lab
Step 1: Copy this directory to the Prism Central
```scp -r lab nutanix@<PC-IP>:~/lab```

Step 2: SSH into the PC and cd to lab.

Step 3: Run `./initialize_lab.sh <PC_IP>`
Where PC_IP is the IP address of the Prism Central this script is being run on. This step will seed
the fake VMBL data in IDF.

Additional Notes:
------------

If you are having issues upgrading the Prism Central due to the version of the Prism-Pro-Cluster not
being supported, you can run the python deleteprismprocluster.py from the lab directory inside the PC
which will delete the fake cluster to allow upgrading.

Once the upgrade is complete run `./initialize_capacity.sh <PC_IP>` to recreate the cluster.

Note: The cluster will get re created every hour because we have a cron job running to generate new capacity data hourly - so in case you do this and run into the issue again, just go ahead and run the python script again right before you need to perform the upgrade prechecks.

Troubleshooting:
------------

* There is a small chance where either the VM Efficiency widget in the dashboard will not include the fake bootcamp VMs in its count, or the Capacity page for the Prism-Pro-Cluster may fail to show the charts. In that case, ssh into the pc and run `cd lab; ./repair.sh <PC_IP>`. This should resolve any issues.
