
/*
SPDX-License-Identifier: Apache-2.0
*/
'use strict';


//const CommercialPaper = require('./paper.js');
const State = require('../ledger-api/state.js');

/**
 * Query Class for query functions such as history etc
 *
 */
class QueryUtils  {

    constructor(ctx, listName) {
        this.ctx = ctx;
        this.name = listName;
        this.supportedTypes = {};
    }

    // ===========================================================================================
    // queryKeyByPartial performs a partial query based on the namespace and key prefix provided

    // Read-only function results are not typically submitted to ordering. If the read-only
    // results are submitted to ordering, or if the query is used in an update transaction
    // and submitted to ordering, then the committing peers will re-execute to guarantee that
    // result sets are stable between endorsement time and commit time. The transaction is
    // invalidated by the committing peers if the result set has changed between endorsement
    // time and commit time.
    // 
    // ===========================================================================================
    
    async queryKeyByPartial(ctx, args) {

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 2');
        }

        let prefix =  args[1];  // prefix 'key' to finding using partial composite, left to right
        //let endKey = ':' + args[2]; // range stuff
        //console.log('arg1 is ' + startKey + 'arg2 is ' + endKey); // range stuff
        //let resultsIterator = await this.ctx.stub.getStateByRange(startKey, endKey); // range doesnt work with composite keys
        
        // ie namespace + prefix to assets etc eg 
        // "Key":'org.papernet.commercialpaperlist"MagnetoCorp""00001"' [00001, 00002 etc]
        // "Partial":'org.papernet.commercialpaperlist"MagnetoCorp"'
        let resultsIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name,[prefix]);
        let method = this.getAllResults;
        let results = await method(resultsIterator, false);

        return results; // return Buffer.from(JSON.stringify(results));
    }



    // ===== Example: Parameterized rich query =================================================
    // queryKeyByOwner queries for assets based on a passed in owner.
    // This is an example of a parameterized query where the query logic is baked into the chaincode,
    // and accepting a single query parameter (owner).
    // Only available on state databases that support rich query (e.g. CouchDB)
    // =========================================================================================
    async queryKeyByOwner(args) {
    //   0
    // 'bob'
        let self = this;
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting owner name.');
        }
        let owner = args;
        let queryString = {};
        queryString.selector = {};
        //  queryString.selector.docType = 'indexOwnerDoc';
        queryString.selector.owner = owner;
        console.log(' query string is ', queryString);
        // '{"selector":{"owner":"MagnetoCorp"}}'
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }

    // ===== Example: Ad hoc rich query ========================================================
    // queryAdhoc uses a query string to perform a query for marbles..
    // Query string matching state database syntax is passed in and executed as is.
    // Supports ad hoc queries that can be defined at runtime by the client.
    // If this is not desired, follow the queryKeyByOwner example for parameterized queries.
    // Only available on state databases that support rich query (e.g. CouchDB)
    // =========================================================================================
    async queryAdhoc(args) {
    //   0
    // 'queryString'
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting owner name.');
        }
        let self = this;
        let queryString = args;
        if (!queryString) {
            throw new Error('queryString must not be empty');
        }
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        const bool = true ;
        while (bool) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                //console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    //jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.Timestamp = new Date((res.value.timestamp.seconds.low*1000));
                    let ms = res.value.timestamp.nanos/1000000;
                    jsonRes.Timestamp.setMilliseconds(ms);
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of getAllResults iterator data');
                await iterator.close();
                console.info(allResults);
                return allResults; // JSON.stringify(allResults);
            }
        }
    }

    // =========================================================================================
    // getQueryResultForQueryString executes the passed in query string.
    // Result set is built and returned as a byte array containing the JSON results.
    // =========================================================================================
    async getQueryResultForQueryString(ctx, self, queryString) { 
        
        console.log('- getQueryResultForQueryString queryString:\n' + queryString);

        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        //let method = this.getAllResults;

        let results = await self.getAllResults(resultsIterator, false);

        return results ; 

    }

    // =========================================================================================
    // getHistory takes the composite key as arg, gets returns results as JSON to 'main contract'
    // =========================================================================================
    async getHistory(key) {

        let ledgerkey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
        const resultsIterator = await this.ctx.stub.getHistoryForKey(ledgerkey);
        let results = await this.getAllResults(resultsIterator, true);

        return results;
    }



}
module.exports =  QueryUtils ;
