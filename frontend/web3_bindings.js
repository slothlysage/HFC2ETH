/*
 *	These are the binding for interacting with the simple contract
 *
 *
*/

//wrapped in scope to have private functions
var wb = (function() {

	// address of owner
	// will need a more secure way to store this durring production
	var owner = "0x6EE490Da93d5baA3828fb6BF2a004d085EEb93Cf"

	// setup web3js so it is usable
	if (typeof web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

	// setup contract to be used
	// will need to be updated to contract released to main net
	var simpleContractAddress = "0x682540487418efcd79e47fca40c711a3c2b05035"
	var simpleContract = new web3.eth.Contract(simpleABI, simpleContractAddress);

	// for gathering the form information submitted
	function getFormInfo() {
		var info = {};

		info.currency = "HFC";
		info.amount = (document.getElementById("amount").value * 1000000000000000000);
		info.userId = document.getElementById("userId").value;
		info.wallet = document.getElementById("wallet").value;

		return info;
	}

	// gather wallet info from web3 0-9
	// used for testing on the truffle rpc, not used for production
	function getAccount(num) {
		web3.eth.getAccounts(function (err, accounts) {
			if (!accounts || err) {
				console.log(err);
				return
			}
			return accounts[num];
		})
	}

	// bool that lets you send or not
	var canSend = true;

	// grabs exchange rate
	// then packages info from user input along with exchange rate to
	// send to simple contract
	function sendTrx(info) {
		if (canSend == true) {
			canSend = false;
			getExchangeRate()
			.then((rate) => {
				var exRate = web3.utils.toHex(new web3.utils.BN(rate.toString()));
				var amount = web3.utils.toHex(new web3.utils.BN(info.amount.toString()));
				var time = (new Date).getTime();
				time = web3.utils.toHex(new web3.utils.BN(time.toString()));
				simpleContract.methods.recieveTrx(info.userId, exRate, time)
				.send({from: info.wallet, value: amount, gas: 300000}, function(error, hash) {
					console.log(error, hash);
				}).then(() => {canSend = true;});
			})
		}
			
	};

	// function used to get exchange rate using promises
	let getExchangeRate = () => {
		return new Promise((resolve,reject) => {
			const Url = 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=ETH';
		
			fetch(Url)
			.then(data => {return data.json()})
			.catch(error => reject(error))
			.then(function(res) {
			console.log(res);
			rate = Math.round(res.ETH * 10000000000000000);
			resolve(rate);
			})
		});
	}

	// bool to let you audit or not
	var canAudit = true;

	// used to log audits to google sheets
	// using cors-anywhere as a stop-gap measure not to be used in production
	// first sends request to google for the last transaction logged
	// then grabs all transactions and truncated to the latest unlogged ones
	// last send off package to google sheets to update
	function auditToGoogle() {
		if (canAudit == true) {
			canAudit = false;
			const url = "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbwGHKmPtp7L6mjXZq_1uGys-ig1B4PKnUIjia2rdtTNuRebiPiZ/exec"
			fetch(url + "?type=last", {
				method: 'GET'
			}).then(res => res.json())
			.then(last => getLatestAudit(last - 1))
			.then(latest => fetch(url, {
				method: 'POST',
				body: JSON.stringify(latest)
			})).then(res => console.log(res))
			.then(() => {canAudit = true;})
		}
		
	}

	// get all data from contract via promises as a promise
	// can only be called by owner of the contract
	let getFullAudit = () => {
		return new Promise((resolve, reject) => {
			Promise.all([
				simpleContract.methods.trxIdAudit().call({from : owner}),
				simpleContract.methods.userIdAudit().call({from : owner}),
				simpleContract.methods.amountAudit().call({from : owner}),
				simpleContract.methods.exchangeAudit().call({from : owner}),
				simpleContract.methods.timeAudit().call({from : owner}),
				simpleContract.methods.addressAudit().call({from : owner})
			]).then(values => resolve(values))
			.catch(error => reject(error))
		})
	}

	// get the transactions not logged yet in google sheets
	let getLatestAudit = (last) => {
		return new Promise((resolve, reject) => {
			getFullAudit().then(function(audit) {
				hex1 = audit[1][0];
				hex2 = audit[1][1];
				var jsonPackage = {};
				for (i = last; i < audit[0].length; i++) {
					jsonPackage[i] = [
						recoverUserID(hex1[i], hex2[i]),
						audit[2][i],
						audit[3][i],
						audit[4][i],
						audit[5][i]
					]
				}
				console.log(jsonPackage);
				resolve(jsonPackage);
			}).catch(error => reject(error));	
		})
	}

	// user name needs to be chooped into two hex byte32s to be passed out of solidity
	// this function recovers them
	function recoverUserID(hex1, hex2) {
		return(hex2a(hex1) + hex2a(hex2));
	}

	// convert hex back to ascii, and not using first two chars '0x'
	function hex2a(hex) {
		var hex = hex.toString();
		var str = '';
		for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	}

	// functions accessable via html
	// will need to put full audit and withdraw behind admin barriers
	return {
		submitTrx : function() {
			var info = getFormInfo();
			sendTrx(info);
		},
		fullAudit : function() {
			auditToGoogle();
		},
		withdraw : function() {
			simpleContract.methods.withdrawETH().send({from : owner, gas: 300000})
			.then(res => console.log(res));
		},
		close : function() {
			simpleContract.methods.close().send({from : owner, gas: 300000})
			.then(res => console.log(res));
		}
	};
})();