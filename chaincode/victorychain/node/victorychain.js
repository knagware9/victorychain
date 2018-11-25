/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

    // The Init method is called when the Smart Contract 'victorychain' is instantiated by the blockchain network
    // Best practice is to have any Ledger initialization in separate function -- see initLedger()
    async Init(stub) {
        console.info('=========== Instantiated victorychain chaincode ===========');
        return shim.success();
    }

    // The Invoke method is called as a result of an application request to run the Smart Contract
    // 'victorychain'. The calling application program has also specified the particular smart contract
    // function to be called, with arguments
    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async queryProduct(stub, args) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting ProductNumber ex: PRODUCT01');
        }
        let productKey = 'PRODUCT-' + args[0];

        let productAsBytes = await stub.getState(productKey); //get the product from chaincode state
        if (!productAsBytes || productAsBytes.toString().length <= 0) {
            throw new Error(productKey + ' does not exist: ');
        }
        console.log(productAsBytes.toString());
        return productAsBytes;
    }

    async initLedger(stub, args) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async createProduct(stub, args) {
        console.info('============= START : Create Product ===========');
        if (args.length !== 5) {
            throw new Error('Incorrect number of arguments. Expecting 5');
        }

        let product = {
            docType: 'product',
            serialNumber: args[0],
            model: args[1],
            shellMaterial: args[2],
            size: args[3],
            owner: args[4]
        };

        await stub.putState('PRODUCT-' + product.serialNumber, Buffer.from(JSON.stringify(product)));
        console.info('============= END : Create Product ===========');
    }

    async queryAllProducts(stub, args) {

        let startKey = 'PRODUCT-0';
        let endKey = 'PRODUCT-999999';

        let iterator = await stub.getStateByRange(startKey, endKey);

        console.info(iterator);

        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return Buffer.from(JSON.stringify(allResults));
            }
        }
    }

    async changeProductOwner(stub, args) {
        console.info('============= START : changeProductOwner ===========');
        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting 2');
        }

        let productKey = 'PRODUCT-' + args[0];

        let productAsBytes = await stub.getState(productKey);
        let product = JSON.parse(productAsBytes);
        product.owner = args[1];

        await stub.putState(productKey, Buffer.from(JSON.stringify(product)));
        console.info('============= END : changeProductOwner ===========');
    }
};

shim.start(new Chaincode());
