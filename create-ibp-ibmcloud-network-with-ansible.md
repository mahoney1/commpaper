## Scenario

Having successfully run and then upgraded the Commercial Paper smart contract ( on the'Commerce' network) in tutorial 2 to add extensive query functionality, MagnetoCorp, DigiBank and Hedgematic - all part of a blockchain consortium - wish to get started with their network in IBM Blockchain Platform in IBM Cloud. The contract will be deployed, they they can carry out 'business as usual'.

The aim of this tutorial, is to show how the [IBM Blockchain Platform Ansible collection](https://github.com/IBM-Blockchain/ansible-collection/blob/master/README.md) can be used to provision an IBM Blockchain Platform network for each organisation. Your `papercontract` smart contract is deployed to this network. For the purposes of this tutorial, all 3 organisation's nodes will be deployed to the same 30-day trial cluster. You can get [information on how to get this cluster](https://cloud.ibm.com/docs/blockchain?topic=blockchain-ibp-saas-pricing#ibp-saas-pricing-free) and use it free for 30 days. You'll need to upgrade to a business account at http://ibm.biz/account first (still have your 30-day trial) to be able to create the 30 day free IBM Kubernetes cluster.

The ansible collection is fully-scripted for you; all you have to do is: get your free cluster, set up an IBM Blockchain Platform service, then: 'press the button'. If you want to read more on IBM Blockchain Ansible collections, including a tutorial - check it out [here](https://ibm-blockchain.github.io/ansible-collection/) 

Once provisioned, you interact with the contract using: 

1) the IBM Blockchain Platform VS Code extension and 
2) application clients (provided for you). 

The last part of the tutorial will see you using a HTML 5 client app to render asset reports showing the full lifecycle/history of an asset. 


## Pre-requisites

You will need an IBM Kubernetes cluster in IBM Cloud and create an IBM Blockchain Platform service instance. You can avail of the 30-day trial (see details in Step 1 below on how to obtain), or use an existing IBM Kubernetes cluster in IBM Cloud that is a supported level as described [here](https://cloud.ibm.com/docs/blockchain?topic=blockchain-ibp-console-overview#ibp-console-overview-supported-cfg)


## Steps

### Step 1: Create your cluster, IBM Blockchain Service instance and Service Credentials

1. Log into IBM Cloud and create your free cluster `mycluster` in IBM Cloud -you can[preview the IBM Blockchain Platform in IBM Cloud at no charge for 30 days](https://cloud.ibm.com/registration?target=%2Fcatalog%2Fservices%2Fblockchain).

It will take a couple of hours to have the IBM Kubernetes cluster provisioned and available (`Status: Green` in your Cloud environment). 

2. Once the cluster is available,  create your IBM Blockchain Platform service instance via the IBM Cloud Catalog](https://cloud.ibm.com/catalog/services/blockchain-platform). Eg name: `Blockchain-Platform-ibp`

<img src="/img/tutorial3/create-service.png" title="Create the IBP service instance" alt="Create IBP service" />

3. When prompted, link your new IBM Blockchain Platform service instance that you created to the cluster `mycluster` when prompted.

<img src="/img/tutorial3/link-cluster.png" title="Link the IBP service instance" alt="Link to cluster" />

On the the top left you'll also see a `Service Credentials` option - this will enable us to create credentials, so our ansible collection script can use these to connect to your IBM Blockchain Platform instance. We'll tell you how to get your credentials from IBM Blockchain Platform instance there 
so you can provide these to the Ansible collection you will use so Ansible can authenticate and provision the 'Commerce' 3-org network).

4. Click 'Next' to proceed. It will take a little while to provision the IBM Blockchain Platform service, but eventually it will come back with a button to 'Launch the IBM Blockchain Platform Console' - click on this.

<img src="/img/tutorial3/launch-ibp.png" title="Launch the IBP console" alt="Launch IBP" />

5. Finally, you will see the IBM Blockchain Platform console 'Getting Started' page - click on this button and you will get IBM Blockchain Platform console - no nodes as of yet.

<img src="/img/tutorial3/ibp-console.png" title="Getting started - IBP console" alt="Console Get Started" />

OK. At this point, we have our IBM Blockchain Platform service with no nodes/components in the network. The next step is to provision our 'three-organisation' network in this environment. This is the job of the IBM Blockchain Platform ansible collection.

6. Return to your IBM Blockchain Service instance under the IBM Kubernetes resource list at https://cloud.ibm.com/resources and click on the IBM Blockchain Platform service you created.

You will now create some service credentials, which are crucial for the Ansible collection to be able to connect to your IBM Cloud based blockchain service instance.

7. Click on `Service Credentials` menu item on the left and click on `New Credentials` button

<img src="/img/tutorial3/create-credentials.png" title="Create Service Credentials" alt="Create Credentials" />

8. When prompted - create credentials with the name `ibp-creds1` and click `Add` - your credentials have been created. Now you can return to the browser tab with the IBM Blockchain Platform Console open.

<img src="/img/tutorial3/credentials-added.png" title="Credentials added" alt="Added Credentials" />

9. Copy the credentials using the copy icon on the right - then open a terminal window and 

10. Open up a terminal and change directory to the `commpaper` repo (eg in your $HOME directory) - then change to subdirectory `ansible`

```
cd $HOME/commpaper
cd ansible/
```
11. Create a file called `creds.txt` and paste in the Cloud credentials you copied into this file (approx 6 lines in JSON format) to this file - save the file. 



### Step 2. Locate the Ansible collection and launch the ansible builder for the 'Commerce' network.

In this section, you will launch the ansible builder to provision a network for our three organisations - each will have one peer and one CA. There is also an Ordering organisation and of course an ordering service (RAFT).  Lastly, you will provision your `papercontract@0.0.2` smart contract this network.

1. You'll need to clone the IBM Blockchain Platform Ansible collection repo  and change directory into it:

```
 git clone https://github.com/IBM-Blockchain/ansible-collection.git
 cd ansible-collection
```

2. You will need to get the pre-requisite images for the IBM Blockchain Platform Ansible collection itself (as outlined in the [Installation pages](https://ibm-blockchain.github.io/ansible-collection/installation.html)  - and for this, we'll conveniently build a Docker image  (hat contains all the pre-requisites) from a `Dockerfile`. There is a `Dockerfile` in the `docker` subdirectory of the cloned ansible-collection, that we'll use to build the IBM Blockchain Platform ansible image. Use the sequence below to build the image. Please don't forget the '.' at the end of the 2nd command (`docker build`):

```
cd docker
docker build --tag myansible:latest .
```

<img src="/img/tutorial3/docker-build.png" title="Docker build" alt="Ansible docker build" />

This build will take approx 15mins or so to complete, please note. Once complete, you will have a docker image (checked using `docker images`) that's tagged `myansible:latest`. 

We're now ready to build our IBM Blockchain Platform network.

<img src="/img/tutorial3/tagged-build.png" title="Docker build complete" alt="Ansible build tagged" />


3. Change directory to the `commpaper/ansible/tutorial` directory

```
cd $HOME/commpaper/ansible/tutorial
```

4. Next - you need to edit 3 files `org1-vars.yml`, `org2-vars.yml` and `org3-vars.yml` - these 3 organisation variable files need the `api_endpoint` and `api_key` lines edited - to use your service instance credentials. In particular - lines 5 and 7 in the files.  `org1-vars.yml` see image (some of the credentials are greyed out for security purposes) - note that you can leave the `api_secret` variable on line 8 as it is : `xxxxxx` - this is not used. All of the other variables in the file **can also remain exactly as they are** - but take note of the values anyway:

<img src="/img/tutorial3/edit-orgvariables.png" title="Edit organisation variables" alt="Edit the organisation variables" />

Ensure you edit files `org2-vars.yml` and `org3-vars.yml` in turn, so that the first 4 lines  (beginning with `api_endpoint`) of each org YAML file are identical. 

5. The last file to edit is `ordering-org-vars.yml` - the ordering service variables YAML file. This also needs the same api information - carry out **exactly** the same changes to this fourth file,  as you did in the previous step. The first 4 lines of this file are identical to those added in the previous step.


You've now completed your edits. Next, launch the ansible to build the 3 org network. This will run a set of ansible playbooks.

6.  Ensure you are in the `tutorial` directory to run this command - as this is the mount point (-v) into the container instance launched below:. Also ensure the file `tutorial.sh` has execute permissions (it should have,  after cloning earlier but your system may have new file permission defaults).  

```
docker run --rm -v "$PWD:/tutorial" myansible:latest /tutorial/tutorial.sh
```

You will shortly see it build the IBM Blockchain Platform. 

<img src="/img/tutorial3/run-ansible-script.png" title="Run the ansible build" alt="Run the IBP Ansible build" />

Now is a good time to go to your 'empty' IBM Blockchain Platform Console you launched earlier - best to do this using a browser inside your virtual machine (for Step 2 below), as you can see the nodes being added in the console (Note:  you will need to toggle between 'Nodes' and 'Channels' (ignoring messages about unable to find wallets) and back to 'Nodes' to see the very latest status of a node being provisioned.

<img src="/img/tutorial3/provisioned-ibp-env.png" title="IBP nodes being provisioned" alt="IBP nodes being provisioned" />

Your IBP Blockchain Platform environment should now be provisioned - you will be at the point where the smart contract is installed on all peers - you will instantiate it manually. Note also that there are a list of exported node and identity JSON files. These include identities that you can use to import in the IBM Blockchain Platform console or import as appropriate into the IBM Blockchain Platform VS Code extension wallets,  to connect to your blockchain network. One very useful feature of the IBP VS Code extension is that you can also import your Cloud 'Commerce' network nodes under 'Fabric Environments' by connecting to it using your IBM Cloud id and password  (add an IBM Blockchain Platform Fabric environment for an IBM Cloud service instance) - you'll be prompted for the login id and password to authenticate to the cloud. You'll then be asked to choose the IBM Blockchain Platform service instance and prompted to import all of the components from your SaaS environment.  For the purposes of this tutorial, we won't need to do this: we've provisioned application identities using Ansible, and we'll simply enroll these from the VS Code extension.

<img src="/img/tutorial3/list-of-jsons.png" title="List of JSON files" alt="List of JSON files" />

### Step 3. Instantiate the smart contract on the Commerce network in IBM Cloud


1.  In your IBM Blockchain Platform console, click on the `Wallets` icon on the left then click 'Add Identity'. Upload each of `MagnetoCorp Admin`, `DigiBank Admin` and `Hedgematic Admin`  in turn, using the `Upload json` option. Ensure you DON'T choose the `CA Admin` json file :-) when doing this step.

<img src="/img/tutorial3/add-identities.png" title="Add identities" alt="Add identities" />

2. Next, click on the `Nodes` icon, then click on each peer (in turn),  and select each of their respective Admin identities,  to associate with that Organisation's peer.  Eg `DigiBank Peer` should be associated with `DigiBank Admin`  and so on.

<img src="/img/tutorial3/associate-identity.png" title="Associate identity" alt="Associate identity" />

3. Click on the  `Smart Contracts` icon on the left. It will show that under 'Smart Contracts' the `papercontract@0.0.2` is already installed on the peers. Click on the `ellipsis` icon on the right and select `Instantiate Contract`

<img src="/img/tutorial3/instantiate-contract.png" title="Instantiate contract" alt="Instantiate contract" />

4. When prompted, select the channel `mychannel` for `papercontract@0.0.2`, accept the defaults by clicking 'Next' but for the function name enter the name `instantiate` as the function to call. It will take a minute or two to instantiate. In this step, we choose to show the operational concepts of instantiation - if you prefer, you can do this instantiation from the Ansible script (given that it installs the smart contract on all peers - FYI).


### Step 4. Connect to the Commerce Network on IBM Blockchain Platform in IBM Cloud

1. Return to the IBM Blockchain Platform VS Code extension in your development by clicking on the extension's icon.

2. Next, import the organisational Gateway definitions (JSON)) that were created by Ansible. Click on the '+' under `Fabric Gateways` and select to 'Create a gateway from a connection profile'

<img src="/img/tutorial3/create-ext-gateway.png" title="Create Gateway from profile" alt="Create Gateway from profile" />

3. Give it a name of `MagnetoCorp_GW` when prompted - and browse to your `tutorial` subdirectory to add the file `MagnetoCorp Gateway.json` - you'll see a 'successfully added' notification bottom right.

4. Repeat steps 2 and 3 above for `DigiBank_GW` and `Hedgematic_GW` and select the respective files to import. The end result is three gateways.

<img src="/img/tutorial3/three-gateways-added.png" title="Three Gateways added" alt="Three Gateways added" />

5. Next, add some wallets and enrole some application identities. Click on the '+' button under the `Fabric Wallets` view and choose to 'Create a new wallet and add identity'.

<img src="/img/tutorial3/create-ext-wallet.png" title="Create new wallet" alt="Create new wallet" />

6. Give the wallet a name of 'MagnetoCorp' when prompted and give the identity a name of 'magnus' 

7. Enter an MSP id of 'MagnetoCorpMSP' for this identity

8. Choose to  'select a gateway' and provide 'an enrollment id and secret'

<img src="/img/tutorial3/enrol-identities.png" title="Enrol application identity" alt="Enrol application identity" />

9. Select the `MagnetoCorp_GW` gateway and provide the enrol id / secret of `magnus` and `demopw`  to enrol your identity - you'll get a message the wallet was created  and the identity was successfully added to it.

10. Repeat steps 5 through 9 for `DigiBank_GW` and `Hedgematic_GW` . The MSP ids to provide are `DigiBankMSP` and `HedgematicMSP` and the identities are `david` and `helen` respectively. Note that the enrol secret for each identity is also `demopw` .

After adding, if you expand these 3 wallets you should see the following structure, showing the enrolled application identities in their respective organisational wallets.

<img src="/img/tutorial3/create-ext-wallet.png" title="Create new wallet" alt="Create new wallet" />

Well done - you're now ready to test your connection to your 'Commerce network' and the first thing to try is to see if you can see the smart contract transaction list. At this point, FYI - there is no ledger data on the blockchain.

11. Click on the `MagnetoCorp_GW` gateway under `Fabric Gateways` and choose the wallet `MagnetoCorp` - there is just one identity in it, so it will connect automatically with the identity `magnus` added earlier. You will see the channel `mychannel` . Expand the channel, then the smart contract 'twisty' to reveal the list of transaction functions - these include all of the query functions you added in tutorial 2. The list may take a little while to appear (approx 20 secs).

OK - we're now ready to execute transactions as each of the organisations and after creating the commercial paper lifecycle of transactions, then we can do some simple queries. 


### Step 5. Perform the issue, buy, and redeem transaction lifecycle to create data on the ledger

Let’s create some transactions, invoked as the different identities, to create a history of transactions on the ledger. The sequence is:

1. Issue a paper as "MagnetoCorp." 
2. Buy the paper as "DigiBank," the new owner.
3. Buy the paper as "Hedgematic," the changed owner.
4. Redeem the paper at face value, as existing owner "Hedgematic," with MagnetoCorp as the original issuer.

#### Transaction 1: Execute an `issue` transaction as MagnetoCorp

1. From the IBM Blockchain Platform VS Code sidebar panel, you should already be connected as application id `magnus` to the `MagnetoCorp_GW`. Expand the `mychannel` twisty, then  expand `papercontract@0.0.2` and highlight the `issue` transaction.

    <img src="/img/tutorial2/issue-txn-saas.png" title="Issue trxn as MagnetoCorp" alt="Issue trxn as MagnetoCorp" />

2. Right-click  on `issue and choose `Submit Transaction`. A pop-up window should appear at the top.
  
3. When prompted, copy and paste the following parameters (incl. double-quotes) **inside** the existing square brackets "[]" and hit ENTER. Whem prompted, just hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `default  peer targeting policy`. **Make sure there are no trailing ' ' spaces** in your input to transactions:

 ```
"MagnetoCorp","0001","2020-05-31","2020-11-30","5000000"
 ```
  
4. Check the message (in the **Output** pane) indicating that this transaction was successfully submitted. Note: the FIRST transaction only, may take about 5-10 seconds to complete - please be patient.

<img src="/img/tutorial3/issue-success.png" title="Confirm issue success" alt="Confirm issue success" />
  
5. Lastly, disconnect from the `MagnetoCorp_GW` Gateway by clicking the 'Fabric Gateways' pane title, then click on the "disconnect" icon.

#### Transaction 2. Execute a `buy` transaction as DigiBank

1. Click once on the `DigiBank_GW` Gateway - it will connect with identity 'david' - the only one in this wallet.
  
2. Expand the `mychannel` twisty and then the `papercontract@0.0.2` twisty, in turn to see the transaction list.

3. Highlight, then right-click, the "buy" transaction and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`:
  
```
"MagnetoCorp","0001","MagnetoCorp","DigiBank","4900000","2020-05-31"
```

<img src="/img/tutorial3/buy-success.png" title="Confirm buy success" alt="Confirm buy success" />
  
5. Once again, check the message (in the output pane) indicating that this transaction was successfully submitted.

6. Disconnect from the `DigiBank_GW` Gateway from the `Fabric Gateways` view.

#### Transaction 3. Execute another `buy` transaction - this time, as Hedgematic

1. Connect to the `Hedgematic_GW` and wallet `Hedgematic` - you will connect as `helen` to execute another `buy` transaction as Hedgematic. 
  
2. Expand the `mychannel` twisty and then the `papercontract@0.0.2` twisty, in turn.

3. Highlight, then right-click, the "buy" transaction and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`:

```
"MagnetoCorp","0001","DigiBank","Hedgematic","4930000","2020-06-15"
```

<img src="/img/tutorial3/2nd-buy-success.png" title="Confirm Hedgematic buy success" alt="Confirm Hedgematic buy success" />
 
5. Again, check the results for a successful transaction in the `Output` pane.


#### Transaction 4. Execute a `redeem` transaction as Hedgematic -- c. six months later

Months later in this commercial paper's lifecycle, the current owner (Hedgematic) wishes to **redeem** the commercial paper "0001" at face value and get a return on the investment outlay. Typically, a client application would perform this task with a valid identity. For testing purposes, we can use the IBM Blockchain VS Code extension to do this.


1. Still connected to the Hedgematic gateway,  highlight the `redeem` transaction and right-click ... "Submit Transaction." A pop-up window will appear.
  
2. When prompted, copy/paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`, and hit ENTER, then hit ENTER again (to skip Transient Data and Peer Targeting):
  
```
"MagnetoCorp","0001","Hedgematic","2020-11-30"
```

3. Check the message (in the output pane) indicating that this `redeem` transaction was successfully submitted.

4. Disconnect from the `Hedgematic` Gateway using the disconnect icon (click the Fabric Gateways title to see the icon).

Optional: create another set of 4 transactions (issue, buy, buy, redeem) for another commercial paper: replace the paper id `0001` with `0002` in the parameter list above - change some of the values for offer and buy price too. This will mean you have more ledger data (2 asset lifecycles) to perform different queries in the section below.


Well done! You've completed a full commercial paper transaction lifecycle; now its time to do some queries on the data


### Step 6. Perform queries of ledger data in the VS Code extension

In this section, you'll test your queries pull data from the real Commerce network on IBM Cloud. This is a primer, before you go to connect up a sample javascript query application in the next section. You've tested these queries in development, so it should take a couple of minutes to try these out.

1. Still connected as `Hedgematic` identity `helen` - right click on the `queryHist` function and choose `Evaluate Transaction`. Provide the following parameters inside the `[ ]` brackets:

```
"MagnetoCorp","0001"
```

You should see a JSON array with the history of transactions for commercial paper asset `0001`.

<img src="/img/tutorial3/asset-history-query.png" title="Query asset history" alt="Query asset history" />

2. Next, right-click on `queryOwner` transaction and `Evaluate Transaction`. Provide just one parameter to this (owner name). We added a 2nd optional asset below: if you added a 2nd asset, you will see that "MagnetoCorp" has ownership of both papers (as both were redeemed by Hedgematic).

```
"MagnetoCorp"
```

<img src="/img/tutorial3/ownership-query.png" title="Query ownership" alt="Query ownership" />

OK cool - well done. The last part of this tutorial is to connect up our query application to do some asset history reporting. We have provided a query client application (Javascript) in the github repo, that will query the ledger and export it to JSON file. The goal is to render this asset history in a HTML 5 browser app for local reporting.

### Step 7. Connect up the query client application (Node.JS) to render asset history in a HTML browser app

1. 

## Summary.

** STOPPED HERE**

Well done! You've now added further query functionality, processing only the deltas, contract-side, before returning the changes/deltas only to the calling client.

## Summary

In this tutorial, you've provisioned a 3 organisation network for the Commercial Paper use case, consisting of MagnetoCorp, DigiBank and Hedgematic. You've also deployed your latet smart contract and connected up to your IBM Blockchain Platform SaaS nodes from your local IBM Blockchain VS Code extension. You will instantiate the smart contract on the channel `mychannel` in the cloud and 

* [Part 1: Run a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/)
* [Part 2: Enhance and add queries to a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/)

For further study, I recommend you look at the IBM Developer [code patterns](https://developer.ibm.com/patterns/category/blockchain/) to try out further sample use cases using the IBM Blockchain Platform VS Code extension. For example, the [global finance sample use case](https://developer.ibm.com/patterns/global-financing-use-case-for-blockchain/) features a global finance smart contract and sample web application that interacts with it using the new Fabric 1.4 contract/fabric-network programming model enhancements.
