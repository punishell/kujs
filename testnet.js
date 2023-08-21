import { tx, registry } from "kujira.js";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmWasmClient,  SigningCosmWasmClient} from "@cosmjs/cosmwasm-stargate";
import { coins, SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { readFileSync } from 'fs';


// let stargate2 = require("@cosmjs/cosmwasm-stargate");

const RPC_ENDPOINT = "https://kujira-testnet-rpc.polkachu.com";


const MNEMONIC = "...";

const signer = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
  prefix: "kujira",
});

const [account] = await signer.getAccounts();

const client = await SigningStargateClient.connectWithSigner(
  RPC_ENDPOINT,
  signer,
  {
    registry,
    gasPrice: GasPrice.fromString("0.00125ukuji"),
  }
);


function getId(result){
  const log = JSON.parse(result.rawLog);
  let codeId = null;

  for (const event of log[0].events) {
    if (event.type === 'store_code') {
      for (const attribute of event.attributes) {
        if (attribute.key === 'code_id') {
          codeId = attribute.value;
          break;
        }
      }
    }
    if (codeId) break;
  }

  return codeId
}

const query_client = await SigningCosmWasmClient.connectWithSigner(RPC_ENDPOINT, signer, {
  registry,
  gasPrice: GasPrice.fromString("0.00125ukuji"),
})

///Upload contract
const ghost_wasm = await readFileSync('/../ghost.wasm');
const ghost_msg = tx.wasm.msgStoreCode({sender: account.address,wasm_byte_code:ghost_wasm });
console.log(ghost_msg)
const ghost_upload_result = await client.signAndBroadcast(account.address, [ghost_msg], "auto");
console.log(ghost_upload_result) 


 let ghost_id = getId(ghost_upload_result);


console.log(ghost_id)


const instantiate_ghos = tx.wasm.msgInstantiateContract({
  sender: account.address, 
  admin: account.address, 
  code_id: ghost_id, 
  label:"ghost", 
  msg:Buffer.from(JSON.stringify({ owner: account.address}))
})
const instantiate_result = await client.signAndBroadcast(account.address, [instantiate_ghos], "auto");


const log1 = JSON.parse(instantiate_result.rawLog);
let ghost_addr = null;

for (const event of log1[0].events) {
  if (event.type === 'instantiate') {
    for (const attribute of event.attributes) {
      if (attribute.key === '_contract_address') {
        ghost_addr = attribute.value;
        break;
      }
    }
  }
  if (ghost_addr) break;
}

console.log(ghost_addr); 


const demo_denom = "factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo"

// // DEPOSIT TO GHOST
let msg_deposit = tx.wasm.msgExecuteContract({
  sender: account.address,
  contract: ghost_addr,
  msg: Buffer.from(JSON.stringify({ execute:{deposit: {debt_denom: "factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk" } }})),

  funds: coins(4930092, demo_denom),
});
console.log(await client.signAndBroadcast(account.address, [msg_deposit], "auto"));


let query_result = await query_client.queryContractSmart(addr,{config:{}});

console.log(query_result)
