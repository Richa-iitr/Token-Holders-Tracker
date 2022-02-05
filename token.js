import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    process.env.INFURA_KEY
  )
);
const ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "address", name: "implementation_", type: "address" },
      { internalType: "uint256", name: "initialSupply_", type: "uint256" },
      {
        internalType: "uint256",
        name: "mintingAllowedAfter_",
        type: "uint256",
      },
      { internalType: "bool", name: "transferPaused_", type: "bool" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "oldName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newName",
        type: "string",
      },
    ],
    name: "ChangedName",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "oldSybmol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newSybmol",
        type: "string",
      },
    ],
    name: "ChangedSymbol",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "fromDelegate",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toDelegate",
        type: "address",
      },
    ],
    name: "DelegateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
    ],
    name: "DelegateVotesChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldMinter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newMinter",
        type: "address",
      },
    ],
    name: "MinterChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldImplementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "NewImplementation",
    type: "event",
  },
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
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "minter",
        type: "address",
      },
    ],
    name: "TransferPaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "minter",
        type: "address",
      },
    ],
    name: "TransferUnpaused",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [
      { internalType: "address", name: "implementation_", type: "address" },
    ],
    name: "_setImplementation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "instaIndex",
    outputs: [
      { internalType: "contract IndexInterface", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
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
  for (let i = 12100000; i < blockNumber; i += 10000) {
    console.log(i, j);
    await getEvents(j, i, map);
    j = i;
  }
  console.log(map);
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
      console.log(events);
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
