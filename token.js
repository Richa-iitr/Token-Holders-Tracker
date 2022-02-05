import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/67b5c4101fcd46dda47de2384c0c97e1"
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
let map = new Map();

await getResult();
async function getResult() {
  let j = 0;
  // i - the block on which the first event got emitted for INST transfer
  // used loop coz infurna gives error if the number of logs are more then 10k
  for (let i = 12100000; i < blockNumber; i += 10000) {
    await getEvents(j, i, map);
    j = i;
  }
  let array = [];
  //   console.log(map);
  map.forEach((k, v) => {
    array.push({ address: v, amount: new BigNumber(k) });
  });
  array = array.sort((a, b) => (a.amount.gt(b.amount) ? 1 : -1));
  for (let i = array.length - 1; i >= array.length - 15; i--) {
    console.log(
      `Holder Number ${array.length - i}: Address[${
        array[i].address
      }] with Amount - ${array[i].amount.toFixed(0)} `
    );
  }
}

async function getEvents(start, end, map) {
  let options = {
    fromBlock: start,
    toBlock: end,
  };

  await contract.getPastEvents(
    "Transfer",
    options,
    async function (error, events) {
      if (events) {
        for (let obj of events) {
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
      }
    }
  );
}
