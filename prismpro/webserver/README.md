Webserver
====================

This webserver consists of 2 applications, a nodejs server and a Reactjs client for the UI portion. The UI should be accessed from a Google Chrome browser.

This server allows proxying requests to a Prism Central. In addition to this it also has some custom APIs/routes/files built in to make it simple to generate alerts.

Routes:
------------
/ - Will take you to the Prism Central
/console/ - Will take you to the Prism Central
/alerts - Will take you to a page to generate fake alerts within the provided Prism Central

To Setup:
------------
Step 1: Start by copying the `webserver.zip` file
(from the directory above this directory) to a Centos7 VM. You can use the http://10.42.194.11/workshop_staging/Linux_ToolsVM.qcow2 image if you don't already have an image to use.

Step 2: To configure the VM run the following commands:

```
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --reload
yum install zip unzip
yum install -y sshpass
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
yum install -y nodejs
npm install -g forever
yum install -y epel-release
yum -y install python-pip
pip install env
pip install python-gflags
pip install six
```

Step 3: Unzip and start the web server. `unzip webserver.zip; cd webserver; ./start.sh`
* The UI should now be available at `http://<VM_IP>`
* If you do not provide a my_local_config.js you will be prompted for a username, password and PC IP to reinitialize the server with.
* To provide my_local_config.js see below

To Debug:
------------
* Logs for the server can be found at `http://<VM_IP>/log` and `http://<VM_IP>/error`


To Setup my_local_config.js:
------------
Follow the steps to setup the local config:
* Create a new local config file called my_local_config.js.
* Customize the proxyHost, userName and userPass for the server you want to connect to.

```
const env = {
  // Config settings for the app script.
  app: {
    // Host to proxy to
    proxyHost: '1.1.1.1',
    // User/Pass for auto login
    userName: 'admin',
    // userPass: 'nutanix/4u',
    userPass: 'Nutanix.123'
  }
};
module.exports = env;

```

To Build:
------------
run `npm run buildZip` to generate a new zipfile for deploying to a VM.

To Run on your Local machine:
------------
Provide a my_local_config.js file locally to proxy to.
Start the app by running `node prismpro-webserver.js` or `npm run start`
