## Introduction

This tutorial, the second in the [series](https://developer.ibm.com/series/blockchain-running-enhancing-commercial-paper-smart-contract/) follows on from the [first tutorial](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/) with the focus on local development of the commercial paper smart contract: ie. adding queries, simple and advanced. You will add the required query function code using Node.js javascript, upgrade the smart contract and test it out in your local environment. This sets up nicely for the third tutorial, where you will take this smart contract and deploy to a fully running IBM Blockchain Platform 'Commerce' 3-organization network - you will use the [IBM Blockchain Ansible collection](https://github.com/IBM-Blockchain/ansible-collection/blob/master/README.md), to automate provisioning of this 3-organization Commerce network in a 30-day free Kubernetes cluster in IBM Cloud. This collection is fully-scripted for you; all you have to do is get your free cluster, then 'press the button'. Once provisioned, you will interact with the same smart contract in the cloud-based Commerce network using the IBM Blockchain Platform VS Code extension; you'll also use application clients (provided for you) to generate HTML 5 reports of your ledger data based on the lifecycle of assets updated there. If you want to read more on IBM Blockchain Ansible collections, including a tutorial 0 check it out [here](https://ibm-blockchain.github.io/ansible-collection/)

**Overview**

<img src="/img/tutorial2/reduced-overview.png" title="Commercial Paper scenario overview" alt="scenario overview" />

## Scenario

The 1st version of the `papercontract` smart contract on the network (involving MagnetoCorp, DigiBank and Hedgematic) works great, but all agree query functionality needs to be added. DigiBank have taken responsibility to add this function in two stages ; 

- first, to add standard rich queries, and full asset history query functions ; 
- second, is to add a more advanced 'delta' query capability; instead of the whole history of an asset, only return the elements that have changed (smaller payload)

Once added, the smart contract is packaged, then upgraded on the local 'Commerce' network. It can then be tested by its members, to see the functions work as designed. Between them, they create a 'paper' trail of transactions like before.

OK -- let's get started!

## Steps

### Step 1. Add the main query transaction functions in papercontract.js

1.  In VS Code, open the `contract` folder (if it isn't already open), which contains the smart contract that you completed in the previous tutorial.

<img src="/img/tutorial2/papercontract.png" title="Open contract folder" alt="Open contract folder" />

2. Open the main contract script file `papercontract.js` under the `lib` folder, and add the following line (after the initial `Contract, Context` class declarations line) at line 11 onwards:

  ```
  const QueryUtils = require('./query.js');
  ```

3. Still in `papercontract.js`, find the function that begins `async issue` (around line 67) and scroll down to the line `paper.setOwner(issuer);` (approx line 76) ; create a blank/new line directly under it (which should align with the correct indentation in your code).

4. Now paste in the following code block, which enables you to report the invoker CN of the transaction. The `getInvoker` function uses the `clientIdentity` object that's available via the transaction context (ctx). Hit 'right-click' > "Format Selection" if the pasted code is not indented correctly.

  ```
  // Add the invoking CN, to the Paper state for reporting purposes later on
  let invokingId = await this.getInvoker(ctx);
  paper.setCreator(invokingId);
  ```

  **Note:** This code should be located *before* the line `await ctx.paperList.addPaper(paper);` in this `issue` function.

5. Next, paste that same three-line block (ie above), into the next two transaction functions beginning with `async buy` and `async redeem`, just as you did above in '`async issue`. Paste the code block (in each function) near the end and ensure the paste is *before* the line shown below:

  ```
  await ctx.paperList.updatePaper(paper);
  ```
 

6. Now, in the `async buy` function **only**, at around line 116 in the code (line with comment `// Check paper is not already REDEEMED`), **add** this single line of code *below* the line entitled  `paper.setOwner(newOwner);` make sure the paste is *inside* the `isTrading()` conditional  `if ...then` branch:

  ```
  paper.setPrice(price);
  ```

7. Still in `papercontract.js`, add in the following code block, directly *after* the *closing* curly bracket of the main `async redeem` transaction function, and ensure it is *before* the last *closing* bracket in the file `papercontract.js` (ie the one immediately before the `module.exports` declaration). The code you copied contains three functions (two of which are query transaction functions you will invoke). These two query functions call "internal" or "worker" query functions/iterators in the file `query.js` that you'll add shortly, and the `idGen` function below gets identity information used for reporting later on: 

  ```
      /**
     * grab the invoking CN from the X509 transactor cert
     * @param {Context} ctx the transaction context
     */

    async getInvoker(ctx) {

        // Use the Client Identity object to get the invoker info.
        let cid = ctx.clientIdentity;
        let id = cid.getID(); // X509 Certificate invoker is in CN form
        let CN = id.substring(id.indexOf("CN=") + 3, id.lastIndexOf("::"));
        return CN;
    }

    /**
    * queryHist commercial paper
    * @param {Context} ctx the transaction context
    * @param {String} issuer commercial paper issuer
    * @param {Integer} paperNumber paper number for this issuer
    */
    async queryHist(ctx, issuer, paperNumber) {

        // Get a key to be used for History query
        let cpKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let myObj = new QueryUtils(ctx, 'org.papernet.commercialpaperlist');
        let results = await myObj.getHistory(cpKey);
        //console.log('main: queryHist was called and returned ' + JSON.stringify(results) );
        return results;

    }

    /**
    * queryOwner commercial paper
    * @param {Context} ctx the transaction context
    * @param {String} issuer commercial paper issuer
    * @param {Integer} paperNumber paper number for this issuer
    */
    async queryOwner(ctx, owner, paperNumber) {

        // Get a key to be used for the paper, and get this from world state
        // let cpKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let myObj = new QueryUtils(ctx, 'org.papernet.commercialpaperlist');
        let owner_results = await myObj.queryKeyByOwner(owner);

        return owner_results;
    }
  ```

  **Note:** Once you've pasted this into VS Code, the `ESLinter` extension (if enabled) may report problems in the **Problems** pane at the bottom. If it does, you can easily rectify the formatting issues in the **Problems** pane by choosing **right-click....** then **Fix all auto-fixable issues**. Likewise, it will remove any trailing spaces reported by ESLint. Once you complete the formatting task, be sure to **save your file** via the menu. (You can also use **Ctrl+S** to save your file.) FYI the ESLint extension (from the VS Code extension marketplace) is also useful, and recommend using it to fix any indentation, incorrect pasting, or general errors that can be detected before you package up the smart contract.

8. Right-click in your document and click "Format selection" to format it correctly in your JavaScript file. Ensure you've saved the file before proceeding.

9. You have two more small functions to add inside another source file - its called `paper.js`. Open `paper.js` under the `lib` directory in your VS Code session.

10. *After* the closing bracket for the existing `setOwner(newOwner)` function (at about line 45) --  under the description called `//basic setters and getters` -- *paste in* the following code block (which contains two setter functions):

  ```
    setCreator(creator) {
        this.creator = creator;
    }
    setPrice(price) {
        this.price = price;
    }

  ```

  Then press **Ctrl+S** to save the file.

### Step 2. Add requisite "worker" query class functions to your VS Code project (new file: query.js)

1. Create a new file via the VS Code menu under the `contract/lib` folder using VS Code and call it `query.js`.

<img src="/img/tutorial2/newqueryjs-file.png" title="New query.js file" alt="new query.js file" />

2. Copy the contents of the `query.js` file from the cloned GitHub repo `github.com/mahoney1/commpaper`

3. Paste the contents into your `query.js` VS Code edit session. You should now have a series of functions in your new query JavaScript "worker" `query.js` file. Now go ahead and save this file using **CTRL + S**. 

### Step 3. Add requisite advanced query 'delta' functionality to your VS Code project

1. With the `query.js` file still open, add the 'advanced' delta query code functions to it - you can copy/paste the code segment below, ensuring you paste before the last curly bracket, at the bottom of `query.js` (ie its before the `module.exports` line). 

```
// =========================================================================================
   // getDeltas takes getHistory results for an asset and returns the deltas
   // =========================================================================================

   async getDeltas(obj)  {

       let deltaArr = [];
       let counter = 0;
       let xtra_checked;

       Object.getOwnPropertyNames(obj).forEach( function (key, idx) {
           xtra_checked=0;
           let stdfields = 'TxId, Timestamp, IsDelete';

           for (let field of Object.keys(obj[key]) ) {
               let val = obj[key];
               counter = idx+1;
               let val2 = obj[counter];

               if (counter < obj.length ) {

                   if ( (stdfields.indexOf(field)) > -1 ) {
                       deltaArr.push(field, val[field]);
                   }

                   if (field === 'Value') {

                       for (let element of Object.keys(val[field]) ) { // Value stanza
                           // changes: of value, existing field
                           if ( val2[field].hasOwnProperty(element) && (val[field][element] !==  val2[field][element] )) {
                               deltaArr.push(element, val2[field][element]);
                           }
                           // deletes: field/val deleted (! item.next))
                           if ( (!val2[field].hasOwnProperty(element)) )  {
                               deltaArr.push(element, val[field][element]);
                           }
                           // adds: (new in item.next),add once only!
                           if (!xtra_checked) {
                               for ( let xtra of Object.keys(val2[field]) ) {
                               //console.log("xtra is " + val2[field][xtra] + "checking field " + xtra + "bool " + val[field].hasOwnProperty(xtra) );
                                   if ( (!val[field].hasOwnProperty(xtra)) ) {
                                       deltaArr.push(xtra, val2[field][xtra]);
                                   }
                               }
                               xtra_checked=1;
                           } // if xtra
                       } // for each 'element' loop
                   } // if 'Value' in payload
               } // if less than obj.length
           } // for each 'field' loop
       }  // 'foreach' loop
       ); //closing Object.keys

       return deltaArr ;
   } // async getDeltas

   // =========================================================================================
   // jsontabulate takes getDelta results array and returns the deltas in tabulator(.info) form
   // rendered as a nicely formatted table in HTML
   // =========================================================================================

   jsontabulate(array)  {
       let i= 1;
       let length = array.length;
       let val = '[{'; // begins with - FYI below, each element is stripped of "" by key/value stepthru
       for (let [key, value] of Object.entries(array)) {
           console.log('key is' + key + 'value is ' + value);
           if ( i > 1 && ( (i % 2) === 0)  ) {

               if (i < length)  {
                   val = val + '"' + value + '"' + ',';}  // (output 2-tuple)
               else {
                   val = val + '"' + value + '"}]'; }  // last record
           }
           else {
               if (value === 'TxId') {val = val.replace(/,$/,'},{');} // delimit each record, just before TxId
               val = val + '"' + value + '"' + ':';   // key:value
           }
           i++;
       }
       return val;
   }
```

2. Hit CONTROL and S (**CTRL + S**) to save your file.

3. Return to the main contract file `papercontract.js` in the VS Code Explorer - you will add the high-level transaction functions for the 'delta' advanced query transaction function we will use for reporting upon later.

4. Scroll down to approx line 196 to just before the function called `queryOwner` in `papercontract.js` - and paste in the following code - once again, right-click ...'Format Document' to re-format the code. 

```
/**
    * queryDeltas commercial paper
    * @param {Context} ctx the transaction context
    * @param {String} issuer commercial paper issuer
    * @param {Integer} paperNumber paper number for this issuer
    */
    async queryDeltas(ctx, issuer, paperNumber) {

    // Get a key to be used for History / Delta query
        let cpKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let myObj = new QueryUtils(ctx, 'org.papernet.commercialpaperlist');
        let results = await myObj.getHistory(cpKey);
        let deltas = await myObj.getDeltas(results);
        let jsonstr = myObj.jsontabulate(deltas);
        return jsonstr;
    }
```
 
5. Finally, ensure you hit CONTROL + S to save the changes. You're now done with smart contract edits.

Next, we will upgrade our smart contract to ensure the new functionality is available, replacing the older smart contract edition.

### Step 4. Upgrade your smart contract version using IBM Blockchain Platform VS Code Extension

1. You need to add a version change to the `package.json` file in your project, in preparation for the contract upgrade. Click on the `package.json` file in VS Code Explorer and:
  * Change the value of the "version" field to become "0.0.2."
  * Press **Ctrl+S** to save it.

  Now you're ready to upgrade your smart contract using the VS Code extension.

2. Package the contract: Click on the `IBM Blockchain Platform` sidebar icon and under "Smart Contracts"  view, click the '...' ellipsis button and choose the "Package Open Project" icon; you should see that version 0.0.2 becomes the latest edition of the available "papercontract" packages.

3. Under the **Fabric Environments** panel in the IBM Blockchain Platform sidebar, navigate to 'Smart Contracts' and under `Instantiated` .. right click on `papercontract@0.0.1` and choose to `Upgrade Smart Contract


<img src="/img/tutorial2/upgrade-contract.png" title="Upgrade smart contract" alt="Upgrade smart contract" />

4. When prompted, select to install on all peers by choosing the 'select all' button and click 'OK' - the upgrade should report as being successful, after the new version (0.0.2) has been installed on all 3 peers.

<img src="/img/tutorial2/install-contractonpeers.png" title="Install smart contract" alt="Install smart contract" />

5. Right-click on **papercontract@0.0.1** -- **Upgrade Smart Contract**, and choose **papercontract@0.0.2** from the list presented (up top) -- then select the peer offered at the top.

6. Choose the contract `papercontract@0.0.2` as the contract to use.

7. When prompted, enter `instantiate` (all lower case) as the function name to call during instantiation.

8. Press `enter` to accept the default for 'no parameters'

9. Press `enter` to accept the default 'No' to add a private data collection and again, press `enter` to accept the 'Default' single endorser, when prompted

You should get a message that the contract was instantiated successfully (and you will see the running contract v0.0.2 under 'Instantiated' on the sidebar on the left).
 
<img src="/img/tutorial2/confirm-instantiation.png" title="Confirm contract instantiation" alt="Confirm contract instantiation" />
   
Well done! You have now added rich query and advanced query functionality to the smart contract. Its now time to test the new transactions, which you can see if you connect to the 'DigiBank Gateway' and expand the list of transactions under `papercontract@0.0.2` under `mychannel` - you'll see the new query functions that you can try out shortly:

<img src="/img/tutorial2/confirm-functions.png" title="Confirm query functions" alt="Confirm query functions" />

### Step 4. Create a new DigiBank query client app to invoke query transactions

1. In VS Code, click on the menu option **File** ... **open Folder**, open the folder under `organization/digibank/application`, and press **Enter**.

2. Right-click on the folder in the left pane and create a new file named `queryapp.js`. Then paste the contents of the *other* file named queryapp.js, which is located in the `commpaper` repo that you cloned previously (see steps in the "Summary" section of the [previous Commercial Paper tutorial](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/#summary).

3. Now you can fix any formatting errors if ESLint is enabled (right-click on "Fix all auto-fixable errors," and it should automatically fix any indentation issues).

4. Press **Ctrl+S** to save the file, then click on the **Source Control** icon to commit the file, with a commit message. The `queryapp.js` client contains two query functions:
  * A `queryHist` function that gets the history of a commercial paper instance
  * A `queryOwner` function that gets the list of commercial papers owned by an organization (provided as a parameter to the query function)

  Next, you'll create the transaction history, then run the new query client app to execute a set of queries. (You'll do this from a terminal window in DigiBank's application folder; it doesn't matter whether you test from MagnetoCorp or DigiBank in this example -- you should see the same data on the ledger from either application client.)

### Step 5. Perform the issue, buy, and redeem transaction lifecycle to update the ledger

Let’s create some transactions, invoked as different identities, to create a history of transactions on the ledger. The sequence is:

1. Issue a paper as "MagnetoCorp."
2. Buy the paper as "DigiBank," the new owner.
3. Buy the paper as "Hedgematic," the changed owner.
4. Redeem the paper at face value, as existing owner "Hedgematic," with MagnetoCorp as the original issuer.

![Transaction flow](images/flow-transaction-2.png)

#### Set up the client connection for the application client

In preparation for connecting your local application JavaScript clients to the local Fabric development runtime, you need to do some simple actions to get connection information to use in those JavaScript clients. The high level steps are:

* Export the connection details (connection.json) from the IBM Blockchain Platform VS Code extension panel.

* Have the client application scripts (cloned earlier with the Fabric samples repo) used by this tutorial point to this exported connection file for its connection information. In the next sequence, you will change the following 3 Fabric sample clients in the subdirectories shown:

  * `'magnetocorp/organization/application/issue.js'`
  * `'digibank/organization/application/buy.js'`
  * `'digibank/organization/application/redeem.js'`

1. From the IBM Blockchain Platform extension sidebar, locate the development peer under "Nodes" in the sidebar pane **Fabric Environments** on the left.

2. Right-click on the peer and select "Export Connection Profile," and save the file `connection.json` to your home directory (such as "/home/ibm").

3. From a terminal window, open up the file `$HOME/fabric-samples/commercial-paper/organization/magnetocorp/application/issue.js` in VS Code and edit the following sections:

  * Comment out the line beginning with `const yaml =` (approx. line 19) so that it reads:
    ```
    //const yaml = require('js-yaml');
    ```
  * Comment out the following line (approx. line 41) that begins with `let connectionProfile = yaml.safeLoad` so that it reads:
    ```
    // let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));
    ```

  * Below this line, add the following 2 lines of code.

    **Note:** The path provided is in single quotes below. For `readFileSync` (below), _you must provide (replace below as necessary) the full file export path to your connection.json_. Copy that path from the "output" panel and add the filename as shown below. (The filepath below may be different for you; I am using the home directory for "user1" in this example!)
    ```
    let fpath = fs.readFileSync('/home/ibm/connection.json', 'utf8');
    let connectionProfile = JSON.parse(fpath);
    ```

    And that's all of the changes for the "issue" client.

  * Comment out the following line (approx. 25) so that it reads:
    ```
    // const wallet = new FileSystemWallet('../identity/user/isabella/wallet');
    ```
    And add this line below it (where `/home/ibm` is the `$HOME` of your chosen home directory):
    ```
    const wallet = new FileSystemWallet('/home/ibm/.fabric-vscode/wallets/local_fabric_wallet/');
    ```

  * Comment out the following line (approx. 38) so that it reads :
    ```
    // const userName = 'User1@org1.example.com';
    ```
    and add this line below it:
    ```
    const userName = 'Isabella@MagnetoCorp';
    ```

  * On line 51, change the `discovery` parameter to `true` from its current value, `false`.

4. Next, perform the same changes for the DigiBank client application (this is at the same level as the "magnetocorp" subdirectory):

  Change the "buy.js" and "redeem.js" client scripts in _exactly_ the same way as completed in the instructions in bullet 3 above (for MagnetoCorp), located under the DigiBank `application` client folder. The DigiBank application also:

    * reads the local_fabric connection.json file path as shown
    * uses the wallet (`local_fabric_wallet`) and the correct user name for the identity that will perform the transaction (Balaji@DigiBank); the definitions for `wallet` (approx. line 25) and `userName` (approx. line 38)
    * needs to change the `discovery` parameter so that it is set to `true`

**Note:** You will need to install Node.js application dependencies (use `npm install` for both Transactions #1 and #2 below) for the existing MagnetoCorp and DigiBank client applications below.

#### Transaction #1. Execute an `issue` transaction as Isabella@MagnetoCorp

1. Open a terminal window and change the directory to MagnetoCorp's application directory (assuming `$HOME` is the holding location below):

  ```
  cd $HOME/fabric-samples/commercial-paper/organization/magnetocorp/application
  ```

2. Now execute the first commercial paper transaction from the `application` directory -- the `issue` transaction:

  ```
  node issue.js
  ```

  You should get messages confirming it was successful:

  **Figure 5. The `issue` transaction**
  ![The issue transaction](images/issue-output.png)

#### Transaction #2. Execute a `buy` transaction as Balaji@DigiBank

1. In the same terminal window, change the directory to DigiBank's application directory:

  ```
  cd ../../digibank/application
  ```

2. Now execute the first commercial paper `buy` transaction from the `application` directory:

  ```
  node buy.js
  ```

  You should get messages confirming it was successful:

  **Figure 6. The `buy` transaction**
  ![The buy transaction](images/buy-output.png)

#### Transaction #3. Execute another `buy` transaction as Bart@Hedgematic

DigiBank is restructuring its investment portfolio and has decided to sell the commercial paper for a small profit to release funds earlier. The purchaser, Hedgematic, sees this as an opportunity to increase its commercial paper portfolio and recoup the face value of the paper at some point in the future. Let's execute this transaction as an employee of Hedgematic. (For convenience, you're providing a temporary wallet for the Hedgematic employee "Bart," so Hedgematic can invoke a `buy` transaction.)

1. From a terminal window (still in the `digibank` application subdirectory), copy the `buy.js` client application script in the current directory to another client named `buy2.js`:
  ```
  cp buy.js buy2.js
  ```

2. Edit `buy2.js` and change the `userName` attribute to `Bart@Hedgematic`.

  Comment out the following line (approx. 38) so that it reads :
  ```
  // const userName = 'Balaji@DigiBank';
  ```
  And add this line below it:
  ```
  const userName = 'Bart@Hedgematic';
  ```
  Comment out the following line (approx. 72) and add a line so that it reads:
  ```
  const buyResponse = await contract.submitTransaction('buy', 'MagnetoCorp', '00001', 'DigiBank', 'Hedgematic', '4930000', '2020-05-31');
  ```
  Then save the file.

3. Return to the VS Code extension and from the **Fabric Environments** panel, then under **Nodes** > **CA node**, right-click and create an identity for "Bart@Hedgematic" (exactly as shown).

4. Now run the second `buy` transaction (using Bart's identity in the client application, `buy2.js`), as follows:

  ```
  node buy2.js
  ```

  You should get messages confirming it was successful:

  **Figure 7. The second `buy` transaction**
  ![The second buy transaction](images/buy-output2.png)

#### Transaction #4: Execute a `redeem` transaction as Bart@Hedgematic -- six months later

The time has come in this commercial paper's lifecycle for the commercial paper to be redeemed by its current owner (Hedgematic) at face value, so it recoups its investment outlay. A client application named redeem.js performs this task, and it needs to use bart@hedgematic's identity from owner Hegematic to perform it. (Currently, the redeem.js sample script uses `balaji`'s identity, but because Hedgematic has since bought the paper from DigiBank, you need to modify the script to redeem it properly as Hedgematic's Bart.) For the purposes of this tutorial, you just need to run the client application script for `redeem` from the `digibank` application subdirectory.

1. Once again, from a terminal window and the same directory, `$HOME/fabric-samples/commercial-paper/organization/digibank/application`, edit the file `redeem.js`.

2. Change the line beginning with `const userName =` (around line 38) to read as follows (you may prefer to copy the existing line, and comment the original line, using `//` ), so the `userName` points to Bart, the Hedgematic employee:

  ```
  const userName = 'Bart@Hedgematic';
  ```

  **Note:** If you prefer, you can issue your own identity using the currently active CA server, using the VS Code extension, and change this script as appropriate.

3. Change the line beginning with `const redeemResponse` (around line 67), and change the *fourth* parameter to "Hedgematic":

   ```
   const redeemResponse = await contract.submitTransaction('redeem', 'MagnetoCorp', '00001', 'Hedgematic', '2020-11-30')
   ```

   Then save your file and commit any changes.

4. Now run the redeem.js script:

  ```
  node redeem.js
  ```

  You should get messages confirming it was successful:

  **Figure 8. The `redeem` transaction -- the last in the lifecycle**
  ![The redeem transaction](images/redeem-output.png)

### Step 6. Launch the sample DigiBank client query application

1. From a terminal window (still in the `digibank` application folder), change the following lines to match your `$HOME` directory (in the `queryapp.js` script below, `$HOME` is the directory `/home/ibm`):
  * Line 23: `const wallet = new FileSystemWallet('/home/ibm/ .....'); etc`
  * Line 39: `let fpath = fs.readFileSync('/home/ibm/ .....'); etc`

2. Run the queryapp client using the node:

  ```
  node queryapp.js
  ```

3. You should see the JSON results from both the `queryHist` and `queryOwner` functions in the terminal window. It also creates a file called results.json in the current directory (history of the asset) as a result of the `queryHist` query invocation.

  **Figure 9. The queryapp client results**
  ![The queryapp client results](images/queryapp-results.png)

### Step 7. Display the history in a nice HTML-based UI

For this step, you use a simple [Tabulator](http://tabulator.info/examples/4.1) that renders your results in an HTML table. You don’t have to install any code or client per se, nor use jQuery -- you will use a simple, local HTML file that uses online CSS formatting and loads the results as JSON (avoiding CORS issues in Firefox) and render it in the table. That index.html file comes from the "commpaper" Github repo cloned previously; please take some time to peruse the HTML file.

**Note:** This HTML file is provided as-is, and is purely used for rendering in a Firefox browser. At the time of this writing, some of the JavaScript formatting (it doesn't use jQuery) does not work in Chrome (which doesn't like `forEach`), but has been tested in Firefox.

1. In a terminal window, open the DigiBank `application` directory once again (you should already be there).

2. Copy the index.html file from the `commpaper` repo (cloned earlier) into the directory (with the trailing "." for the current directory):

  ```
  cp $HOME/commpaper/index.html .
  ```

  If you examine the HTML file in VS Code Explorer, you’ll see that it loads a results file called results.json (created by the queries app invoked earlier) as JSON.

3. Launch a Firefox browser session (see note above) providing the index.html file provided as a parameter -- tested with Firefox:

  ```
  firefox index.html
  ```

4. You should see the results in tabular form in the browser; expand or contract column widths as necessary, such as longer columns like `Txn ID`. Note that `TxId` here is the Fabric transaction ID. The `Invoking ID` is the invoker Common Name, which is extracted using the Client Identity library mentioned earlier. Obviously, this would need to be made available as an attribute by any of the organizations that execute transactions using this shared smart contract. As an alternative, a hash of the signer certificate can be used.

  **Figure 10. Commercial paper: Asset history report**
  ![Commercial Paper: Asset History Report](images/fig10b.png)

Well done! You've now managed to successfully add query functionality to the commercial paper sample smart contract using the IBM Blockchain Platform VS Code extension.

## Summary

This tutorial showed you how to add queries and upgrade your existing commercial paper contract using the IBM Blockchain Platform VS Code extension and use features from Hyperledger Fabric's new programming model. Take time to peruse the transaction (query) functions in both papercontract.js and the query class file query.js under the `lib` directory. And be sure to peruse the client application, queryapp.js.

You've learned how to render the history results (the history of a commercial paper asset) in a simple browser-based HTML application. The final tutorial in this series will show only changes during the lifecycle.

As a last step, it is good practice to close out your current folders in VS Code, in preparation for the next tutorial. [The third and final tutorial in this series](https://developer.ibm.com/tutorials/add-further-query-functionality-using-the-ibp-vscode-extension/) will show you how to add smart contract functionality to query only the deltas for the history of a particular asset.

Until then, thanks for joining me!
