## Scenario

Having successfully run and then upgraded the Commercial Paper smart contract ( on the'Commerce' network) in tutorial 2 to add extensive query functionality, MagnetoCorp, DigiBank and Hedgematic - all part of a blockchain consortium - wish to get started with their network in IBM Blockchain Platform in IBM Cloud. The contract will be deployed, they they can carry out 'business as usual'.

The aim of this tutorial, is to show how the [IBM Blockchain Platform Ansible collection](https://github.com/IBM-Blockchain/ansible-collection/blob/master/README.md) can be used to provision an IBM Blockchain Platform network for each organisation. Your `papercontract` smart contract is deployed to this network. For the purposes of this tutorial, all 3 organisation's nodes will be deployed to the same 30-day trial cluster. You can get [information on how to get this cluster](https://cloud.ibm.com/docs/blockchain?topic=blockchain-ibp-saas-pricing#ibp-saas-pricing-free) and use it free for 30 days.

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

5. The last file to edit is `ordering-org-vars.yml` - the ordering service variables YAML file also needs the api information - carry out **exactly** the same changes as in the step for editing the organisation YAML files in the previous step. So again, the first 4 lines of this file are identical to those added in the previous step.


You've now completed your edits. Next, launch the ansible to build the 3 org network. This will run a set of ansible playbooks.

6.  Ensure you are in the `tutorial` directory to run this command - as this is the mount point (-v) into the container instance launched below:. Also ensure the file `tutorial.sh` has execute permissions (it should have after cloning earlier).  

```
docker run --rm -v "$PWD:/tutorial" myansible:latest /tutorial/tutorial.sh
```

You will shortly see it build the IBM Blockchain Platform. 

<img src="/img/tutorial3/run-ansible-script.png" title="Run the ansible build" alt="Run the IBP Ansible build" />

Now is a good time to go to your 'empty' IBM Blockchain Platform Console you launched earlier, as you can see the nodes being added in the console (sometimes you will need to toggle between 'Nodes' and 'Channels' and back to 'Nodes' to see the very latest status of a node being provisioned.



1. In VS Code, `contracts` should be your top-level folder.

2. Open the main contract script file, `lib/papercontract.js`, under the `lib` folder. Add the following code block as instructed below:
   
   _Before_ the _last_ function, `queryOwner`, and _after_ the function `queryHist`, add the following lines. This is in the "main" contract file, and the `queryDeltas` transaction below will later be called from your client application.
   
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
   
   You'll notice that it calls the existing `getHistory` function (in the query class, in `query.js`). This uses an iterator to get the full history of the paper. Next, it calls the `getDeltas` function (also from `query.js`, this function doesn't exist -- yet!) which is responsible for resolving the deltas after the paper is initially issued. You'll add this utility function in the next step.
   
3. Note that once you've pasted this into VS Code, the `ESLinter` may (if enabled) report a problem in the "Problems" pane. You can easily rectify any formatting issues by choosing `right-click....` in the "Problems" pane at the bottom, then  `Fix all auto-fixable issues`. Likewise, this will remove all trailing spaces if any are reported.

4. Once you've completed this formatting, save your file (choose **Save** from the menu or press **Ctrl+S** to save your file).

### Step 2. Add the getDeltas query worker function to the query class in query.js

1. Click on the source file `lib/query.js` and open it. Add the following worker functions as instructed below. This will get the deltas and also return the data (to the main `queryDeltas` function) in a JSONified form suitable for passing on to the `tabulator` HTML client app.
  
  _After_ the existing `getHistory` function -- and _before_ the closing brace (immediately before the `module.exports` line) -- paste the following two functions:
  
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

2. Note that once you've pasted this into VS Code, the `ESLinter` may (if enabled) report a problem in the "Problems" pane. You can easily rectify any formatting issues in the "Problems" pane at the bottom by choosing `right-click....`, then  `Fix all auto-fixable issues`. Likewise, this will remove all trailing spaces if any are reported.

3. Once you've completed this formatting task and ensured that there are no more problems at the bottom, you can use **Ctrl+S** to save your file.

OK, now let's get this new contract functionality out on the blockchain and replace the older version.

### Step 3. Upgrade your smart contract version using the VS Code extension and instantiate the new edition

1. First, you need to update the version number for your contract. To do this, update the `package.json` file and change the version in preparation for the contract upgrade. Click on the `package.json` file in Explorer and:
  
  * Change the **version** field to become "0.0.3."
  * Hit "CONTROL + S" to save it.

2. Next, click on the source control sidebar icon and click the `tick` icon to commit, with a message of "adding queries" and press **Enter**.
  
  You're now ready to upgrade your existing smart contract package using the VS Code extension.

3. Click on the `IBM Blockchain Platform` sidebar icon and under "Smart Contracts" select "Package Open Project." You should see that version "0.0.3" becomes the latest edition of `papercontract`.

4. Under the **Fabric Environments** panel in the IBM Blockchain Platform sidebar, expand the instantiated contract "papercontract" and highlight it.

5. Right-click on **papercontract@0.0.2 — Upgrade Smart Contract** and choose "papercontract@0.0.3" from the list presented (up top). Then, select the peer offered at the top.

6. Enter `org.papernet.commercialpaper:instantiate` when prompted to enter a function name to call, and then press ENTER twice (no parameters are required to the function).

  **Figure 2. Upgrading the `papercontract` smart contract in the IBM Blockchain VS Code extension**
  
  ![Upgrading smart contract in VS Code](images/fig2.png)
  
  You should get a message in the console that the upgrade is taking place.
  
  It will take a minute or so for the upgrade to be executed (as it has to build the new smart contract container), and you should then get a "successful instantiation" message pop-up at the bottom right. The container (when seen from `docker ps`) will have the contract version (0.0.3) as a suffix.

### Step 4. Upgrade the DigiBank query client app to invoke a queryDeltas transaction

1. In VS Code, click on the menu option **File > Open Folder**, open the folder under `organization/digibank/application`, and press **Enter**.

2. Open the existing file `queryapp.js` (from the previous tutorial) and then paste the contents shown below _before_ the line that begins with the comment `// query the OWNER of a commercial paper`.
  
  Paste this code:
  
  ```
        console.log('Calling queryDeltas to get the deltas of Commercial Paper instance 00001');
        console.log('========================================================================');

        // QUERY the deltas of a commercial paper providing it the Issuer/paper number combo below
        let deltaResponse = await contract.evaluateTransaction('queryDeltas', 'MagnetoCorp', '00001');
        deltaResponse = "data = '" + deltaResponse.toString().replace(/\\"/g,'') + "'";

        // parse the response sent back from contract -> client app
        let file2 = await fs.writeFileSync('deltas.json', deltaResponse, 'utf8');
        console.log('the query DELTAS response is ' + deltaResponse);
        console.log(' ');

        console.log('Transaction complete.');
        console.log(' ');
  ```

3. Then you can choose **View > Problems** to see the formatting/indentation errors. In the "Problems" pane, do a right-click `Fix all auto-fixable errors`, and it should automatically fix all the indentation issues.

4. Press **Ctrl+S** to save the file, and then click on the `Source Control` icon to commit the file with a commit message. The `queryapp.js` client contains three query functions (two of which already existed):
  
 * A `queryHist` function that gets the history of a commercial paper instance.
 * A `queryDeltas` function that gets the deltas of that history.
 * A `queryOwner` function that gets the list of commercial papers owned by an organization (provided as a parameter to the query function).

Next up, you'll test the new application client from a terminal window.

### Step 5. Run the updated DigiBank client query application

At this point, you already have a history of transactions from the previous tutorial. Now you can run the deltas query app as Balaji from Digibank using his existing wallet to run the query:

1. From a terminal window, change the directory to the `$HOME/fabric-samples/commercial-paper/organization/digibank/application` folder.

2. Run the queryapp client using the node, `node queryapp.js`.

3. You should see the results from the `queryHist` function, followed by the `queryDeltas` function, and finally the `queryOwner` transaction in the terminal window. The `queryHist` query transaction creates a file called results.json, and the `queryDeltas` query transaction creates a file called deltas.json in the current directory.

### Step 6. Display the formatted deltas history results to a browser app

For this step, you'll use a simple [Tabulator](http://tabulator.info/examples/4.1) that renders your results in an HTML table. You don’t have to install any code or client per se, nor use jQuery — you will use a simple, local HTML file that uses online CSS formatting and loads the results as JSON (avoiding CORS issues in Firefox) and render it in the table. That deltas.html file comes from the commpaper Github repo cloned previously; please take some time to peruse the HTML file.

_**Note:** This HTML file is provided as-is, for the purposes of rendering in a Firefox browser. (At the time of writing, some of the JavaScript formatting -- such as the `forEach` loop -- does not work in Chrome, but it works fine in Firefox.)_

1. Launch a Firefox browser session (install Firefox if you don't have it), providing the index.html file along with the issuer/paper number as a parameter. For example:
  
  ```
  firefox deltas.html?myParam="MagnetoCorp:0001"
  ```

2. You should see the deltas (what changed in that transaction, by the invoking ID listed) in tabular form in the browser; expand or contract column widths as it suits. Note that the TxId here is the Fabric transaction ID. The invoking ID is the invoker common name, which is extracted using the client identity library from the previous query tutorial.
  
  The deltas represent what has changed after the asset was initially created (the "issue" transaction) -- mainly, the owner of the asset and the price paid. (Of course, if other fields have changed, the report would reflect that, too.)
  
  Note also that you report the state on each line. So, for example, two "buy" transactions states in a row do not necessarily indicate a change in state, but are reported nonetheless for clarity.
  
  **Figure 3. History of changes during the sample commercial paper lifecycle**
  
  ![History of changes during the sample commercial paper lifecycle](images/fig3b.png)

Well done! You've now added further query functionality, processing only the deltas, contract-side, before returning the changes/deltas only to the calling client.

## Summary

In this three-part tutorial series, you've learned how to enhance an existing smart contract using the IBM Blockchain Platform to orchestrate and deploy changes in your development environment. You've also added code to capture just the deltas from a full asset history, and rendered them in an HTML-based client application.

* [Part 1: Run a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/run-commercial-paper-smart-contract-with-ibm-blockchain-vscode-extension/)
* [Part 2: Enhance and add queries to a commercial paper smart contract with the IBM Blockchain VS Code extension](https://developer.ibm.com/tutorials/queries-commercial-paper-smart-contract-ibm-blockchain-vscode-extension/)

For further study, I recommend you look at the IBM Developer [code patterns](https://developer.ibm.com/patterns/category/blockchain/) to try out further sample use cases using the IBM Blockchain Platform VS Code extension. For example, the [global finance sample use case](https://developer.ibm.com/patterns/global-financing-use-case-for-blockchain/) features a global finance smart contract and sample web application that interacts with it using the new Fabric 1.4 contract/fabric-network programming model enhancements.
