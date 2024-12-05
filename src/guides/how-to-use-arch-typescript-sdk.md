# How to use the Arch TypeScript SDK

This guide walks through how to use the Saturn [arch-typescript-sdk] to interact with a deployed [helloworld] program.

Table of Contents:
- [Description]
- [Installation]
- [Logic]
---

### Description
The [arch-typescript-sdk] is an open-source typescript library for communicating with the Arch Network RPC service.

The [helloworld] program is a simple program that accepts a string (representing a name) and through interpolation crafts a greeting message (`"Hello <name>"`) that is stored within a data [Account] and then anchored to Bitcoin.

If you haven't already read [How to write an Arch program], we recommend starting there to get a basic understanding of the [helloworld] program anatomy before going further.

## Setup

### Create project

Let's use the [arch-cli] to create a new project called [helloworld].

```bash
arch-cli project create --name helloworld
```

### Copy source code
We can copy the [helloworld] source code into our newly created project's `lib.rs` as well as update the `Cargo.toml` with the necessary dependencies.

> Note: We find the path to our newly created project by consulting the `config.toml` as set by the [arch-cli]; see [Getting started] for more information.

### Deploy the program
Now that the source code is copied and the dependencies are set, let's deploy the program.

> Note: Ensure that the local validator is running; see [Starting the stack] for more information.

We'll run the `deploy` subcommand with no flags, indicating that we wish to utilize the `development` configuration within our `config.toml` allowing us to communicate with our local validator as well as the Bitcoin regtest.

```bash
arch-cli deploy
```

Result:
```bash
Welcome to the Arch Network CLI
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
Deploying your Arch Network app...
Available folders to deploy:
  1. demo
  2. helloworld
Enter the number of the folder you want to deploy (or 'q' to quit): 2
Deploying from folder: "/Users/jr/Documents/ArchNetwork/projects/helloworld"
  ℹ Building program...
  ℹ Cargo.toml found at: /Users/jr/Documents/ArchNetwork/projects/helloworld/app/program/Cargo.toml
  ℹ Current working directory: /Users/jr/Documents/ArchNetwork/projects/helloworld/app/program
  ✓ Program built successfully
Select a key to use as the program key: helloworld
  ℹ Program ID: 771e88a4b46ce55f52fb8302f39495c82e4e8a74000408ed45a5374fe699ee42
Wallet RPC URI: bitcoin-node.dev.aws.archnetwork.xyz:18443/wallet/testwallet
Client connected: 5cafc39686499c95f715a770877d5862cdc6e91cebed8f4f1caaaa0040136ef5
  ✓ Wallet 'testwallet' is already loaded.
Network: regtest
Sending funds to address: bcrt1pq4lunzdm2s0qvx3j73879a6kl0ep05rk3kuvzddjh270ht048qys6mwc5x
  ✓ Transaction sent: c673ab5bf78e36d17b53087895e7aee81b8d8a0957b2eb7c14616b81df485c4b
⠈ ✓ Transaction confirmed with 7 confirmations                                                                                                                                                                                                    Creating program account...
    Deploying program transactions...
  ℹ Program directory: /Users/jr/Documents/ArchNetwork/projects/helloworld/app/program
  ℹ Looking for .so file in release directory: "/Users/jr/Documents/ArchNetwork/projects/helloworld/app/program/target/sbf-solana-solana/release"
  ℹ Found .so file at: "/Users/jr/Documents/ArchNetwork/projects/helloworld/app/program/target/sbf-solana-solana/release/sample.so"
 [00:00:01] Processing Deployment Transactions: [####################################################################################################] 10/10 (0s)                                                                                 Program transactions deployed successfully
    Making program executable...
    Transaction sent: 8118d39f2e4ed7db91feec6b5c3b634f8f042be89c90f44e0a514a6194c07dfd
    Program made executable successfully
  ✓ Program deployed successfully
  ✓ Wallet 'testwallet' unloaded successfully.
Your app has been deployed successfully!
  ℹ Program ID: 771e88a4b46ce55f52fb8302f39495c82e4e8a74000408ed45a5374fe699ee42
```

> Note: We'll want to copy the Program ID from the previous `arch-cli deploy` output as we'll need to reference this when communicating with the program with the [arch-typescript-sdk].

```bash
ℹ Program ID: 771e88a4b46ce55f52fb8302f39495c82e4e8a74000408ed45a5374fe699ee42
```

## Client-side interaction
Now that our setup is complete, meaning that the project is created, the validator is running, and the program has been successfully deployed, we can move on to the interaction phase.

Within our new project's directory, we find the aptly named `/frontend` directory which holds our client-side code.

### Install dependencies

We can now install the [arch-typescipt-sdk] as well as our additional dependencies.

```bash
npm i @saturnbtcio/arch-sdk borsh bitcoinjs-lib @noble/hashes/util tiny-secp256k1 ecpair dotenv buffer
```

### Logic

Now, we can walk through the logic of our client-side script for interacting with our deployed program.

There are 5 steps to interacting with a deployed program:
1. obtain utxo
2. craft instruction data
3. craft message data
4. craft transaction data
5. execute transaction

```typescript
import { RpcConnection, MessageUtil, PubkeyUtil } from '@saturnbtcio/arch-sdk'
import * as borsh from 'borsh';
import Bitcoin from 'bitcoinjs-lib';
import { hexToBytes } from '@noble/hashes/utils';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactor } from 'ecpair';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

// initialize ECPair factory using signature scheme: secp256k1
const ECPair = ECPairFactory(ecc);

// load .env
dotenv.config();

// init rpc connection
const client = new RpcConnection('localhost:9002');

// private key of our signing account
const PRIVATE_KEY = process.env.ARCH_PRIVATE_KEY;

// pubkey of our previously deployed program
const PROGRAM_PUBKEY = process.env.PROGRAM_PUBKEY;

// pubkey of our state account
const STATE_ACCOUNT_PUBKEY = process.env.STATE_ACCOUNT_PUBKEY;

// schema corresponding to our program struct: HelloWorldParams
const HelloWorldSchema = {
    struct: {
        name: 'string',
        tx_hex: 'string', // byte['u8', 36]
        utxo: 'string', // byte['u8', 36]
    }
}

const writeData = async () => {
    try {
        const helloWorldUtxo = {
            // obtain txid and use here for state anchor
            txid: "",
            vout: 0,
            value: 1, // in satoshis
        };

        // create psbt bytedata
        const signedPSBT = "";

        // craft partial-signed bitcoin transaction based on signed transaction
        const psbt = Bitcoin.Psbt.fromHex(signedPSBT);

        // lock inputs
        psbt.finalizeAllInputs();

        // obtain transaction data
        const psbtTransaction = psbt.extractTransaction();

        // convert transaction to raw tx hex
        const rawTxHex = psbtTransaction.toHex();

        console.log('rawTxHex: ', rawTxHex);

        // convert tx hex data to bytes
        const hexData = hexToBytes(rawTxHex);

        // prepare data to be sent within instruction
        const helloWorldPayload = {
            name: '',
            // UTXO for fees
            tx_hex: '',
            // UTXO for anchoring
            utxo: '',
        }

        // serialize payload data
        const encodedData = borsh.serialize(helloWorldPayload);

        // create instruction data with previously encoded payload data
        const instructionData = new Uint8Array(encodedData.length + 1);

        // set first element to 0, indicating no data
        instructionData[0] = 0

        // set second element to be encoded data; offset
        // represents array index
        instructionData.set(encodedData, 1);
    
        // create the instruction
        const instruction = {
            program_id: PubkeyUtil.fromHex(PROGRAM_PUBKEY),
            // load the accounts required for program invocation
            // 0: our signing account
            // 1: our program account
            // 2: our state account
            accounts: [
                {
                    pubkey: PubkeyUtil.fromHex(PRIVATE_KEY),
                    is_signer: true,
                    is_writable: false,
                },
                {
                    pubkey: PubkeyUtil.fromHex(PROGRAM_PUBKEY),
                    is_signer: false,
                    is_writable: true,
                },
                {
                    pubkey: PubkeyUtil.fromHex(STATE_ACCOUNT_PUBKEY),
                    is_signer: false,
                    is_writable: true,
                }
            ],
            data: instructionData,
        };

        // create the message object
        const messageObj = {
            // pass the array of signers needed for the instruction
            // in our case, a single signing account
            signers: [PubkeyUtil.fromHex(PRIVATE_KEY)],
            // pass the array of instructions possible for invocation
            // in our case, a single instruction
            instructions: [instruction],
        };

        // obtain the hash of our message object
        const messageHash = MessageUtil.hash(messageObj);
        console.log(`message hash: ${messageHash.toString()}`);

        // convert message hash to hex string for signing
        const messageHashHex = Buffer.from(messageHash).toString('hex');
        console.log(`message hash hex: ${messageHashHex}`);

        // convert our signer private key into bytes
        const privateKeyBytes = Buffer.from(PRIVATE_KEY.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        // derive keypair from the private key
        const keyPar = ECPair.fromPrivateKey(privateKeyBytes);

        // sign the message hash to generate a valid signature
        const signature = keyPair.sign(messageHash)

        // obtain last 64 bytes of signature
        const signatureBytes = new Uint8Array(signature);
        console.log(`signature bytes: ${signatureBytes}`);

        // construct transaction object
        const transaction = {
            version: 0,
            // pass the array of signatures required
            // in our case, only a single signature
            signatures: [signatureBytes],
            // our recently created message object containing our instruction
            message: messageObj,
        };

        // send the transaction
        // rpc call: `sendTransaction`
        const result = await client.sendTransaction(transaction);
        console.log("transaction result: ", result);
        return result;
    } catch (e) {
        console.error('error: ', {
            message: error.message,
            cause: error.cause?.message,
            stack: error.stack,
        });
        throw error;
    }
};

const readData = async () => {
    ...
    // TODO
    ...
};

// write to state
writeData();

// read from state
readData();
```

<!-- Internal -->
[Description]: #description
[Installation]: #installation
[Logic]: #logic
[Implementation]: #implementation
[Account]: ../program/account.md
[How to write an Arch program]: ./how-to-write-arch-program.md
[Getting started]: ../getting-started/setting-up-a-project.md#initialize
[Starting the stack]: ../getting-started/starting-stack.md#start-the-validator

<!-- External -->
[arch-typescript-sdk]: https://github.com/saturnBTC/arch-typescript-sdk
[helloworld]: https://github.com/Arch-Network/arch-examples/blob/main/examples/helloworld/program/src/lib.rs
[arch-cli]: https://github.com/arch-network/arch-cli
