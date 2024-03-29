# Learn Hardhat

Projeto exploratório para entender as possibilidades do solidity.

# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/sample-script.ts
```

```shell
npx hardhat run --network rollux_testnet scripts/deploy.ts
```

Output:

```shell
Downloading compiler 0.8.4
Generating typings for: 3 artifacts in dir: typechain for target: ethers-v5
Successfully generated 9 typings!
Compiled 1 Solidity file successfully (evm target: istanbul).
DAContract deployed to: 0x9D3DA37d36BB0B825CD319ed129c2872b893f538
```

```shell
npx hardhat run --network rollux_testnet scripts/deployFakeL2BatchInbox.ts

No need to generate any newer typings.
L2BatchInbox deployed to: 0x687bB6c57915aa2529EfC7D2a26668855e022fAE
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

## Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).

## Deployed

```shell
npm run deploy:L2BatchInbox

> learn-hardhat@1.0.0 deploy:L2BatchInbox
> hardhat run --network rollux_testnet scripts/deployL2BatchInbox.ts

No need to generate any newer typings.
L2BatchInbox deployed to: 0xD5bFeBDce5c91413E41cc7B24C8402c59A344f7c
```

```shell
npm run sendSyscoinTestnet
```

L1 transaction:
[tx](https://tanenbaum.io/tx/0x99f041dc05b9d882f679b8ad8ed14b4916dd6b0fe4e19511d0c9c621557dfc47)
