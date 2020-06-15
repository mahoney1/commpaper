# Tutorial 1/3: "Run a commercial paper smart contract with the IBM Blockchain VS Code extension"

These are step-by-step instructions to complete tutorial https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/ on IBM Developer, part of the Tutorial series https://developer.ibm.com/technologies/blockchain/series/blockchain-running-enhancing-commercial-paper-smart-contract
For support issues with this tutorial, see my contact details in the [README](https://github.com/mahoney1/commpaper/blob/master/README.md) on how to get in touch.h

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

## Steps

### Step 1. Get the commercial paper sample

From a terminal window, clone the Fabric samples repo (and specifically the "master" branch) to your $HOME directory:

```
git clone https://github.com/hyperledger/fabric-samples
```

### Step 2. Launch the Microfab 'Commerce' blockchain network


1. Pull the docker image for MicroFab. Microfab is a containerised Fabric network from the IBM Blockchain Platform team for development purposes.

`docker pull sstone1/microfab:latest`

2. Open a terminal window and paste in the following linux command to set this environment variable `MICROFAB_CONFIG` :

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

3. Next, launch a MicroFab Fabric environment (a single containerised 'Commerce' Fabric environment for development use). The IBM Blockchain Platform VS Code extension has the ability to add and connect to this development environment (listening on port 8080). Microfab is an experimental feature that can be enabled under 'View....Command Palette'. The command to launch THE MicroFab environment is:

`docker run --rm -ti -p 8080:8080 -e MICROFAB_CONFIG="${MICROFAB_CONFIG}" sstone1/microfab:latest`

### Step 3. Launch VS Code and install the IBM Blockchain Platform extension for VS Code

You can launch VS Code from your task bar, or by typing `code` in a terminal window.

Now you need to install the IBM Blockchain Platform VS Code extension (see pre-requisites above). To see if you have the right version of VS Code, go to `Help` -> `Check for updates`. In VS Code, click on the `Extensions` icon on the sidebar (left) - then, in the search bar, type `IBM Blockchain Platform` and click on `Install`. You should see a status of "Installing" and eventually "Installed" -- click `reload` when prompted.

**Figure 2. Find and install the extension from VS Code marketplace**

![Find and install the extension](images/installExtension.gif)

### Step 4. Open the commercial paper contract

1. In VS Code, choose **File** > **Open Folder**, and select the `contracts` folder by navigating to the `$HOME/fabric-samples/commercial-paper/organization/magnetocorp` directory. This is your top-level project folder for this tutorial.

2. Click on the `Explorer` icon (top left) and open the `contract` folder under `$HOME/fabric-samples/commercial-paper/organization/magnetocorp/`.
  
   **Figure 3. Open the commercial paper sample project in VS Code**
   ![Open the commercial paper sample project in VS Code](images/papercontract.png)

3. Explore the `papercontract.js` file, which is located in the `lib` subfolder. It effectively orchestrates the logic for the different smart contract transaction functions (issue, buy, redeem, etc.), and is underpinned by essential core functions (in the sample contract) that interact with the ledger. The link provided in the introduction section above explains the concepts, themes, and programmatic approach to writing contracts using the commercial paper scenario. Take some time to read that explainer and then resume here.

4. Go back to the `contract` folder by clicking on the folder name on the left in the VS Code Explorer. It's important to do so before the next step.
  
   **Figure 4. Choose the contract folder**
   ![Choose the contract folder](images/project-commpaper.png)

### Step 4. Package the smart contract

1. Click on the IBM Blockchain Platform sidebar icon. When you do this the first time, you may get a message that the extension is "activating" in the output pane.

2. Click on the "Smart Contracts" sub-menu to expand. Then click on the ellipsis (“...”) button and choose "Package Open Project" for installing onto a peer. The package will be called something like `papercontract@0.0.1`.

  ![Package smart contract](images/package-contract.png)

### Step 5. Install the smart contract on a running Fabric

1. In VS Code, under the menu option 'View...Command Palette' - select the 'IBM Blockchain Platform - enable or disable experimental features' checkbox and click 'OK'

![Enable Microfab](images/experimental-feat.png)

2. Using the IBM Blockchain Platform from the left sidebar, connect to the running MicroFab based 'Commerce' blockchain network - the feature mentioned conveniently provides you with the ability to connect to the sample Fabric, running inside one docker container on your local virtual machine. 
  
  Click on the ellipsis ("+") button under the **Fabric Environments** view and choose **Add a MicroFab network"** from the list.
  
  ![Add a Microfab environment](images/add-microfab.png)
  
3. You will be prompted to provide a URL - accept the default URL provided.

![Add a Microfab environment](images/confirm-microfaburl.png)

4. Provide the environment with a name of 'Commerce' - you should see a popup message (bottom right) confirming it was successfully added. Also on the left, you'll see the environment added and Gateways and Wallets relating to that environment.

![Add a Microfab environment](images/confirm-microfabname.png)

5. Next, connect to the `Commerce` Fabric Environment, and click on the `+ Install` button to install the `papercontract@0.0.1` package - select the button to install on all three peers (from MagnetoCorp, DigiBank and Hedgematic) at this time - we will use `Hedgematic` later on in the tutorial series.

![Add a Microfab environment](images/install-contractonpeers.png)
  
6. Next, you will instantiate the smart contract on the channel `mychannel` by clicking on 'Instantiate' under Fabric Environments and choosing `papercontract@0.0.1` as the contract to use.

![Add a Microfab environment](images/choose-contract.png)

7. When prompted, enter `instantiate` (all lower case) as the function name to call, when instantiating.

8. Press `enter` to accept the default for 'no parameters' to provide

9. Press `enter` to accept the default 'No' to add a private data collection and press `enter` to accept the 'Default' single endorser, when prompted

You should quickly get a message that the contract was instantiated successfully (and you can see the running contract under 'Instantiated' on the sidebar on the left).
  
![Add a Microfab environment](images/confirminstantiation.png)

OK, we now have a deployed contract. For convenience, there are some generated/imported admin identities (for the respective 3 organisations) that we will use to interact with the 'Commerce' network.

  
13. Paste in the string `org.papernet.commercialpaper:instantiate` when prompted to enter a function name to call, and hit ENTER.
  

### Step 7. Execute the commercial paper smart contract transactions from client applications: MagnetoCorp and DigiBank

So far, you've installed and instantiated your smart contract on the blockchain. Now it's time to try out the smart contract transactions.

The commercial paper scenario describes contract transactions that are run by employees of two different organizations, MagnetoCorp and DigiBank. Using the IBM Blockchain Platform VS Code extension, you will execute the transactions in turn, connecting to the local Fabric Gateway, as each independent identity -- it's that easy to interact with your development blockchain network using different identities. (In the grander context, these identities would be consumed by the applications of the respective client organisations.) Figure 6 summarizes how they would interact using client applications and identities/wallets (provided to the employees of each company organization).

**Figure 6. "Papernet" -- overview of transaction flow**
![Transaction flow](images/flow-transaction.png)

#### Transaction 1: Execute an `issue` transaction as Isabella@MagnetoCorp

1. From the IBM Blockchain Platform VS Code sidebar panel, locate the **Fabric Gateways** sub-panel and click once on the local Fabric Gateway. When prompted, select the `Isabella@MagnetoCorp` identity to connect with.
  
2. Still under "Fabric Gateways', expand the "mychannel" twisty and then the "papercontract" twisty, in turn. You should see a list of transaction names, one of which is "issue."
  
3. Highlight the "issue" transaction and right-click "Submit Transaction." A pop-up window should appear at the top.
  
4. When prompted to enter parameters, copy and paste the following parameters (with double-quotes) **inside** the square brackets "[]" and hit ENTER, then hit ENTER again (to skip "transient data" entry):
  
  ```
  "MagnetoCorp","000010","2020-05-31","2020-11-30","5000000"
  ```
  
5. Check the message (in the **Output** pane) indicating that this transaction was successfully submitted.
  
6. Lastly, disconnect from the Gateway using the "disconnect" icon (from the "Fabric Gateways") sub-panel.

#### Transaction 2. Execute a `buy` transaction as Balaji@DigiBank

1. Click once on the `local Fabric` gateway and when prompted, choose the “Balaji@DigiBank” identity to connect with (and make sure it connects).
  
2. Still under "Fabric Gateways," expand the "mychannel" twisty and then the "papercontract" twisty, in turn.

3. Now highlight the "buy" transaction from the list of transactions and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted to enter parameters, copy and paste the following parameters (including the double-quotes) **inside** the square brackets, `[]`, and hit ENTER, then hit ENTER again (to skip the "transient data" entry):
  
  ```
  "MagnetoCorp","000010","MagnetoCorp","DigiBank","4900000","2020-05-31"
  ```
  
5. Check the message (in the output pane) indicating that this transaction was successfully submitted.

#### Transaction 3. Execute a `redeem` transaction as Balaji@DigiBank -- six months later

The time has come in this commercial paper's lifecycle for the current owner (DigiBank) to redeem the commercial paper at face value and recoup the investment outlay. Typically, a client application script called `redeem.js` would perform this task from a client and related identity perspective. You can execute this transaction using the VS Code extension, using Balaji's certificate (from his wallet), as it is currently connected as a client identity.

1. Now highlight the `redeem` transaction from the list of transactions and right-click "Submit Transaction." A pop-up window will appear.
  
2. When prompted to enter parameters, copy and paste the following parameters (including the double-quotes) **inside** the square brackets, `[]`, and hit ENTER, then hit ENTER again (to skip the "transient data" entry):
  
  ```
  "MagnetoCorp","000010","DigiBank","2020-11-30"
  ```
  
3. Check the message (in the output pane) indicating that this redeem transaction was successfully submitted.

Well done! You've completed this tutorial and successfully interacted with the smart contract, which demonstrates a simple lifecycle of a commercial paper instance (with 3 transactions) on the blockchain.

## Summary

You've now learned how to deploy a simple yet substantial commercial paper smart contract sample to a Fabric blockchain network. You’ve seen how it can create, package, install, and instantiate a smart contract and use the IBM Blockchain Platform [VS Code extension](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) to submit transactions as different identities, which are recorded on the ledger. (Clearly, the extension provides a lot more -- such as the develop/debug/test lifecycle of a developer -- beyond the scope of this particular tutorial.)

[My next tutorial](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/) will concentrate on another application perspective, querying the ledger -- for example, getting the history of transactions for a particular asset. I'll answer questions like:

* What was the "paper" trail? (Get it?)
* Who performed the transactions (the identities involved)?
* Exactly when did they take place?
* What exactly were the changes made (i.e. the "deltas") for each transaction in that history?

This means adding query functionality to the smart contract, as well as some "getters" to get you the right information from the historical transactions. These results are sent back to the respective application clients.

To complete the next tutorials (Parts 2 and 3), you'll need to clone some sample artifacts (code, script files, etc.) from GitHub. To do this, open up a terminal window, locate your desired directory, and paste in the following commands:

```
cd $HOME
git clone https://github.com/mahoney1/commpaper
```

The repository should now be successfully cloned, in preparation for the next stage.

If you haven't done so, I recommend checking out the excellent tutorials in the IBM Blockchain Platform VS Code extension - simply click on 'Tutorials' from the extension's home page (fyi: home page icon is top right).

Thanks for joining me!
