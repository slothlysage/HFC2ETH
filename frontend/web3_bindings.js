/*
 *	These are the binding for interacting with the simple contract
 *
 *
*/

//wrapped in scope to have private functions
var wb = (function() {

	// address of owner
	var owner = "0x6EE490Da93d5baA3828fb6BF2a004d085EEb93Cf"

	// setup web3js so it is usable
	if (typeof web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

	// setup contract to be used
	var simpleContractAddress = "0x4230f68bdb7ae8f11a337a082f789d73cdef008c"
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
	function getAccount(num) {
		web3.eth.getAccounts(function (err, accounts) {
			if (!accounts || err) {
				console.log(err);
				return
			}
			return accounts[num];
		})
	}

	// using new web3js bindings.
	function sendTrx(info) {
		getExchangeRate()
		.then((rate) => {
			var exRate = web3.utils.toHex(new web3.utils.BN(rate.toString()));
			var amount = web3.utils.toHex(new web3.utils.BN(info.amount.toString()));
			var time = (new Date).getTime();
			time = web3.utils.toHex(new web3.utils.BN(time.toString()));
			simpleContract.methods.recieveTrx(info.userId, exRate, time)
			.send({from: info.wallet, value: amount, gas: 300000}, function(error, hash) {
				console.log(error, hash);
			});
		})	
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
		

	// used to log audits to google sheets
	// using cors-anywhere as a stop-gap measure not to be used in production
	// first sends request to google for the last transaction logged
	// then grabs all transactions and truncated to the latest unlogged ones
	// last send off package to google sheets to update
	function auditToGoogle() {
		const url = "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbwGHKmPtp7L6mjXZq_1uGys-ig1B4PKnUIjia2rdtTNuRebiPiZ/exec"
		fetch(url + "?type=last", {
			method: 'GET'
		}).then(res => res.json())
		.then(last => getLatestAudit(last - 1))
		.then(latest => fetch(url, {
			method: 'POST',
			body: JSON.stringify(latest)
		})).then(res => console.log(res))
	}

	// get all data from contract via promise
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

	// get the transactions not logged yet
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

	function recoverUserID(hex1, hex2) {
		return(hex2a(hex1) + hex2a(hex2));
	}

	function hex2a(hex) {
		var hex = hex.toString();
		var str = '';
		for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	}
	// need to write useful public functions for getting user data
	return {
		showExchangeRate : function() {
			getExchangeRate();
		},
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
		}
	};
})();