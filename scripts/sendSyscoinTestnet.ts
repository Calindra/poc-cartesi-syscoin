// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const l2MethodABI = {
    abi: [{
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "_versionHashes",
          "type": "bytes32[]"
        }
      ],
      "name": "appendSequencerBatchFromL1",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }]
  }

  // We get the contract to deploy
  const BatchInbox = await ethers.getContractFactory("BatchInbox");
  const hash = `0x06310294ee0af7f1ae4c8e19fa509264565fa82ba8c82a7a9074b2abf12a15d9`
  const dappAddress = `0x71ab24ee3ddB97Dc01A161EdF64c8d51102b0cd3`
  const daContractAddress = '0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485' // with events
  const l1BatchInboxAddress = '0x3F4bCbD178399aEA9cc0f33ca952F91E1ACB31d0'
  const batchInbox = BatchInbox.attach(l1BatchInboxAddress)
  const options = {
    gasLimit: 5000000 // Specify your desired gas limit here
  };

  const res = await batchInbox.appendSequencerBatchToL2(daContractAddress, hash, options)
  console.log(res)
  const rec = await res.wait()
  console.log(rec)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
