/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to query commercial paper history
 * 5. Submit query transactions
 * 6. Process responses that are returned (eg display, render in a browser etc)
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use - this is presently in the user's HOME dir
//const wallet = new FileSystemWallet('../identity/user/balaji/wallet');
const wallet = new FileSystemWallet('/home/ibm/.fabric-vscode/local_fabric_wallet');

// Main program function
async function main() {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        //const userName = 'Admin@org1.example.com';
        const userName = 'Balaji@DigiBank';
        
        // path below is variable
        let fpath = fs.readFileSync('/home/ibm/connection.json', 'utf8');
        let connectionProfile = JSON.parse(fpath);

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.commercialpaper smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        console.log(' ');
        console.log('Calling queryHist to get the history of Commercial Paper instance 00001');
        console.log('=======================================================================');
        console.log(' ');
        // QUERY the history of a commercial paper providing it the Issuer/paper number combo below
        const queryResponse = await contract.submitTransaction('queryHist', 'MagnetoCorp', '00001');
        //let queryresult = CommercialPaper.fromBuffer(queryResponse);

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
        const queryResponse2 = await contract.submitTransaction('queryOwner', 'MagnetoCorp', '00001');

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
