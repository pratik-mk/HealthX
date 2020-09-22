const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');
var bodyParser = require("body-parser");
const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://goerli.infura.io/v3/b358549d97e44fb8b54e17089a9339b5"));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.get('/', function (req, res) {

    res.status(200).render('index');

});

app.get('/sendtx', function (req, res) {

    res.status(200).render('send');

});

app.post('/sendtx', function (req, res) {


    var publickey = req.body.pubkey;//'0xd2E2fA7904d28d162E4d00aa1837C6597622f40A';                   
    var privateKey = Buffer.from(req.body.prtkey, 'hex');//'55ce8dedffaa3d7272fc8ff8687acfca72b28f06712697f61c7d71b1b12bf6bf'
    var recevier = req.body.radd;//'';
    var amount = web3js.utils.toHex(req.body.amt);

    // console.log(publickey, privateKey, recevier, amount);
    test(publickey, privateKey, recevier, amount);
    res.status(200).render('send');
});


// app.post('/gettx', function (req, res) {


//     var myAddress = req.body.fname;//'0xd2E2fA7904d28d162E4d00aa1837C6597622f40A';
//     var privateKey = Buffer.from(req.body.lname, 'hex'); //'8ed638cfa20c2fa4ef4938dc50727850afd612ac715375e915eb92eb1c9b554e'
//     var toAddress = '0xd2E2fA7904d28d162E4d00aa1837C6597622f40A';//'0xaAF7ADf9Ba290Ff8D2bBEa7703861eBa192C08e1';

//     var amount = web3js.utils.toHex(req.body.aname);

//     console.log(amount);
//     test(myAddress, privateKey, toAddress, amount);

// });



function test(myAdd, prtKey, toAdd, amt) {

    var myAddress = myAdd;
    var privateKey = prtKey;
    var toAddress = toAdd;
    var Tx = require("ethereumjs-tx").Transaction
    //contract abi is the array that you can get from the ethereum wallet or etherscan
    var contractABI = [
        {
            "constant": false,
            "inputs": [],
            "name": "acceptOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "tokens",
                    "type": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "approveAndCall",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "transferAnyERC20Token",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_to",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "tokenOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "_totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "tokenOwner",
                    "type": "address"
                },
                {
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "remaining",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "tokenOwner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "newOwner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256"
                },
                {
                    "name": "b",
                    "type": "uint256"
                }
            ],
            "name": "safeAdd",
            "outputs": [
                {
                    "name": "c",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256"
                },
                {
                    "name": "b",
                    "type": "uint256"
                }
            ],
            "name": "safeDiv",
            "outputs": [
                {
                    "name": "c",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256"
                },
                {
                    "name": "b",
                    "type": "uint256"
                }
            ],
            "name": "safeMul",
            "outputs": [
                {
                    "name": "c",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256"
                },
                {
                    "name": "b",
                    "type": "uint256"
                }
            ],
            "name": "safeSub",
            "outputs": [
                {
                    "name": "c",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];
    var contractAddress = "0x4B7047E0d3f4D7071e7C13Fe9727e7a98E533f5A";

    //creating contract object
    var contract = new web3js.eth.Contract(contractABI, contractAddress);

    var count;
    // get transaction count, later will used as nonce
    web3js.eth.getTransactionCount(myAddress).then(function (v) {
        console.log("Count: " + v);
        count = v;

        var amount = amt;

        console.log(amount);
        // creating raw tranaction
        var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": contractAddress, "value": "0x0", "data": contract.methods.transfer(toAddress, amount).encodeABI(), "nonce": web3js.utils.toHex(count) }
        console.log(rawTransaction);
        //creating tranaction via ethereumjs-tx
        const transaction = new Tx(rawTransaction, { chain: 'goerli', hardfork: 'petersburg' }); ~
        //signing transaction with private key
        transaction.sign(privateKey);
        //sending transacton via web3js module
        web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            .on('transactionHash', console.log);

        contract.methods.balanceOf(myAddress).call()
            .then(function (balance) {
                console.log(web3.utils.fromWei(balance, "finney"))
            });
    })
}


// Do not touch
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;