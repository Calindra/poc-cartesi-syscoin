// // We require the Hardhat Runtime Environment explicitly here. This is optional
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // When running the script with `npx hardhat run <script>` you'll find the Hardhat
// // Runtime Environment's members available in the global scope.
// import { ethers } from "hardhat";

// async function main() {
//   // Hardhat always runs the compile task when running scripts with its command
//   // line interface.
//   //
//   // If this script is run directly using `node` you may want to call compile
//   // manually to make sure everything is compiled
//   // await hre.run('compile');
//   const l2BatchInboxAddress = '0xD5bFeBDce5c91413E41cc7B24C8402c59A344f7c'
//   const l2MethodABI = {
//     abi: [{
//       "inputs": [
//         {
//           "internalType": "bytes32[]",
//           "name": "_versionHashes",
//           "type": "bytes32[]"
//         }
//       ],
//       "name": "appendSequencerBatchFromL1",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     }]
//   }

//   // We get the contract to deploy
//   const BatchInbox = await ethers.getContractFactory("BatchInbox");
//   const hash = `0x06310294ee0af7f1ae4c8e19fa509264565fa82ba8c82a7a9074b2abf12a15d9`
//   const dappAddress = `0x71ab24ee3ddB97Dc01A161EdF64c8d51102b0cd3`
//   const daContractAddress = '0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485' // with events
//   const l1BatchInboxAddress = '0x3F4bCbD178399aEA9cc0f33ca952F91E1ACB31d0'
//   const batchInbox = BatchInbox.attach(l1BatchInboxAddress)
//   const options = {
//     gasLimit: 5000000 // Specify your desired gas limit here
//   };

//   const contract = new ethers.Contract(l1BatchInboxAddress, l2MethodABI.abi, ethers.provider)
//   // const selector = ethers.Contract
//   const res = await batchInbox.appendSequencerBatchToL2(l2BatchInboxAddress, selector, )
//   console.log(res)
//   const rec = await res.wait()
//   console.log(rec)
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

const { ethers } = require("hardhat");
const { getFunctionSelector } = require('viem')

async function callAppendSequencerBatchToL2() {
  const options = {
    gasLimit: 5000000 // Specify your desired gas limit here
  };
  const l2BatchInboxAddress = '0xD5bFeBDce5c91413E41cc7B24C8402c59A344f7c'
  // Load the contract ABI (interface)
  const abi = [
    // Include the function signature
    "function appendSequencerBatchToL2(address _target, bytes calldata _selector, bytes32[] calldata _versionHashes) external"
  ];
  console.log(getFunctionSelector(abi[0]))
  const l1BatchInboxAddress = '0x3F4bCbD178399aEA9cc0f33ca952F91E1ACB31d0'
  // Contract address
  const contractAddress = l1BatchInboxAddress;

  // Connect to the Ethereum network and get a signer
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.tanenbaum.io");
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  let signer = new ethers.Wallet(privateKey, provider);

  // Get the balance of the native token (Ether)
  const balance = await provider.getBalance(signer.address);

  // Convert the balance from BigNumber to Ether
  const etherBalance = ethers.utils.formatEther(balance);
  console.log({ etherBalance })

  // Instantiate the contract with the ABI and signer
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Call the function
  const targetAddress = l2BatchInboxAddress; // The address to pass as _target
  const selector = "0x5e2ff598"; // The selector to pass as _selector
  const versionHashes = ["0xeae339162341eb719e652bd397df8666efe952e2f06dfd42cde5a58b083fab2d"]; // An array of version hashes to pass as _versionHashes

  // Call the function
  await contract.appendSequencerBatchToL2(targetAddress, selector, versionHashes, options);

  console.log("Function called successfully.");
}

callAppendSequencerBatchToL2().catch(error => {
  console.error("Error calling function:", error);
});
