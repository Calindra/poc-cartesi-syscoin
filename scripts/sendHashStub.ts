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

  const options = {
    gasLimit: 5000000 // Specify your desired gas limit here
  };

  const stubL2BatchInboxAddress = `0x687bB6c57915aa2529EfC7D2a26668855e022fAE`
  // const correctL2BatchInboxAddress = '0x4200000000000000000000000000000000000010'

  // const daContractAddress = `0x9D3DA37d36BB0B825CD319ed129c2872b893f538`
  const daContractAddress = '0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485' // with events

  const L2BatchInbox = await ethers.getContractFactory("L2BatchInbox");
  const l2BatchInstance = L2BatchInbox.attach(stubL2BatchInboxAddress)
  const tx = await l2BatchInstance.addToPodaMap("podaValue", options);
  await tx.wait()
  console.log(tx)

  // if (tx) return
  // We get the contract to deploy
  const DAContract = await ethers.getContractFactory("DAContract");

  // const hash = `0x3f57aba5d95da7d40bcd9f19f1e559851cd9d4f5f537c7226e7e11dab804db9e`
  // const hash = `0x06310294ee0af7f1ae4c8e19fa509264565fa82ba8c82a7a9074b2abf12a15d9`

  const hash = `0xe1384435bca25dc100272f0b8bb6088489db19923c50639565ba564ccc13b85f`
  const dappAddress = `0x71ab24ee3ddB97Dc01A161EdF64c8d51102b0cd3`
  
  const contractInstance = DAContract.attach(daContractAddress)
  
  const filter = contractInstance.filters.StartSendDataHashCall()
  contractInstance.on(filter, (...args) => {
    console.log('Event', args)
  })

  
  const changeAddressTx = await contractInstance.setBatchInboxAddress(stubL2BatchInboxAddress, options)
  await changeAddressTx.wait()
  console.log('address changed')
  const res = await contractInstance.sendDataHash(dappAddress, hash, options)
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
