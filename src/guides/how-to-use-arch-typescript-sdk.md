# How to use the Arch TypeScript SDK

This guide walks through how to use the Saturn [Arch SDK] to connect with Arch RPC and communicate with Arch deployed programs.

Table of Contents:
- [Description]
- [Installation]
- [Logic]
- [Implementation]
---

### Description
An open-source typescript library for communicating with the Arch Network (RPC).

The source code can be found within the [arch-typescript-sdk] repo.

### Installation
```bash
'npm i -g @saturnbtcio/arch-sdk'
```

### Logic

```typescript
import express from 'express';
import { RpcConnection, MessageUtil, PubkeyUtil } from '@saturnbtcio/arch-sdk';
import * as borsh from 'borsh';
import Bitcoin from 'bitcoinjs-lib';
// import { ECPairFactory } from 'bitcoinjs-lib/src/ecpair';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import cors from 'cors';
import { hexToBytes } from '@noble/hashes/utils';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

const ECPair = ECPairFactory(ecc);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
Bitcoin.initEccLib(ecc);

const client = new RpcConnection("http://rpc-01.test.arch.network");
const PRIVATE_KEY = process.env.ARCH_PRIVATE_KEY;

const SwapInscriptionRuneSchema = {
  struct: {
    inscription_txid: 'string',
    inscription_vout: 'u8',
    user_swap_psbt: { array: { type: 'u8' } }
  }
}

const sendData = async () => {
    try {
      const inscriptionUtxo = {
        txid: "f4abb75e0332db56a2692090d0997d26acc3fad3da255c4ed0aee00d018d0e4a",
        vout: 0,
        value: 330,
      };
  
      const signedPSBT = "70736274ff0100fd22010200000002050c744048ecb622eb4b151288f9d028a49c27bbfbbd387b6f9da53936cf67a90000000000ffffffff66b18a5cb6d5c67e11a94f4a4d0d8b3c727dda0e1f918f2cfd91e19177a4a61c0100000000ffffffff054a01000000000000225120437b4b5eee07f1e96da29d43fc7621ed77e922271620193f7be12c7bce54086f0000000000000000116a5d0e009e9e030ee807020000d8fc3c032202000000000000225120b5f7cb3d25a2b19d9d9fe56fa4ac31ad77e1efa47d047d0740617dbcecd6acf12202000000000000225120437b4b5eee07f1e96da29d43fc7621ed77e922271620193f7be12c7bce54086ff498070000000000225120437b4b5eee07f1e96da29d43fc7621ed77e922271620193f7be12c7bce54086f000000000001012b1027000000000000225120437b4b5eee07f1e96da29d43fc7621ed77e922271620193f7be12c7bce54086f010304810000000113412f3dcb1c018590b191e492cb3e9e1a3ce01572f66290757164076fa5c72574741b5b4e8f7f016a8bdf779d3452aa4b5c47681b2a61ccd22a12f2aee93545e97f810117206272fe4cf7746c9c3de3d48afc5f27fe4ba052fc8f72913a6020fa970f7f58230001012b20a1070000000000225120437b4b5eee07f1e96da29d43fc7621ed77e922271620193f7be12c7bce54086f01030481000000011341f54b672ef668e086b2c5dc99a0cb3e60a54117ffccc569335f2aa3caf4cd63eaecb38b9d7287fa52ce20a700e84db25efa37e5ec61f640fa1a8c0cb6d3a838f9810117206272fe4cf7746c9c3de3d48afc5f27fe4ba052fc8f72913a6020fa970f7f5823000000000000";
      const psbt = Bitcoin.Psbt.fromHex(signedPSBT);
      psbt.finalizeAllInputs();
      const transaction = psbt.extractTransaction();
      const rawTxHex = transaction.toHex();
  
      console.log("rawTxHex => ", rawTxHex);
  
      const hexData = hexToBytes(rawTxHex);
  
      const programPubkey = "14fd5c20f2d2dc718782435bee94901281abc9860c263fbffbd43bbde5673261";
  
      // Prepare the data to be sent
      const sendValue = {
        inscription_txid: inscriptionUtxo.txid,
        inscription_vout: inscriptionUtxo.vout,
        user_swap_psbt: hexData
      };
  
      const encoded = borsh.serialize(SwapInscriptionRuneSchema, sendValue);
      const instructionData = new Uint8Array(encoded.length + 1);
      instructionData[0] = 0;
      instructionData.set(encoded, 1);
  
      // Create the instruction with proper account structure
      const instruction = {
        program_id: PubkeyUtil.fromHex(programPubkey),
        accounts: [
          {
            pubkey: PubkeyUtil.fromHex(PRIVATE_KEY),
            is_signer: true,
            is_writable: false
          },
          {
            pubkey: PubkeyUtil.fromHex(programPubkey),
            is_signer: false,
            is_writable: true
          }
        ],
        data: instructionData,
      };
  
      // Create the message object
      const messageObj = {
        signers: [PubkeyUtil.fromHex(PRIVATE_KEY)],
        instructions: [instruction],
      };
  
      // Get message hash
      const messageHash = MessageUtil.hash(messageObj);
      console.log(`Message hash: ${messageHash.toString()}`);
  
      // Convert message hash to hex string for signing
      const messageHashHex = Buffer.from(messageHash).toString('hex');
      console.log(`Message hash hex: ${messageHashHex}`);
  
      // Sign the message hash
      const privateKeyBytes = Buffer.from(PRIVATE_KEY.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const keyPair = ECPair.fromPrivateKey(privateKeyBytes);
      const signature = keyPair.sign(messageHash);
      
      // Take last 64 bytes of signature
      const signatureBytes = new Uint8Array(signature);
      console.log(`Signature bytes: ${signatureBytes}`);
  
      // Send the transaction
      const result = await client.sendTransaction({
        version: 0,
        signatures: [signatureBytes],
        message: messageObj,
      });
  
      console.log("Transaction result:", result);
      return result;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        cause: error.cause?.message,
        stack: error.stack
      });
      throw error;
    }
  };

sendData();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add endpoint
app.post('/send-data', async (req, res) => {
  try {
    const result = await sendData();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Implementation


<!-- Internal -->
[Description]: #description
[Installation]: #installation
[Logic]: #logic
[Implementation]: #implementation

<!-- External -->
[arch-typescript-sdk]: https://github.com/saturnBTC/arch-typescript-sdk
