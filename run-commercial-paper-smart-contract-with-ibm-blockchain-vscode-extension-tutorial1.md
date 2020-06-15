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

3. Now launch a MicroFab (a single containerised 'Commerce' Fabric development network, as per the JSON configuration above). The IBM Blockchain Platform VS Code extension has the ability to add and connect to this development environment (listening on port 8080) - it is an experimental feature that can be enabled under 'View....Command Palette'. The command to launch the MicroFab container environment is:


`docker run --rm -ti -p 8080:8080 -e MICROFAB_CONFIG="${MICROFAB_CONFIG}" sstone1/microfab:latest`

### Step 3. Launch VS Code and install the IBM Blockchain Platform extension for VS Code

You can launch VS Code from your task bar, or by typing `code` in a terminal window.

Now you need to install the IBM Blockchain Platform VS Code extension -- you'll need to install the minimum version VS Code (see pre-requisites above) to do this successfully. To see if you have the right version of VS Code, go to `Help` -> `Check for updates`. Next, click on the `Extensions` icon in the VS Code sidebar (left). In the search bar, type `IBM Blockchain Platform` and click on `Install`. You should see a status of "Installing" and eventually "Installed" -- click `reload` when prompted.

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

1. Using the IBM Blockchain Platform from the left sidebar, start up a MicroFab based 'Commerce' blockchain network - the IBM Blockchain Platform VS Code extension conveniently provides you with the ability to start a custom 'Commerce' Fabric, all running inside one docker container on your local virtual machine. 
  
  Click on the ellipsis ("+") button under the **Fabric Environments** view and choose **Add a MicroFab network"** from the list.
  
  ![Add a Microfab environment](images/add-microfab.png)
  
2. You will be prompted to provide a URL - accept the default URL provided (assuming you have no other Microfab environments running on your machine).

![Add a Microfab environment](images/confirm-microfaburl.png)

3. Provide the environment with a name of 'Commerce' - you should see a popup message (bottom right) confirming it was successfully added. Also on the left, you'll see the environment added and Gateways and Wallets relating to that environment.

![Add a Microfab environment](images/confirm-microfabname.png)

4. Next, connect to the `Commerce` Fabric Environment, and click on the `+ Install` button to install the `papercontract@0.0.1` package - select the button to install on all three peers (from MagnetoCorp, DigiBank and Hedgematic) at this time - we will use `Hedgematic` later on in the tutorial series.

![Add a Microfab environment](images/install-contractonpeers.png)
  
5. Next, you will instantiate the smart contract on the channel `mychannel` by clicking on 'Instantiate' under Fabric Environments and choosing `papercontract@0.0.1` as the contract to use.

![Add a Microfab environment](images/choose-contract.png)

5. When prompted, enter `instantiate` (all lower case) as the function name to call, when instantiating.

6. Press `enter` to accept the default for 'no parameters' to provide

7. Press `enter` to accept the default 'No' to add a private data collection and press `enter` to accept the 'Default' single endorser, when prompted

You should get a message that the contract was instantiated successfully (and you can see the running contract under 'Instantiated' on the sidebar on the left).
  
![Add a Microfab environment](images/confirminstantiation.png)

OK, we now have a deployed contract. The next item is to create some identities in the IBM Blockchain Platform extension.


2. Under the **Fabric Environments** pane, expand the **Smart Contracts** twisty and click on the **+ Install** and select the smart contract packaged earlier. You should soon see a message indicating it was installed on the local peer (in the lower right).
  
3. Next, choose the `papercontract` version 0.0.1 (see popup prompt) as the contract to install. You should then get a message in "Output" indicating that it was successfully installed.
  
4. Under the sidebar panel **Fabric Environments**, click on **+ Instantiate** and choose to instantiate the contract `papercontract@0.0.1` that you installed in the previous step. 
  
5. Paste in the string `org.papernet.commercialpaper:instantiate` when prompted to enter a function name to call, and hit ENTER.
  
6. When prompted to enter optional arguments, hit ENTER to leave it blank (there are no arguments). Accept the defaults for optional subsequent parameter(s) by hitting ENTER.
  
  After a minute or so, you should see a progress message in the bottom right indicating that it is instantiating. Check the output pane to see if it was successfully instantiated.

### Step 6: Create some blockchain identities and import them into the local Fabric wallet

Prior to executing the smart contract transactions below, you should create some identities so that the transactions can be submitted/signed by different transacting identities; as this is a merely a sample contract, you will use the existing Development Fabric CA to issue them. (In reality, both MagnetoCorp and Digibank would issue their own respective organisational identities for their respective apps.) Complete the following steps:

1. Under the **Fabric Environments** panel, locate "Nodes," expand it, highlight the CA node (for example, `ca.org1`), and right-click `.... Create Identity (....)`.

2. When prompted for the identity, provide the name "Isabella@MagnetoCorp" and hit ENTER. You should immediately see that an "Isabella@MagnetoCorp" wallet has been created under the local Fabric wallet in the "Fabric Wallets" pane at the bottom.

3. Next, perform Step 1 above once more, but this time create an identity for "Balaji@DigiBank" and check that it is listed in the local wallet under "Fabric Wallets." You'll use these identities to execute the transactions further down.

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
