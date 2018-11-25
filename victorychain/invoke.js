'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode Invoke
 */

let Fabric_Client = require('fabric-client');
let path = require('path');
let util = require('util');
let os = require('os');

//
let fabric_client = new Fabric_Client();

// setup the fabric network
let channel = fabric_client.newChannel('mychannel');
let peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
let order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

//
let member_user = null;
let store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
let tx_id = null;

/**
 *
 * @param req
 * @param res
 */
/**
 *
 * @param req
 * @param res
 * @return {Promise<*>}
 */
module.exports.createProduct = function(req, res) {
    if (!req.body.ownerEmail || !req.body.ownerFirstName || !req.body.ownerLastName || !req.body.ownerLanguage || !req.body.ownerCountry || !req.body.ownerGender ||
        !req.body.productSerialNumber || !req.body.productModel || !req.body.productShellMaterial || !req.body.productSize
    ) {
        return res.send('You musst fill all fields!');
    } else {
        let args = [
            req.body.productSerialNumber,
            req.body.productModel,
            req.body.productShellMaterial,
            req.body.productSize,
			JSON.stringify({
                email: req.body.ownerEmail,
                firstName: req.body.ownerFirstName,
                lastName: req.body.ownerLastName,
                language: req.body.ownerLanguage,
                country: req.body.ownerCountry,
                gender: req.body.ownerGender
			})
        ];

		 invoke('createProduct', args, function (result) {
             if (result === 'VALID') {
                 res.send('Product created successfully!');
             } else {
                 res.send('Failed to create Product :: ' + result);
             }
         });
	}
};

/**
 *
 * @param req
 * @param res
 */
module.exports.changeProductOwner = function(req, res) {
    if (!req.body.ownerEmail || !req.body.ownerFirstName || !req.body.ownerLastName || !req.body.ownerLanguage || !req.body.ownerCountry || !req.body.ownerGender ||
        !req.body.productSerialNumber
    ) {
        return res.send('You musst fill all fields!');
    } else {
        let args = [
            req.body.productSerialNumber,
            JSON.stringify({
                email: req.body.ownerEmail,
                firstName: req.body.ownerFirstName,
                lastName: req.body.ownerLastName,
                language: req.body.ownerLanguage,
                country: req.body.ownerCountry,
                gender: req.body.ownerGender
            })
        ];

        invoke('changeProductOwner', args, function (result) {
            if (result === 'VALID') {
                res.send('Product Owner have been changed successfully!');
            } else {
                res.send('Failed to change Product Owner :: ' + result);
            }
        });
	}
};

/**
 *
 * @param fcn
 * @param args
 * @param callback
 * @return {Promise<void>}
 */
async function invoke(fcn, args, callback) {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
	await Fabric_Client.newDefaultKeyValueStore({ path: store_path})
		.then((state_store) => {
			// assign the store to the fabric client
			fabric_client.setStateStore(state_store);
            let crypto_suite = Fabric_Client.newCryptoSuite();
			// use the same location for the state store (where the users' certificate are kept)
			// and the crypto store (where the users' keys are kept)
            let crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
			crypto_suite.setCryptoKeyStore(crypto_store);
			fabric_client.setCryptoSuite(crypto_suite);

			// get the enrolled user from persistence, this user will sign all requests
			return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
			if (user_from_store && user_from_store.isEnrolled()) {
				console.log('Successfully loaded user1 from persistence');
				member_user = user_from_store;
			} else {
				throw new Error('Failed to get user1.... run registerUser.js');
			}

			// get a transaction id object based on the current user assigned to fabric client
			tx_id = fabric_client.newTransactionID();
			console.log("Assigning transaction_id: ", tx_id._transaction_id);

			// createProduct chaincode function - requires 5 args, ex: args: ['PRODUCT-12', 'test', 'test', 'test', 'test'],
			// changeProductOwner chaincode function - requires 2 args , ex: args: ['PRODUCT-10', 'waleed@4eyes.ch'],
			// must send the proposal to endorsing peers
        	let request = {
				//targets: let default to the peer assigned to the client
				chaincodeId: 'victorychain',
				fcn: fcn,
				args: args,
				chainId: 'mychannel',
				txId: tx_id
			};

			// send the transaction proposal to the peers
			return channel.sendTransactionProposal(request);
		}).then((results) => {
        	let proposalResponses = results[0];
        	let proposal = results[1];
			let isProposalGood = false;
			if (proposalResponses && proposalResponses[0].response &&
				proposalResponses[0].response.status === 200) {
				isProposalGood = true;
				console.log('Transaction proposal was good');
			} else {
				console.error('Transaction proposal was bad');
			}
			if (isProposalGood) {
				console.log(util.format(
					'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
					proposalResponses[0].response.status, proposalResponses[0].response.message));

				// build up the request for the orderer to have the transaction committed
				let request = {
					proposalResponses: proposalResponses,
					proposal: proposal
				};

				// set the transaction listener and set a timeout of 30 sec
				// if the transaction did not get committed within the timeout period,
				// report a TIMEOUT status
				let transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
				let promises = [];

				let sendPromise = channel.sendTransaction(request);
				promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

				// get an eventhub once the fabric client has a user assigned. The user
				// is required bacause the event registration must be signed
				let event_hub = channel.newChannelEventHub(peer);

				// using resolve the promise so that result status may be processed
				// under the then clause rather than having the catch clause process
				// the status
				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						event_hub.unregisterTxEvent(transaction_id_string);
						event_hub.disconnect();
						resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
					}, 3000);
					event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
							// this is the callback for transaction event status
							// first some clean up of event listener
							clearTimeout(handle);

							// now let the application know what happened
							let return_status = {event_status : code, tx_id : transaction_id_string};
							if (code !== 'VALID') {
								console.error('The transaction was invalid, code = ' + code);
								resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
							} else {
								console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
								resolve(return_status);
							}
						}, (err) => {
							//this is the callback if something goes wrong with the event registration or processing
							reject(new Error('There was a problem with the eventhub ::'+err));
						},
						{disconnect: true} //disconnect when complete
					);
					event_hub.connect();

				});
				promises.push(txPromise);

				return Promise.all(promises);
			} else {
				console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
				throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
			}
		}).then((results) => {
			let status = results[0].status;
			console.log('Send transaction promise and event listener promise have completed');
			// check the results in the order the promises were added to the promise all list
			if (results && results[0] && results[0].status === 'SUCCESS') {
				console.log('Successfully sent transaction to the orderer.');
			} else {
				console.error('Failed to order the transaction. Error code: ' + results[0].status);
                throw new Error('Failed to order the transaction. Error code: ' + results[0].status);
			}

			if(results && results[1] && results[1].event_status === 'VALID') {
				console.log('Successfully committed the change to the ledger by the peer');
				status = results[1].event_status;
			} else {
				console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
                throw new Error('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
			}
            callback(status);
		}).catch((err) => {
			console.error('Failed to invoke successfully :: ' + err);
		});
}