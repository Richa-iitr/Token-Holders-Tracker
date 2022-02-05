import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    process.env.INFURA_KEY
  )
);

const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];
const CONTRACT_ADDR = "0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb";

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDR);

const blockNumber = await web3.eth.getBlockNumber();

function throwErr(err) {
  throw new Error(err);
}

await getResult();

async function getResult() {
  let j = 0;
  let map = new Map();
  let eventData = [];
  await getEvents(0, blockNumber, eventData);
  
  for (let obj of eventData) {
    var from = obj.returnValues.from.toLowerCase();
    var to = obj.returnValues.to.toLowerCase();
    var balance = new BigNumber(obj.returnValues.amount);
    map.set(from, 0);
    var netfrom = new BigNumber(map.get(from)).minus(
      new BigNumber(balance)
    );
    map.set(from, netfrom);

    if (!map.get(to)) {
      map.set(to, balance);
    } else {
      var tobal = new BigNumber(map.get(to)).plus(balance);
      map.set(to, tobal);
    }
  }
  
  let arr = [];
  map.forEach((k, v) => {
    arr.push({ address: v, amount: new BigNumber(k) });
  });
  arr = arr.sort((a, b) => (a.amount.gt(b.amount) ? 1 : -1));
  for (let i = arr.length - 1; i >= arr.length - 15; i--) {
    console.log(
      `Holder Number ${arr.length - i}: Address[${arr[i].address
      }] with Amount - ${arr[i].amount.toFixed(0)} `
    );
  }
}

async function getEvents(start, end, eventData) {
  let options = {
    fromBlock: start,
    toBlock: end,
  };

  await contract.getPastEvents("Transfer", options)
    .then(
      async function (events) {
        // eventData.push(events);
        for (var ev of events) {
          eventData.push(ev);
        }
      })
    .catch(
      async function (error) {
        let mid = Math.round((start + end) / 2);
        await getEvents(start, mid, eventData);
        await getEvents(mid + 1, end, eventData);
      }
    );
}
