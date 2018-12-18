/***************************************************************************

pull eth->$ spot price
display exchange rate

input username, wallet address, amount in ETH or HFC
log trx
contruct contract trx
send trx to metamask for signing

contract json example:
{
	currency: HFC,
	amount: 100,
	trxid: "0x..."
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
	- get multisig salt
	- create trxids usefully
		- get last trx?
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

	const trx = [
		{ name: "currency", type: "string" },
		{ name: "amount", type: "uint256" },
		{ name: "trxid", type: "uint256" },
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

	// function to package the transaction for sending
	function packTrx(currency, amount, userId, wallet) {

		// trxid created for audit purposes
		//!!!NEED TO CREATE TRXID CREATION FUNCTION
		var trxid = newtrxidfunction();

		// setup message filled in via user input
		var message = {
			currency: currency,
			amount: amount,
			trxid: trxid,
			user: {
				userId: userId,
				wallet: wallet
			}
		};

		// layout of the variables
		const trx = JSON.stringify({
			types: {
				EIP712Domain: domain,
				Trx: trx,
				Identity: identity,
			},
			domain: domainData,
			primaryType: "Trx",
			message: message
		});

		return trx;
	}

	// signing and sending the trx off to the ethereum chain
	// gets signature in form of r, s, v
	// need to double-check eth_signedTypedData_v3 if still valid
	function sendTrx(trx) {

		web3.currentProvider.sendAsync(
			{
				method: "eth_signedTypedData_v3",
				params: [signer, trx],
				from: signer
			},
			function(err, result) {
				if (err) {
					return console.error(err);
				}
				const signature = result.result.substring(2);
				const r = "0x" + signature.substring(0, 64);
				const s = "0x" + signature.substring(64, 128);
				const v = parseInt(signature.substring(128, 130), 16);
			}
		);
	};

	// function to log the trx for auditing purposes
	function logTrx(trx) {
		// need to find out what databases we have to log this to
		// can use a local DB for testing
	};

	// need to write useful public functions for getting user data
	return {
		signing2ETH: function() {
		},
		showInfo: function(component) {
		}
	}

})();
