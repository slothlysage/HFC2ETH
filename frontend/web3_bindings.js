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
	var simpleContractAddress = "0xa04f88823ce2d0c1396d2534ffbe43dbba19d73e"
	var simpleContract = new web3.eth.Contract(simpleABI, simpleContractAddress);

	// placeholdervar for global exchange rate
	var rate = 0;

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
		Promise.resolve(getExchangeRate())
		.then(() => {
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
	function getExchangeRate() {
		const Url = 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=ETH';
		
		fetch(Url)
		.then(data=>{return data.json()})
		.then(function(res) {
			console.log(res);
			rate = Math.round(res.ETH * 10000000000000000);
			return rate;
		});
	};

	function auditToGoogle() {
		console.log(simpleContract.methods.trxIdAudit().call({from : owner}));
		console.log(simpleContract.methods.userIdAudit().call({from : owner}));
		console.log(simpleContract.methods.amountAudit().call({from : owner}));
		console.log(simpleContract.methods.exchangeAudit().call({from : owner}));
		console.log(simpleContract.methods.timeAudit().call({from : owner}));
		console.log(simpleContract.methods.addressAudit().call({from : owner}));
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
			console.log(simpleContract.methods.withdrawETH().send({from : owner, gas: 300000}));
		}
	};
})();