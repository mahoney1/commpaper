/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 5 basic steps:
 * 1. Select an identity from a wallet (supply as param)
 * 2. Connect to the respective gateway
 * 3. Access PaperNet network
 * 4. Construct request to query commercial paper history and submit ('evaluate') other query transactions
 * 5. Process responses that are returned (eg display, render in a browser etc)
 *
 * Supply two parameters to the client app: <organisation name> and <identity name>
   eg  node clientapp.js DigiBank david
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');


var args = process.argv.slice(2);
if ( typeof args === "undefined" ) { 
        console.log('no args provided on command line - please provide 2: orgname and identity name');
        process.exit(-1);
        //throw new Error('No argument was supplied - undefined - please try again');
}
let org = args[0];  // eg DigiBank, MagnetoCorp, Hedgematic
const userName = args[1]; // david, magnus, helen

const fabenv = process.env.HOME + '/.fabric-vscode';
const walletpath = fabenv +  '/wallets/' + org;
const connPath = fabenv + '/gateways/' + org + '_GW' + '/connection.json';
console.log('walletpath is ' + walletpath);
// A wallet stores a collection of identities for use - this is presently in the user's HOME dir

// Main program function
async function main() {

   const wallet = await new FileSystemWallet(walletpath);

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // path below is variable
        let fpath = fs.readFileSync(connPath, 'utf8');
        let connectionProfile = JSON.parse(fpath);
	
        // Set connection options; identity and wallet
	const identityExists = await wallet.exists(userName);

        if (!identityExists) {
            console.log('An identity for the user' + userName + 'does not exist in the wallet');
            return;
        } else console.log('found the wallet for ' + userName);
	
        let connectionOptions = {
            identity: userName, 
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: false }
        };
        

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.commercialpaper smart contract.');

        const contract = await network.getContract('papercontract');

	// console.log('issue a transaction');
	// const issueResponse = await contract.submitTransaction('issue', 'MagnetoCorp', '00001', '2020-05-31', '2020-11-30', '5000000');
	// let paper = CommercialPaper.fromBuffer(issueResponse);

        // console.log(issueResponse.toString());
        /// console.log('Transaction complete.');

        console.log(' ');
        console.log('Calling queryHist to get the history of Commercial Paper instance 00001');
        console.log('=======================================================================');
        console.log(' ');
        // QUERY the history of a commercial paper providing it the Issuer/paper number combo below
        let queryResponse = await contract.evaluateTransaction('queryHist', 'MagnetoCorp', '0002');
        queryResponse = "data = '" + queryResponse.toString().replace(/\\"/g,'') + "'";

        let file = await fs.writeFileSync('results.json', queryResponse, 'utf8');
        console.log('the query HISTORY response is ' + queryResponse);
        //console.log('the query buffer response is ' + queryresult);
        console.log(' ');

        console.log('Transaction complete.');
        console.log(' ');

        // query the OWNER of a commercial paper
        console.log(' ');
        console.log(' ');
        console.log('Calling queryOwner to get current owner of Commercial Paper instance 00001');
        console.log('==========================================================================');
        console.log(' ');
        console.log(' ');
        const queryResponse2 = await contract.evaluateTransaction('queryOwner', 'MagnetoCorp');

        console.log('the query by OWNER response is ' + queryResponse2);
        console.log(' ');
        console.log('Transaction complete.');
        console.log(' ');
        console.log('End of Queries ============================================');
        console.log(' ');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Query program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
