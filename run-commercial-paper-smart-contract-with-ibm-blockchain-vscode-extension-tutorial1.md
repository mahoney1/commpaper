# Tutorial 1/3: "Run a commercial paper smart contract with the IBM Blockchain VS Code extension"

These are step-by-step instructions to complete tutorial https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/ on IBM Developer, part of the Tutorial series https://developer.ibm.com/technologies/blockchain/series/blockchain-running-enhancing-commercial-paper-smart-contract
For support issues with this tutorial, see my contact details in the [README](https://github.com/mahoney1/commpaper/blob/master/README.md) on how to get in touch.

## Preparation

Before starting, you need to do a little housekeeping. Run the following command to kill any stale or active containers in your development environment:

```
docker rm -f $(docker ps -aq)
```

Clear any cached networks and volumes:

```
docker network prune ; docker volume prune
```

## Scenario

MagnetoCorp manufactures electric vehicles and has just landed a big contract. They have a short turnaround time, so will sub-contract most of the work; this means they need funds/liquidity to be able to pay contractors weekly. MagnetoCorp have been here before. They will issue a commercial paper for sale at $1m to obtain funds -  this is performed by Isabella, a MagnetoCorp employee. A few weeks later, an investor, DigiBank (through its investment trader, Balaji) has an offer of $0.96m accepted on the advertised commercial paper. DigiBank holds it for a period of time (eg 6 months), and then redeems it at face value with MagnetoCorp, gaining a return on investment. Note that a commercial paper can 'change hands' a number of times in a real marketplace. You can read more about this commercial paper example in [this Hyperledger Fabric docs tutorial](https://hyperledger-fabric.readthedocs.io/en/master/tutorial/commercial_paper.html).  

#### Overview diagram

<p>
    <img src="/img/tutorial1/overview.png" title="Commercial Paper scenario overview" alt="scenario overview" />
</p>


## Steps

### Step 1. Get the commercial paper sample in Fabric Samples

From a terminal window, clone the Fabric samples repo (and specifically the "master" branch) to your $HOME directory:

```
git clone https://github.com/hyperledger/fabric-samples
```

### Step 2. Launch the Microfab 'Commerce' blockchain network


1. Pull the docker image for Microfab. Microfab is a containerised Fabric network from the IBM Blockchain Platform team for development purposes.

`docker pull sstone1/microfab:latest`

2. Open a terminal window and copy/paste in the following linux command to set this environment variable `MICROFAB_CONFIG`  - don't forget to include the closing 'single-quote' at the end in your 'copy'!:

```
export MICROFAB_CONFIG='{
    "endorsing_organizations":[
        {
            "name": "DigiBank"
        },
        {
            "name": "Hedgematic"
        },
        {
            "name": "MagnetoCorp"
        }
    ],
    "channels":[
        {
            "name": "mychannel",
            "endorsing_organizations":[
                "DigiBank",
                "Hedgematic",
                "MagnetoCorp"
            ]
        }
    ]
}'
```

3. Next, launch your Microfab Fabric environment (ie a single containerised 'Commerce' Fabric environment for development use). The IBM Blockchain Platform VS Code extension has the ability to add and connect to this development environment (container is listening on port 8080 by default). Microfab is an experimental feature - it can be enabled once you have installed the extension below.

<p>
    <img src="/img/tutorial1/experimental-feat.png" title="experimental feature" alt="experimental feature" />
</p>
 
4. The command to launch the MicroFab environment is:

`docker run --rm -ti -p 8080:8080 -e MICROFAB_CONFIG="${MICROFAB_CONFIG}" sstone1/microfab:latest`

### Step 3. Launch VS Code and install the IBM Blockchain Platform extension for VS Code

You can launch VS Code from your task bar, or by typing `code` in a terminal window.

1.  you need to install the IBM Blockchain Platform VS Code extension (see pre-requisites above). If you already had VS Code installed, you should check first that you have a supported version of VS Code for the extension (go to `Help` -> `Check for updates`).

**Figure 1. Find and install the extension from VS Code marketplace**


<p>
    <img src="/img/tutorial1/installExtension.gif" title="install the extension" alt="Find the extension" />
</p>
   

2. In VS Code, click on the `Extensions` icon on the sidebar (left) - then, in the search bar, type `IBM Blockchain Platform` and click on `Install`. You should see a status of "Installing" and eventually "Installed" -- click `reload` if prompted.


### Step 4. Open the commercial paper contract

1. Still in VS Code, from the menu choose **File** > **Open Folder**, and select the `contracts` folder, after navigating to the `$HOME/fabric-samples/commercial-paper/organization/magnetocorp` directory. Click 'OK' to open it. Click 'Yes' if prompted to save this workspace configuration to a file. This is your top-level project folder for this tutorial.
  
**Figure 2. Open the commercial paper sample project in VS Code**

</p>    
    <img src="/img/tutorial1/papercontract.png" title="Open contract folder" alt="Open contract folder" />
</p>
 
2. Explore the `papercontract.js` file, which is located in the `lib` subfolder. It effectively orchestrates the logic for the different smart contract transaction functions (issue, buy, redeem, etc.), and is underpinned by essential core functions (in the sample contract) that interact with the ledger. The link provided in the introduction section above explains the concepts, themes, and programmatic approach to writing contracts using the commercial paper scenario. Take some time to read that explainer and then resume here.

3. Go back to the `contract` folder by clicking on the folder name on the left in the VS Code Explorer. It's important to do so before the next step.
  
**Figure 3. Choose the contract folder**

<p>
    <img src="/img/tutorial1/project-commpaper.png" title="Return to contract folder" alt="Return to contract folder" />
</p> 

### Step 5. Package the smart contract

1. Click on the IBM Blockchain Platform sidebar icon. When you do this the first time, you may get a message that the extension is "activating" in the output pane.

2. Click inside the file `package.json` in the Explorer palette and edit the “name” field; change the name to `papercontract`. Next click CONTROL + S as a VS Code shortcut to save the file.

<p>
    <img src="./img/tutorial1/package-name.png" title="Package smart contract" alt="Package smart contract" />
</p>

3. Click on the "Smart Contracts" sub-menu to expand. Then click on the ellipsis (“...”) button and choose "Package Open Project" for installing onto a peer. The package will be called something like `papercontract@0.0.1`.


### Step 6. Connect to the 'Commerce' Fabric, install the smart contract 

1. In VS Code, under the menu option 'View...Command Palette' - select the 'IBM Blockchain Platform - enable or disable experimental features' checkbox and click 'OK'

<p>
    <img src="./img/tutorial1/experimental-feat.png" title="Experimental feature" alt="Enable Microfab feature" />
</p>

2. Using the IBM Blockchain Platform extension sidebar, connect to the running Microfab based 'Commerce' blockchain network - the feature mentioned conveniently provides you with the ability to connect to the sample containerised Fabric, running in your local virtual machine. 
  
  Click on the ellipsis ("+") button under the **Fabric Environments** view and choose **Add a MicroFab network"** from the list.
 
<p>
    <img src="./img/tutorial1/add-microfab.png" title="Add a Microfab environment" alt="Add a Microfab environment" />
</p>
  
3. You will be prompted to provide a URL - accept the default URL provided.

<p>
    <img src="./img/tutorial1/confirm-microfaburl.png" title="Confirm Microfab URL" alt="Confirm Microfab URL" />
</p>

4. Provide the environment with a name of 'Commerce' - you should see a popup message (bottom right) confirming it was successfully added. Also on the left, you'll see the environment added, and Gateways and Wallets relating to that environment. Note these artifacts are not persisted - they only exist for the life of the running container.

<p>
    <img src="./img/tutorial1/confirm-microfabname.png" title="Confirm Microfab Name" alt="Confirm Microfab Name" />
</p>

5. Next, connect to the `Commerce` Fabric Environment, and click on the `+ Install` button to install the `papercontract@0.0.1` package - select the button to install on all three peers (from MagnetoCorp, DigiBank and Hedgematic) at this time - we will use `Hedgematic` later on in the tutorial series.

<p>
    <img src="./img/tutorial1/install-contractonpeers.png" title="Install contract on all peers" alt="Install contract on all peers" />
</p>

6. Next, you will instantiate the smart contract on the channel `mychannel` by clicking on 'Instantiate' under Fabric Environments and choosing `papercontract@0.0.1` as the contract to use.

<p>
    <img src="./img/tutorial1/choose-contract.png" title="Choose contract" alt="Choose contract" />
</p>

7. When prompted, enter `instantiate` (all lower case) as the function name to call during instantiation.

8. Press `enter` to accept the default for 'no parameters' to provide

9. Press `enter` to accept the default 'No' to add a private data collection and press `enter` to accept the 'Default' single endorser, when prompted

You should quickly get a message that the contract was instantiated successfully (and you will see the running contract under 'Instantiated' on the sidebar on the left).
  
<p>
    <img src="./img/tutorial1/confirminstantiation.png" title="Confirm contract instantiation" alt="Confirm contract instantiation" />
</p>

OK, we now have a deployed contract. For convenience, Microfab generates some default admin identities (for the respective 3 organisations) that we will use in this tutorial to interact with the 'Commerce' network.


### Step 7. Execute the commercial paper smart contract transactions from client applications: MagnetoCorp and DigiBank

So far, you've installed and instantiated your smart contract on the Commerce blockchain network. Now it's time to try out the smart contract transactions.

The commercial paper scenario describes contract transactions that are run by employees of two of the organizations: MagnetoCorp and DigiBank. Using the IBM Blockchain Platform VS Code extension, you will execute the transactions in turn, connecting to the local Fabric Gateway, and interact with your development blockchain network using different identities. Figure 6 summarizes how they would interact using client applications and identities/wallets (provided to the employees of each company organization).

**Figure 4. "Papernet" -- overview of transaction flow**
 
<p>
    <img src="./img/tutorial1/flow-transaction.png" title="Transaction Flow - overview" alt="Transaction Flow - overview" />
</p>

#### Transaction 1: Execute an `issue` transaction as MagnetoCorp

1. From the IBM Blockchain Platform VS Code sidebar panel, locate the **Fabric Gateways** view and click on the `MagnetoCorp` Gateway. It will automatically connect with the single identity in the wallet, ie `MagnetoCorp Admin`. Expand the `mychannel` twisty, then  expand `papercontract@0.0.1` to reveal the list of transactions in the contract.

    <img src="./img/tutorial1/magnetogw-connect.png" title="Connect as MagnetoCorp" alt="Connect as MagnetoCorp" />

2. Highlight the "issue" transaction and right-click `Submit Transaction`. A pop-up window should appear at the top.
  
3. When prompted, copy and paste the following parameters (incl. double-quotes) **inside** the existing square brackets "[]" and hit ENTER. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`.

  ```
  "MagnetoCorp","000010","2020-05-31","2020-11-30","5000000"
  ```
  
4. Check the message (in the **Output** pane) indicating that this transaction was successfully submitted.
  
5. Lastly, disconnect from the Gateway by clicking the 'Fabric Gateways' pane title, then click on the "disconnect" icon.

#### Transaction 2. Execute a `buy` transaction as DigiBank

1. Click once on the `DigiBank` Gateway - it will connect with the DigiBank Admin identity as the only one in the wallet.
  
2. Expand the `mychannel` twisty and then the `papercontract@0.0.1` twisty, in turn.

3. Highlight, then right-click, the "buy" transaction and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`:
  
  ```
  "MagnetoCorp","000010","MagnetoCorp","DigiBank","4900000","2020-05-31"
  ```
  
5. Check the message (in the output pane) indicating that this transaction was successfully submitted.


#### Transaction 3. Execute a `redeem` transaction as DigiBank -- six months later

Some months later in the commercial paper's lifecycle, the current owner (DigiBank) wishes to redeem the commercial paper at face value and recoup the investment outlay. Typically, a client application would perform this task from a client and related identity perspective. You can, once again, execute this transaction using the VS Code extension, using the identity from DigiBank and using the DigiBank gateway.

1. Now highlight the `redeem` transaction from the list of transactions and right-click "Submit Transaction." A pop-up window will appear.
  
2. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`, and hit ENTER, then hit ENTER again (to skip Transient Data and Peer Targeting):
  
  ```
  "MagnetoCorp","000010","DigiBank","2020-11-30"
  ```
  
3. Check the message (in the output pane) indicating that this redeem transaction was successfully submitted.

Well done! You've completed this tutorial and successfully interacted with the smart contract, which demonstrates a simple lifecycle of a commercial paper instance (with 3 transactions) on the Commerce blockchain network.

## Summary

You've learned how to deploy a simple yet substantial commercial paper smart contract sample to a Commerce Fabric blockchain network involving multiple organisations. You’ve seen how it can explore, package, install, and instantiate a smart contract on that network, and how to use the IBM Blockchain Platform [VS Code extension](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) to submit transactions as different organisations, which are recorded on the ledger. (Clearly, the extension provides a lot more -- such as the develop/debug/test lifecycle of a developer -- beyond the scope of this simple tutorial.)

[My next tutorial, part 2 of this series](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/) will concentrate on another application perspective, querying the the history or lifecycle of an asset on the ledger. I'll answer questions like:

* What was the "paper" trail? (Get it?)
* Who performed the transactions (the identities involved)?
* Exactly when did they take place?
* What exactly were the changes made for each transaction in that history?

This means adding query functionality to the smart contract, as well as some "standard functions to get you the right information from the historical transactions. These results are sent back to application clients to consume.

In order to complete the next tutorials (Parts 2 and 3), you'll need to clone some sample artifacts (code, script files, etc.) from GitHub (if you haven't already done so). To do this, open up a terminal window, locate your desired directory, and paste in the following commands:

```
cd $HOME
git clone https://github.com/mahoney1/commpaper
```

The repository should now be successfully cloned, in preparation for the next stage. The next tutorial (part 2 of 3 in this series) focuses on adding query functionality to this Commercial Paper sample. Follow the instructions for that [here](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/)

If you haven't done so, I recommend checking out the excellent tutorials in the IBM Blockchain Platform VS Code extension - simply click on 'Tutorials' from the extension's home page (the home page icon is top right).

Thanks for joining me!
