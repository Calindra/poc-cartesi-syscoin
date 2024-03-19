import { defineConfig } from "@wagmi/cli";
import { getContractDefinition, predeploys } from "@eth-optimism/contracts";
// const rolluxL2BatchInboxURL = new URL(
//   "https://raw.githubusercontent.com/SYS-Labs/rollux/develop/packages/contracts-bedrock/deployments/rollux-mainnet/L2BatchInbox.json"
// );
//
const batchInbox = getContractDefinition("L2BatchInbox");

export default defineConfig({
  out: "src/rollups.ts",
  contracts: [{ name: "rollux", abi: batchInbox.abi }],
});
