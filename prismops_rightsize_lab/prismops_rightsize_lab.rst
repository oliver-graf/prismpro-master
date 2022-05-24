-------------------------------
Right-sizing VMs with Prism Pro
-------------------------------

Overview
+++++++++

In this lab you will learn how Prism Pro can help IT Admins monitor, analyze and automatically act when a VM's memory resource is constrained.

Inefficiency Detection with Prism Pro X-FIT
+++++++++++++++++++++++++++++++++++++++++++

Prism Pro uses X-FIT machine learning to detect and monitor the behaviors of VMs running within the managed clusters.

Using machine learning, Prism Pro then analyzes the data and applies a classification to VMs that are learned to be inefficient. The following are short descriptions of the different classifications:

- **Overprovisioned:** VMs identified as using minimal amounts of assigned resources.
- **Inactive:** VMs that have been powered off for a period of time or that are running VMs that do not consume any CPU, memory, or I/O resources.
- **Constrained:** VMs that could see improved performance with additional resources.
- **Bully:** VMs identified as using an abundance of resources and affecting other VMs.

.. note::

   The following instructions are executed in Prism Ops Lab Utility Server console which is accessed via Prism Ops Lab Utility Server at ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/``

   Prism Ops Lab Utility Server has functions to simulate the environment for doing this lab. Doing the lab on the Prism Central will not show simulated environment and labs will **not** work.

   In case, the ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/``  does not load for a while. Restart your **PrismProLabUtilityServer** VM from Prism Central/Prism Element.

#. In **Prism Ops Lab Utility Server**, select :fa:`bars` **> Dashboard** (if not already there).

#. From the Dashboard, take a look at the VM Efficiency widget. It is possible it may not be in the same position as in the below screen capture. This widget gives a summary of inefficient VMs that Prism Pro’s X-FIT machine learning has detected in your environment. 

#. Click on the **View All Inefficeint VMs** link at the bottom of the widget to take a closer look.

   .. figure:: images/ppro_58.png

#. You are now viewing the Efficiency focus in the VMs list view with more details about why Prism Pro flagged these VMs. You can hover the text in the Efficiency detail column to view the full description.

   .. figure:: images/ppro_59.png

#. Once an admin has examined the list of VM on the efficiency list they can determine any that they wish to take action against. From VMs that have too many or too little resources they will require the individual VMs to be resized. This can be done in a number of ways with a few examples listed below:

   * **Manually:** An admin edits the VM configuration via Prism or vCenter for ESXi VMs and changes the assigned resources.
   * **X-Play:** Use X-Plays automated play books to resize VM(s) automatically via a trigger or admins direction. There will be a lab story example of this later in this lab.
   * **Automation:** Use some other method of automation such as powershell or REST-API to resize a VM.


Increase Constrained VM Memory with X-Play based on Conditional Execution
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Now let’s look at how we can take automated action to resolve some of these inefficiencies. 

For this lab we will assume that ``LinuxToolsVM`` VM is constrained for memory, and will go through automatically remediating the right sizing of this VM. 

We will also use a custom ticket system to give an idea of how this typical workflow could integrate with ticketing system such as ServiceNow and use string parsing and conditional execution, two of our latest capabilities added into X-Play.

.. note::

  If your cluster is a Single Node HPOC (SPOC), you will just use the one ``LinuxToolsVM`` as your target VM as there will be no other participants sharing your SPOC

  If you cluster is a Multi Node HPOC, several Linux tools VMs are already created by Staging runbooks. Your instructor will assign the correct VM to you. Make sure to ask your instructor for the name of VM to use

  For example: 

  - Bootcamp participant 1 will be assigned ``LinuxToolsVM-User01``
  - Bootcamp participant 2 will be assigned ``LinuxToolsVM-User02``


Playbook 1
-----------

#. In the Prism Ops Lab Utility Server Console ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/`` 

#. Click on :fa:`bars` > **Compute & Storage** and choose **VMs**

#. Navigate to your **LinuxToolsVM-User0X** in the VM list. Note the current **Memory Capacity** of the VM, as we will later increase it with X-Play. 

   You may need to scroll down within the **Properties** widget to find this value.

   .. figure:: images/linuxvm.png

#. Click on :fa:`bars` > **Operations** > **Playbooks**.

   .. figure:: images/navigateplaybook.png

#. We will need to create a couple of Playbooks for this workflow to be possible. Let's start by clicking **Create Playbook**. 

   We will first be creating the Playbook that will be increasing the Memory of the VM. We want to create a playbook that reads in a string coming from the ticket system (approved or denied in our case) and have conditional branching and execution of the next steps.

   .. figure:: images/rs3b.png

#. Select **Webhook** as the trigger. 
 
   Using this trigger exposes a public API that allows scripts and third party tools such as ServiceNow to use this Webhook to call back into Prism Central and trigger this playbook. 
   
   In our case, this Playbook will be called by the ticket system to initiate conditional execution.

   .. figure:: images/rs16.png

#. Click the **Add Action** item on the left side.

   .. figure:: images/rs17.png

#. Search and select the **String Parser** action. 

   This action allows the user to parse data coming from a string which can then subsequently be used in the succeeding actions.

   .. figure:: images/addparse.png

#. Fill the following fields:

   .. note::

      The input from the webhook will be in the format {"message":"The request was approved.","status":"approved"}** or **{"message":"The request was denied.","status":"denied"}. This is for your information as to what is happening in the background. You do not need to input these values.
   
      We will picking out the status field as **string5** to check if the request was approved or denied. Fill in the other fields as instructed below. 

   - **String to Parse**   - String5 (select by clicking on the **Parameters** link and scroll down to choose **String5**)

   - **Format**            - JSON

   - **JSON Path**         - $.status

   .. figure:: images/editparse.png

#. Then click **Add Action** to add the next action.

#. Now we’ll add our first condition - Select the **Branch** action. The branch action gives the ability to execute different action sequences based on the conditions and criteria matched.

   .. figure:: images/addbranch.png

#. Fill the following fields:

   - **Condition**   - If 
   - **Operand**     - Parsed String (select by clicking on the **Parameters** link and scroll down to choose **Parsed String**)
   - **Operator**    - ``=``
   - **Value**       - approved

   .. figure:: images/editbranch.png

#. Click add **Add Action** under the **Branch** action.

#. First action we want to take is add memory to the VM. Search and select the **VM Add Memory** action. Fill the following fields:
   
   - **Target VM**         - Webhook: entity1 (select by clicking on the **Parameters** link and scroll down to choose **entity1**)
   - **Memory to Add**     - 1  (GiB)
   - **Maximum Limit**     - 20 (GiB)
   
   .. figure:: images/addmemory.png

#. Click **Add Action** to add the next action.

#. Select the **Resolve Alert** action. Fill the following fields:

   - **Parameters**  - entity2 (select by clicking on the **Parameters** link and scroll down to choose **Webhook: entity2**)

   .. figure:: images/resolvealert.png

#. Then click **Add Action** and choose the **Email** action.

#. Fill the following fields:

   - **Recipient:** - Fill in your email address.
   - **Subject:** - ``Playbook {{playbook.playbook_name}} was executed.``
   - **Message:** - ``{{playbook.playbook_name}} has run and has added 1GiB of Memory to the VM {{trigger[0].entity1.name}}.``

   .. note::

      You are welcome to compose your own subject message. The above is just an example. You could use the “parameters” to enrich the message.

   .. figure:: images/approvedemail.png

#. Now, we would like to call back to the ticket service to resolve the ticket in the ticket service. Click **Add Action** to add the **REST API** action. Fill in the following values replacing the <PrismOpsLabUtilityServer_IP_ADDRESS> in the URL field. This concludes our first conditional branch for an approved request.

   - **Method:**           - PUT
   - **Username**          - leave blank
   - **Password**          - leave blank
   - **URL:**              - ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/resolve_ticket/``
   - **Request Body:**     - ``{"incident_id":"{{trigger[0].entity2.uuid}}"}``
   - **Request Header:**   - ``Content-Type:application/json;charset=utf-8``

   .. figure:: images/resolveticket.png

#. Next we’ll add the 2nd condition for when the request is denied. 

#. Click on **Add Condition** followed by **Add Action** and choose the **Branch** action. Choose to use the **Else** condition. 

   .. note:: 
      
      We could also add **Else If** we wanted to check more than just the approved and denied condition. For now we’ll use just **Else**. We can also add a description for this action as "Denied" following the same steps that we did for the "Approved" Branch description above.

   .. figure:: images/elsebranch.png

#. On this condition we just want to send out an email notifying the user that the request has been denied and the memory was not added. Click **Add Action** and choose the **Email** action. Fill in the field in the email action. Here is an example.

   - **Description** - Denied (Click on the Pencil icon next to email action to input this value)
   - **Recipient:**  - Fill in your email address.
   - **Subject:**    - ``Memory Increase Request Denied``
   - **Message:**    - ``The request to increase the memory of your VM {{trigger[0].entity1.name}} by 1 GB was denied. If you'd like to review the ticket please navigate to http://<PrismOpsLabUtilityServer_IP_ADDRESS>/ticketsystem``

   .. figure:: images/deniedemail.png

#. Click **Save & Close** button and enter the following fields.

   - **Name**              - *Initials* - Resolve Service Ticket” 
   - **Description**       - Leave blank
   - **Playbook Status**   - Enabled (toggle to Enabled)

#. Click on **Save**.

Playbook 2
-----------

For the next part of this lab, We will create a custom action to be used in our 2nd playbook.

.. note::

 If you understand how to set up Playbooks already and wish to do so, you have the option to skip the setup of the next Playbook. 

 We recommend reading through the steps to create the Playbook to better understand what it is doing.
 
 Instead follow the steps under the Importing/Exporting Playbooks :ref:`import-export-section` below. 

#. In the Prism Ops Lab Utility Server Console ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/`` 

#. Go to click on :fa:`bars` > **Operations > Playbooks > Action Gallery** from the left hand side menu. 

   .. figure:: images/rs3c.png

#. Select the **REST API** action and choose the **Clone** operation from the actions menu. 

   .. figure:: images/rs4.png

#. Fill in the following values replacing your initials in the *Initials* part, and the <PrismOpsLabUtilityServer_IP_ADDRESS> in the URL field.

   - **Name:** *Initials* - Generate Service Ticket
   - **Method:** POST
   - **Username** - leave blank
   - **Password** - leave blank
   - **URL:** - ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/generate_ticket/``
   - **Request Body:** ``{"vm_name":"{{trigger[0].source_entity_info.name}}","vm_id":"{{trigger[0].source_entity_info.uuid}}","alert_name":"{{trigger[0].alert_entity_info.name}}","alert_id":"{{trigger[0].alert_entity_info.uuid}}", "webhook_id":"<ENTER_ID_HERE>","string1":"Request 1GiB memory increase."}``
   - **Request Header:** - ``Content-Type:application/json;charset=utf-8``

   .. figure:: images/rs5.png

#. Click **Copy**. 

#. Now switch to the Playbooks list by clicking the **List** item in the top menu. 

   .. figure:: images/rs6.png

#. We will need to copy the Webhook ID from the first Playbook we created so that it can be passed in the generate ticket step. 

#. Open your Resolve Service Ticket playbook (E.g: XYZ - Resolve Service Ticket) and copy the Webhook ID to your clipboard. 

   .. figure:: images/webhookid.png

#. Now we will create a Playbook to automate the generation of a service ticket. 

#. Close your Playbook and then click **Create Playbook** at the top of the table view. 

   .. figure:: images/rs7.png

#. Select **Alert** as a trigger. 

   .. figure:: images/rs8.png

#. Search and select **VM {vm_name} Memory Constrained** as the alert policy, since this is the issue we are looking to take automated steps to remediate. 

   .. figure:: images/rs9.png

#. Select the *Specify VMs* radio button and choose the VM (E.g. LinuxToolsVMUser0X) you created for the lab. This will make it so only alerts raised on your VM will trigger this Playbook. 

   .. figure:: images/selectvm.png

#. First, we would like to generate a ticket for this alert. 

#. Click **Add Action** on the left side and select the **Initials - Generate Service Ticket** action you created. Notice the details from the **Generate Service Ticket** Action you created are automatically filled in for you. Go ahead and replace the **<ENTER_ID_HERE>** text with the Webhook ID you copied to your clipboard. 

   .. figure:: images/serviceticket.png

#. Next we would like to notify someone that the ticket was created by X-Play. 

#. Click **Add Action** and select the Email action. Fill in the field in the email action. Here are the examples. Be sure to replace <PrismOpsLabUtilityServer_IP_ADDRESS> in the message with it's IP Address. 

   - **Recipient:** - Fill in your email address.
   - **Subject :** - ``Service Ticket Pending Approval: {{trigger[0].alert_entity_info.name}}``
   - **Message:** - ``The alert {{trigger[0].alert_entity_info.name}} triggered Playbook {{playbook.playbook_name}} and has generated a Service ticket for the VM: {{trigger[0].source_entity_info.name}} which is now pending your approval. A ticket has been generated for you to take action on at http://<PrismOpsLabUtilityServer_IP_ADDRESS>/ticketsystem``

   .. figure:: images/rs13.png

#. Click **Save & Close** button and save it with the following details: 

   - **Name**              - *Initials* - Generate Service Ticket for Constrained VM
   - **Description**       - Leave blank
   - **Playbook Status**   - Enabled (toggle to Enabled)

   .. figure:: images/rs14.png

#. Now let's trigger the workflow. Navigate to the tab you opened in the setup with the **/alerts** URL [example 10.38.17.12/alerts]. Select the Radio for **VM Memory Constrained** and input your VM. Click the **Simulate Alert** button. This will simulate a memory constrained alert on your VM.

   .. figure:: images/alertsimulate.png

#. You should recieve an email to the email address you put down in the first playbook. It may take up to 5 minutes.

   .. figure:: images/ticketemail.png

#. Inside the email click the link to visit the ticket system. Alternatively you can directly access the ticket system by navigating to ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/ticketsystem`` from a new tab in your browser.

   .. figure:: images/ticketsystem.png

#. Identify the ticket created for your VM, and click the vertical dots icon to show the Action menu. Click the **Deny** option. This will call the Webhook that was passed in the REST API to generate the service ticket, which will trigger the Resolve Service Ticket Playbook. It will pass on the condition for branching action and execute the **Denied** workflow. You should receive an email within a few minutes with the message input for this condition.

   .. figure:: images/ticketoption.png

#. While you wait for the email, switch back to the previous tab with the ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/``. Open up the details for the **`Initials` - Resolve Service Ticket** Playbook 

#. Click the **Plays** tab towards the top of the view to take a look at the Plays that executed for this playbook. The sections in this view can be expanded by clicking to show more details for each item. If there were any errors, they would also be surfaced in this view. 

#. Click on the **String Parser** action to confirm that the right condition was passed in from the webhook.

   .. figure:: images/deniedplay.png

#. Now navigate back to the ticket system either using the link in the denied email or going directly to ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/ticketsystem``

#. Identify the ticket created for your VM, and click the vertical dots icon to show the Action menu. 

#. Click the **Approve** option. This will call the Webhook that was passed in the REST API to generate the service ticket, which will trigger the Resolve Service Ticket Playbook. It will pass on the condition for branching action and execute the **Approved** workflow. It will also pass on the information for the VM and Alert that triggered the workflow so the following actions to add memory and resolve alert are also executed.

   .. figure:: images/ticketoption.png

#. Switch back to the previous tab with the Prism Central console open. Open up the details for the **`Initials` - Resolve Service Ticket** playbook

#. Click the **Plays** tab towards the top of the view to take a look at the Plays that executed for this playbook. The sections in this view can be expanded to show more details for each item. If there were any errors, they would also be surfaced in this view. 

#. Click on the **String Parser** action to confirm that the right condition was passed in from the webhook.

   .. figure:: images/approvedbranch.png

#. Nvigate back to your VM and verify that the RAM was increased by 1 GiB.

   .. figure:: images/finalmemory.png

#. You should also get an email indicating the successful playbook run.

   .. figure:: images/successemail.png

.. _import-export-section:

Importing/Exporting Playbooks
++++++++++++++++++++++++++++++

X-Play now has the ability to import and export playbooks across Prism Centrals. In the example below we will show how to import the playbook that is created in the preceding steps. The user will still need to create the alert policies and go through the workflow to trigger the alert as listed in the steps in the previous section. We recommend reading through the steps to create the playbook and understanding them properly.

#. Download the file which is an export of the playbook `here <https://drive.google.com/file/d/1f5utfXCp1MJZc-KIxGQwkigkxVnd4OVp/view?usp=sharing>`_ . The extension of the downloaded file should be **.pbk**. If not, rename downloaded file extension to **.pbk**. 

   .. note::

      Importing/Exporting Playbooks should be done in Prism Central URL
      
      **Do not do this on the Lab Utility Server**

#. Go to Prism Central > :fa:`bars` > Operations > Playbooks page (click on **Get Started** if it appears)

#. Click on **Import**. 

   .. figure:: images/import0.png

#. You will need to choose the binary file that you downloaded as the playbook to import.

   .. figure:: images/import1.png

#. You may see some validation errors since the certain fields such as credentials and URLs will be different for your environment. Click on **Import**, we will resolve these errors in the next step.

   .. figure:: images/import2.png

#. Click on the playbook that has just been imported for you - there will be a timestamp in the playbook name. Once open the you will see that the actions that have validation errors have been highlighted. Even for actions that have not been highlighted make sure to confirm that the information such as **Passwords**, **URLs** and **IP Addresses** is updated according to your environment. 

#. Click on **Update** to change fields in the playbook. Refer to the playbook creation steps above to confirm these fields.

#. First you will need to specify your VM for the alert. Click on the trigger, make sure it is the right Alert Policy and choose your VM from the dropdown.

   .. figure:: images/rsimport2.png

#. Then you will need the change the **URL** in the **Generate Service Ticket** action. Change the IP Address to your ``http://<PrismOpsLabUtilityServer_IP_ADDRESS>/`` in the URL.

   .. figure:: images/rsimport3.png

#. Last, make sure the email address in the **Email** action is updated to your email address.

   .. figure:: images/rsimport4.png

#. Once you have changed these fields click on **Save & Close**. Pop-ups will indicate validation errors that are still present. 

#. Click **Enable** and add your Initials to the playbook name before clicking **Save**. 

   .. note::
   
     **Do remember to remove any special characters from the playbook name to avoid validation errors.**

   .. figure:: images/rsimport1.png

Takeaways
++++++++++

- Prism Pro is our solution to make IT OPS smarter and automated. It covers the IT OPS process ranging from intelligent detection to automated remediation.

- X-FIT is our machine learning engine to support smart IT OPS, including anomaly detection, and inefficiency detection.

- X-Play enables admins to confidently automate their daily tasks within minutes.

- X-Play is extensive that can use customer’s existing APIs and scripts as part of its Playbooks, and can integrate nicely with customers existing ticketing workflows.

- X-Play can enable automation of daily operations tasks with a complete IFTTT workflow thanks to conditional execution.
