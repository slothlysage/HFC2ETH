/***************************************************************************

pull eth->$ spot price
display exchange rate

input username, wallet address, amount in ETH or HFC
log tx
contruct contract tx
send tx to metamask for signing

contract json example:
{
	type: HFC,
	amount: 100,
	txid: "0x..."
	user: {
		userID: "seanjones2848",
		wallet: "0x..."
	}
}

domain separator:
{
	name: "HFC2ETH",
	version: "1",
	chainID: "1",
	verifyingContract: "0x...",
	salt: "0x..."
}

next:
	- write solidity signing verification
	- get multisig salt
	- create txids usefully
		- get last tx?
		- hash of current data + nonse?
	- write user data gathering bindings
	- test signing function

***************************************************************************/

var web3_bindings = (function() {

	// datatypes
	// can stay in this scope
	const domain = [
		{ name: "name", type: "string" },
		{ name: "version", type: "string"},
		{ name: "chainID", type: "uint256"},
		{ name: "verifyingContract", type: "address" },
		{ name: "salt", type: "bytes32" },
	];

	const tx = [
		{ name: "type", type: "string" },
		{ name: "amount", type: "uint256" },
		{ name: "txid", type: "uint256" },
		{ name: "user", type: "Identity" },
	],

	const identity = [
		{ name: "userID", type: "string" },
		{ name: "wallet", type: "address" },
	];

	// domain separator need to put in verifying contract
	// can stay in this scope
	//!!! NEEDS CONTRACT VALUE
	//!!! NEEDS MULTISIG SALT
	const domainData = {
		name: "HFC2ETH",
		version: "1",
		chainID: parseInt(web3.version.network, 10),
		verifyingContract: "",
		salt: ""
	};

	function signTx(type, amount, userId, wallet) {

		// txid created for audit purposes
		//!!!NEED TO CREATE TXID CREATION FUNCTION
		var txid = newtxidfunction();

		// setup message filled in via user input
		var message = {
			type: type,
			amount: amout,
			txid: txid,
			user: {
				userId: userId,
				wallet: wallet
			}
		};

		// layout of the variables
		const data = JSON.stringify({
			types: {
				EIP712Domain: domain,
				Tx: tx,
				Identity: identity,
			},
			domain: domainData,
			primaryType: "Tx",
			message: message
		});

		return data;
	}

	function sendTx(data) = {

		// signing and sending the tx off to the ethereum chain
		// gets signature in form of r, s, v
		// need to double-check eth_signedTypedData_v3 if still valid
		web3.currentProvider.sendAsync(
			{
				method: "eth_signedTypedData_v3",
				params: [signer, data],
				from: signer
			},
			function(err, result) {
				if (err) {
					return console.error(err);
				}
				const signature = result.result.substring(2);
				const r = "0x" + signature.substring(0, 64);
				const s = "0x" signature.substring(64, 128);
				const v = parseInt(signature.substring(128, 130), 16);
			}
		);
	};

	// need to write useful public functions for getting user data
	return {
		signing2ETH: function() {
		},
		showInfo: function(component) {
		}
	}

})();
