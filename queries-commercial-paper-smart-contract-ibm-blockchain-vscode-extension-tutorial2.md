## Introduction

This tutorial, the second in the [series](https://developer.ibm.com/series/blockchain-running-enhancing-commercial-paper-smart-contract/) follows on from the [first tutorial](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/) with the focus on further development of the commercial paper smart contract use case: ie. adding queries, both simple and advanced. You will add the code as part of the tutorial, then upgrade the smart contract and test it out in your local 'Commerce' network started in tutorial 1. Once you're happy, you can proceed to the third tutorial, where you will take this smart contract and deploy to a fully running IBM Blockchain Platform 'Commerce' 3-organization network. You will use the [IBM Blockchain Ansible collection](https://github.com/IBM-Blockchain/ansible-collection/blob/master/README.md), to automate provisioning of this 3-organization Commerce network in a 30-day free Kubernetes cluster in IBM Cloud. This collection is fully-scripted for you; all you have to do is get your free cluster, then 'press the button'. Once provisioned, you interact with the contract using 1) the IBM Blockchain Platform VS Code extension and 2) application clients (provided for you). The last part of the tutorial will see you using a HTML 5 client app to render asset history reports showing the full lifecycle of an asset. If you want to read more on IBM Blockchain Ansible collections, including a tutorial - check it out [here](https://ibm-blockchain.github.io/ansible-collection/)

**Overview**

<img src="/img/tutorial2/reduced-overview.png" title="Commercial Paper scenario overview" alt="scenario overview" />

## Scenario

The 1st version of the `papercontract` smart contract on the network (featuring MagnetoCorp, DigiBank and Hedgematic) works great, but all parties agree query functionality needs to be added. DigiBank have taken responsibility to add this function in two stages; 

- first, to add standard queries, like invoking identity or asset owner; 
- second, is to add rich and more advanced queries like asset history, assets by asset namespace (partial key), ad-hoc queries and  'delta payload' query capability; in the latter, instead of the whole history of an asset being return - only return the elements that have changed (ie smaller payload)

Once the functions are added, the smart contract is packaged, then upgraded on the local 'Commerce' network. It is then tested by 2 members, to see the functions work as designed. Between them, they create a simple 'paper' trail of transactions like before.

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

  **Note:** Once you've pasted this into VS Code, the `ESLinter` extension (if installeds/enabled) may report problems in the **Problems** pane at the bottom. If it does, you can easily rectify the formatting issues in the **Problems** pane by choosing **right-click....** then **Fix all auto-fixable issues**. Likewise, it will remove any trailing spaces reported by ESLint. Once you complete the formatting task, be sure to **save your file** via the menu. (You can also use **Ctrl+S** to save your file.) FYI the ESLint extension (from the VS Code extension marketplace) is also useful, and recommend using it to fix any indentation, incorrect pasting, or general errors that can be detected before you package up the smart contract.

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
   
Well done! You have now added rich query and advanced query functionality to the smart contract. Its now time to test the new transactions, which you can see if you connect to the 'DigiBank Gateway' and expand the list of transactions under `papercontract@0.0.2` under `mychannel` - you'll see the new query functions that you can try out shortly. 

<img src="/img/tutorial2/confirm-functions.png" title="Confirm query functions" alt="Confirm query functions" />

### Step 4. Perform the issue, buy, and redeem transaction lifecycle to create data on the ledger

Let’s create some transactions, invoked as different identities, to create a history of transactions on the ledger. The sequence is:

1. Issue a paper as "MagnetoCorp."
2. Buy the paper as "DigiBank," the new owner.
3. Buy the paper as "Hedgematic," the changed owner.
4. Redeem the paper at face value, as existing owner "Hedgematic," with MagnetoCorp as the original issuer.

#### Transaction 1: Execute an `issue` transaction as MagnetoCorp

1. From the IBM Blockchain Platform VS Code sidebar panel, locate the **Fabric Gateways** view and click on the `MagnetoCorp` Gateway. It will automatically connect with the single identity in the wallet, ie `MagnetoCorp Admin`. Expand the `mychannel` twisty, then  expand `papercontract@0.0.1` to reveal the list of transactions in the contract.

    <img src="/img/tutorial1/magnetogw-connect.png" title="Connect as MagnetoCorp" alt="Connect as MagnetoCorp" />

2. Highlight the "issue" transaction and right-click `Submit Transaction`. A pop-up window should appear at the top.
  
3. When prompted, copy and paste the following parameters (incl. double-quotes) **inside** the existing square brackets "[]" and hit ENTER. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`. **Make sure there are no trailing ' ' spaces** in your input to transactions:

  ```
"MagnetoCorp","00001","2020-05-31","2020-11-30","5000000"
  ```
  
4. Check the message (in the **Output** pane) indicating that this transaction was successfully submitted.

<img src="/img/tutorial2/issue-success.png" title="Confirm issue success" alt="Confirm issue success" />
  
5. Lastly, disconnect from the `MagnetoCorp` Gateway by clicking the 'Fabric Gateways' pane title, then click on the "disconnect" icon.

#### Transaction 2. Execute a `buy` transaction as DigiBank

1. Click once on the `DigiBank` Gateway - it will connect with the 'DigiBank Admin' identity - the only one in the wallet.
  
2. Expand the `mychannel` twisty and then the `papercontract@0.0.1` twisty, in turn to see the transaction list.

3. Highlight, then right-click, the "buy" transaction and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`:
  
  ```
"MagnetoCorp","00001","MagnetoCorp","DigiBank","4900000","2020-05-31"
  ```
  
5. Once again, check the message (in the output pane) indicating that this transaction was successfully submitted.

6. Disconnect from the `DigiBank` Gateway from the `Fabric Gateways` view.

#### Transaction 3. Execute another `buy` transaction - this time, as Hedgematic

1. Click once on the `Hedgmatic` Gateway - it will connect with the `Hedgematic Admin` identity as the only one in the wallet.
  
2. Expand the `mychannel` twisty and then the `papercontract@0.0.2` twisty, in turn.

3. Highlight, then right-click, the "buy" transaction and right-click "Submit Transaction." A pop-up window will appear.

4. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`. Hit ENTER to accept defaults for the next two prompts:  `Transient data` entry, and  `DEFAULT peer targeting policy`:

  ```
"MagnetoCorp","00001","DigiBank","Hedgematic","4930000","2020-06-15"
  ```
5. Again, check the results for a successful transaction in the `Output` pane.


#### Transaction 4. Execute a `redeem` transaction as Hedgematic -- c. six months later

Months later in this commercial paper's lifecycle, the current owner (Hedgematic) wishes to **redeem** the commercial paper "0001" at face value and get a return on the investment outlay. Typically, a client application would perform this task with a valid identity. For testing purposes, we can use the IBM Blockchain VS Code extension to do this.


1. Still connected to the `Hedgematic` Gateway, highlight the `redeem` transaction and right-click ... "Submit Transaction." A pop-up window will appear.
  
2. When prompted, copy and paste the following parameters (incl. the double-quotes) **inside** the square brackets, `[]`, and hit ENTER, then hit ENTER again (to skip Transient Data and Peer Targeting):
  
  ```
"MagnetoCorp","00001","Hedgematic","2020-11-30"
  ```
  
3. Check the message (in the output pane) indicating that this `redeem` transaction was successfully submitted.

4. Disconnect from the `Hedgematic` Gateway using the disconnect icon (click the Fabric Gateways title to see the icon)

Well done! You've completed the transaction lifecycle; now its time to do some queries!

### Step 6. Test a simple query in the upgraded contract using the VS Code extension

Let's test out a simply query you added, with some ledger data:

1. Connect to the `MagnetoCorp` Gateway (it uses the default Admin identity),  expand the channel `mychannel` and `papercontract@0.0.2` twisties - right-click on the transaction `getInvoker` and choose `Evaluate Transaction` - there are no parameters to this function - just hit `enter` - the Output pane should show that the current invoker is 'MagnetoCorp Admin'

This function is also a 'worker' function (used elsewhere in the contract) to get the current invoking identity - useful for reporting purposes later on as we'll see.

2. The other functions perform rich queries - MicroFab uses LevelDB right now - but you can easily start up a `1 Org Local Fabric` environment under `Fabric Environments` which uses CouchDB. Go ahead and do this now. 

3. As shown previously, install / instantiate the `papercontract@0.0.4` contract package by connecting to the `1 Org` environment and quickly running the Transactions #1 -> #4 above before proceeding.

4. Next, having instantiated the contract on the `1 Org Fabric` environment - expand the channel `mychannel` and contract `papercontract@0.0.4` -- then right-click on the `queryHist` query transaction and click `Evaluate Transaction` 

    <img src="/img/tutorial2/choose-queryhist.png" title="Running queryHist transaction" alt="Running queryHist transaction" />

3. Provide the following parameters inside the `[ ]` square brackets, including the quotes:

"MagnetoCorp", "0001"
    
4. Accept the defaults by simply hitting `enter` for the next 3 prompts (accept the defaults)

The output panel should reveal a JSON formatted data listing, showing the history of Commercial paper asset "MagnetoCorp0001".

5. Let's try another query - this time, query the list of Commercial papers owned by an organization using the `queryByOwner` transaction function. Highlight this transaction...right-click...`Evaluate Transaction` - supply one parameter inside the `[ ]` brackets, as follows:

"Hedgematic"

6. Accept the defaults by simply hitting `enter` for the next 3 prompts (accept the defaults)

The output panel should reveal a JSON formatted data listing, showing the Commercial paper assets owned by Hedgematic (1 paper).

OK, so our query functions appear to be working fine. Our contract is ready. Now we need to deploy this to a 'real' network, which you'll create (by means of an automated Ansible script) once you create your free cluster in IBM Cloud (You can [preview the IBM Blockchain Platform at no charge for 30 days](https://cloud.ibm.com/registration?target=%2Fcatalog%2Fservices%2Fblockchain).

You will need to create, then link your IBM Blockchain Platform service instance to the IBM Cloud Kubernetes free cluster. Create the as a cluster called `mycluster` and then link the IBM Blockchain Platform service, before you start the third tutorial. We'll tell you how to get your credentials from IBM Blockchain Platform, so you can provide them to Ansible to authenticate and provision the 'Commerce' 3-org network.

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
