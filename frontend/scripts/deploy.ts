import "dotenv/config"

import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { fromB64 } from "@mysten/sui.js/utils"
import { SuiClient } from "@mysten/sui.js/client"

const private_key = process.env.PRIVATE_KEY;
if (!private_key) {
  throw new Error("PRIVATE_KEY is not defined");
  process.exit(1);
}

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(private_key).slice(1)
);
const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });