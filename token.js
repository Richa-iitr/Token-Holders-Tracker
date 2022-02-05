import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/67b5c4101fcd46dda47de2384c0c97e1"));
const ABI = [{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"implementation_","type":"address"},{"internalType":"uint256","name":"initialSupply_","type":"uint256"},{"internalType":"uint256","name":"mintingAllowedAfter_","type":"uint256"},{"internalType":"bool","name":"transferPaused_","type":"bool"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"oldName","type":"string"},{"indexed":false,"internalType":"string","name":"newName","type":"string"}],"name":"ChangedName","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"oldSybmol","type":"string"},{"indexed":false,"internalType":"string","name":"newSybmol","type":"string"}],"name":"ChangedSymbol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"},{"indexed":true,"internalType":"address","name":"newMinter","type":"address"}],"name":"MinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldImplementation","type":"address"},{"indexed":false,"internalType":"address","name":"newImplementation","type":"address"}],"name":"NewImplementation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"}],"name":"TransferPaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"}],"name":"TransferUnpaused","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"address","name":"implementation_","type":"address"}],"name":"_setImplementation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"instaIndex","outputs":[{"internalType":"contract IndexInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const CONTRACT_ADDR = '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb';

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDR);

const blockNumber = await web3.eth.getBlockNumber();

function throwErr(err){
    throw new Error(err);
}
const map = new Map();

getResult();
function getResult(){
    getEvents(0,blockNumber, map);
    console.log(map);
    const sortMap = new Map([...map.entries()].sort((a,b) => b[1] - a[1]));
    console.log(map);
}

async function getEvents(start, end, map) {

    let options = {
        fromBlock: start,
        toBlock: end,
    };

    contract.getPastEvents('Transfer', options, function(error, events) {
                if(error && error.message == 'Returned error: query returned more than 10000 results') {
                    const mid = Math.round((start + end)/2);
                    getEvents(start, mid,map);
                    getEvents(mid+1, end,map);
                } else {

                    var obj = JSON.parse(JSON.stringify(events));
                    var array = Object.keys(obj);
                    for(var i=0;i<array.length;i++){
                        var from = obj[array[i]].returnValues.from;
                        // console.log(from);
                        var to = obj[array[i]].returnValues.to;
                        // console.log(to);
                        var balance = obj[array[i]].returnValues.amount;
                        // console.log(balance);
                        var netfrom = map.get(from.toString(16)) - balance;
                        map.set(from.toString(16), netfrom );
                        if(map.get(to.toString()) == undefined){
                            map.set(to.toString(), balance);
                        }
                        else {
                            var tobal = map.get(to.toString()) + balance;
                            map.set(to.toString(),tobal);
                        }

                    }
        }
    });

};
