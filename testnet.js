// import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
let protoSigning = require("@cosmjs/proto-signing");

// import { assertIsBroadcastTxSuccess, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
let stargate = require("@cosmjs/cosmwasm-stargate");
let fs = require("fs");


(async function() {
const rpcEndpoint = "https://test-rpc-kujira.mintthemoon.xyz/";


//alice
const alice_mnemonic = "unfold donate hazard vital behind still beyond carbon eagle budget plate federal";
const alice_wallet = await protoSigning.DirectSecp256k1HdWallet.fromMnemonic(alice_mnemonic,{prefix: 'kujira'});
const alice = await alice_wallet.getAccounts();
const alice_clientOption = {
  gasPrice: {
    // roadcastTimeoutMs: 60 * 1000,
    amount: '1',
    denom: 'ukuji'
  }
}
const alice_client = await stargate.SigningCosmWasmClient.connectWithSigner(rpcEndpoint, alice_wallet,alice_clientOption);

// alice_client.chainId = 'harpoon-4';

console.log("Alice:");
console.log(alice[0].address);

console.log(await alice_client.getChainId());
console.log(await alice_client.getBalance(alice[0].address,"ukuji"));

offer_addr="kujira1h7g5u3lr5j74hcsfrrls4anauv7u72a94cppyscl32rqm5lzz7psu4438v";
trade_addr = "kujira13lg50j2hak2quzax2xvt6sjk6j7s73ljzvvrv95cjjcur95z62cstl3qqj"



console.log('update TRADE as: ' + alice[0].address);
const fund_trade_result = await alice_client.execute(alice[0].address, offer_addr, {
  "update_offer": {
    "offer_update": {
      "id": "102_28",
      "state": "active",
      "rate": "102",
      "min_amount": "10000000",
      "max_amount": "200000000",
      "description": "TBA"
    }
  }
},"auto",undefined)

console.log(JSON.stringify(fund_trade_result));

})();


