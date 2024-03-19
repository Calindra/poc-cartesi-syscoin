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

  // We get the contract to deploy
  const DAContract = await ethers.getContractFactory("DAContract");

  const hash = `0x3f57aba5d95da7d40bcd9f19f1e559851cd9d4f5f537c7226e7e11dab804db9e`
  const dappAddress = `0x71ab24ee3ddB97Dc01A161EdF64c8d51102b0cd3`
  const daContractAddress = `0x9D3DA37d36BB0B825CD319ed129c2872b893f538`
  const contractInstance = DAContract.attach(daContractAddress)
  const options = {
    gasLimit: 5000000 // Specify your desired gas limit here
  };
  const res = await contractInstance.sendDataHash(dappAddress, hash, options)
  console.log(res)
  // DAContract.connect()
  // const batchInboxAddress = '0x4200000000000000000000000000000000000010'
  // const inputBoxAddress = '0xB572d5C134C0071ceF9B845E8CbDa56Bb39110bE'
  // const daContract = await DAContract.deploy(batchInboxAddress, inputBoxAddress);

  // await daContract.deployed();

  // console.log("DAContract deployed to:", daContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
