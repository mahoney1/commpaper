## Scenario

Having successfully run and then upgraded the Commercial Paper smart contract ( on the'Commerce' network) in tutorial 2 to add extensive query functionality, MagnetoCorp, DigiBank and Hedgematic - all part of a blockchain consortium - wish to get started with their network in IBM Blockchain Platform in IBM Cloud. The contract will be deployed, they they can carry out 'business as usual'.

The aim of this tutorial, is to show how the [IBM Blockchain Platform Ansible collection](https://github.com/IBM-Blockchain/ansible-collection/blob/master/README.md) can be used to provision an IBM Blockchain Platform network for each organisation. Your `papercontract` smart contract is deployed to this network. For the purposes of this tutorial, all 3 organisation's nodes will be deployed to the same 30-day trial cluster. You can get [information on how to get this cluster](https://cloud.ibm.com/docs/blockchain?topic=blockchain-ibp-saas-pricing#ibp-saas-pricing-free) and use it free for 30 days. You'll need to upgrade to a business account at http://ibm.biz/account first (still have your 30-day trial) to be able to create the 30 day free IBM Kubernetes cluster.

The ansible collection is fully-scripted for you; all you have to do is: get your free cluster, set up an IBM Blockchain Platform service, then: 'press the button'. If you want to read more on IBM Blockchain Ansible collections, including a tutorial - check it out [here](https://ibm-blockchain.github.io/ansible-collection/) 

Once provisioned, you interact with the contract using: 

1) the IBM Blockchain Platform VS Code extension and 
2) application clients (provided for you). 

The last part of the tutorial will see you using a HTML 5 client app to render asset reports showing the full lifecycle/history of an asset. 


## Pre-requisites

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


## Steps

### Step 2. Locate the Ansible collection and launch the ansible builder.

In this section, you will launch the ansible provisioner to get our three organisations - each will have one peer and one CA. There will also be a separate Ordering service. Lastly, you will provision your `papercontract@0.0.2` smart contract this network.

1. You'll need to clone the IBM Blockchain Platform Ansible collection repo  and change directory into it:

```
 git clone https://github.com/IBM-Blockchain/ansible-collection.git
 cd ansible-collection
```

2. You will need to get the pre-requisite images for Ansible itself (as outlined in the [Installation pages](https://ibm-blockchain.github.io/ansible-collection/installation.html)  - and for this, we''ll use the option to build a Docker image containing all the pre-requisites. There is a `Dockerfile` in the `docker subdirectory which we can build the IBM Blockchain Platform ansible image from now. Use the following command to build the image. Please don't forget the '.' at the end of the 2nd command (`docker build`):

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

4. Next - you need to edit 3 files `org1-vars.yml`, `org2-vars.yml` and `org3-vars.yml` - these 3 organisation variable files need the `api_endpoint` and `api_key` lines edited. An example is lines 5 and 7 in the sample `org1-vars.yml` shown below (some of the credentials are greyed out for security purposes) - note that you can leave the `api_secret` variable on line 8 as `xxxxxx` - this is not used. All the other variables in the file **can also remain exactly as they are** - but take note of the values:

<img src="/img/tutorial3/edit-orgvariables.png" title="Edit organisation variables" alt="Edit the organisation variables" />

Ensure you edit files `org2-vars.yml` and `org3-vars.yml` in turn, so that the first 4 lines  (beginning with `api_endpoint`) of each org YAML file are identical. 

5. The last file to edit is `ordering-org-vars.yml` - the ordering service variables YAML file. This also needs the api information - carry out **exactly** the same changes to this fourht file,  as you edited for the organisation YAML files in the previous step. So again, the first 4 lines of this file are identical to those added in the previous step.


You've now completed your edits. Next, launch the ansible to build the 3 org network. This will run a set of ansible playbooks.

6.  Ensure you are in the `tutorial` directory to run this command - as this is the mount point (-v) into the container instance launched below:. Also ensure the file `tutorial.sh` has execute permissions (it should have after cloning earlier).  

```
docker run --rm -v "$PWD:/tutorial" myansible:latest /tutorial/tutorial.sh
```

You will shortly see it build the IBM Blockchain Platform. 

<img src="/img/tutorial3/run-ansible-script.png" title="Run the ansible build" alt="Run the IBP Ansible build" />

Now is a good time to go to your 'empty' IBM Blockchain Platform Console you launched earlier, as you can see the nodes being added in the console (Note:  you will need to toggle between 'Nodes' and 'Channels' (ignoring messages about unable to find wallets) and back to 'Nodes' to see the very latest status of a node being provisioned.

<img src="/img/tutorial3/provisioned-ibp-env.png" title="IBP nodes being provisioned" alt="IBP nodes being provisioned" />

Your IBP Blockchain Platform environment should now be provisioned - you will be at the point where the smart contract is installed on all peers - you will instantiate it manually. Note also that there are a list of exported node and identity JSON files. These include the CA and Peer Admin identities that you can use to import in the IBM Blockchain Platform console - and also - to import into the IBM Blockchain Platform

7. Go to the Wallets icon on the left and click 'Add Identity'. Upload each of `MagnetoCorp Admin`, `DigiBank Admin` and `Hedgematic Admin` json files.

** STOPPED HERE**

Well done! You've now added further query functionality, processing only the deltas, contract-side, before returning the changes/deltas only to the calling client.

## Summary

In this tutorial, you've provisioned a 3 organisation network for the Commercial Paper use case, consisting of MagnetoCorp, DigiBank and Hedgematic. You've also deployed your latet smart contract and connected up to your IBM Blockchain Platform SaaS nodes from your local IBM Blockchain VS Code extension. You will instantiate the smart contract on the channel `mychannel` in the cloud and 

* [Part 1: Run a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/)
* [Part 2: Enhance and add queries to a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/)

For further study, I recommend you look at the IBM Developer [code patterns](https://developer.ibm.com/patterns/category/blockchain/) to try out further sample use cases using the IBM Blockchain Platform VS Code extension. For example, the [global finance sample use case](https://developer.ibm.com/patterns/global-financing-use-case-for-blockchain/) features a global finance smart contract and sample web application that interacts with it using the new Fabric 1.4 contract/fabric-network programming model enhancements.
