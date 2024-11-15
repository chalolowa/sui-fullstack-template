import "dotenv/config"

import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { fromB64 } from "@mysten/sui.js/utils"
import { SuiClient } from "@mysten/sui.js/client"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { execSync } from "child_process"
import path, { dirname} from "path"
import { fileURLToPath } from "url"

const private_key = process.env.PRIVATE_KEY;
if (!private_key) {
  throw new Error("PRIVATE_KEY is not defined");
}

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(private_key).slice(1)
);
const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });

const path_to_contracts = path.join(dirname(fileURLToPath(import.meta.url)), "../../contracts");

console.log("Building contracts...");
const { dependencies, modules } = JSON.parse(execSync(
  `sui move build --dump-bytecode-as-base64 --path ${path_to_contracts}`,
  { encoding: "utf8" }
))

console.log("Deploying contracts...");
console.log(`Deploying from ${keypair.toSuiAddress()}`)

const deploy_trx = new TransactionBlock();
const [upgrade_cap] = deploy_trx.publish({
  modules,
  dependencies,
});
deploy_trx.transferObjects([upgrade_cap], deploy_trx.pure(keypair.toSuiAddress()))

const { objectChanges, balanceChanges } = await client.signAndExecuteTransactionBlock({
  transactionBlock: deploy_trx,
  signer: keypair,
  options: {
    showEffects: true,
    showObjectChanges: true,
    showBalanceChanges: true,
    showEvents: true,
    showInput: false,
    showRawInput: false
  },
})

console.log(objectChanges, balanceChanges);

const parse_cost = (amount: string) => Math.abs(parseInt(amount)/1_000_000_000);

if (balanceChanges) {
  console.log("Cost to deploy:", parse_cost(balanceChanges[0].amount), "SUI");
}
