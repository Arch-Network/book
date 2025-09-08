# Getting Started with the TypeScript SDK

This guide will walk you through setting up and using the Arch Network TypeScript SDK (developed by Saturn) to build your first application.

> **Note**: The Arch TypeScript SDK is a low-level SDK that provides direct RPC access to Arch nodes. It does not include high-level abstractions like transaction builders or wallet management.

## Prerequisites

- **Node.js 16+** and npm or yarn
- **Basic understanding** of blockchain concepts and JavaScript/TypeScript
- **Arch Network node** running locally or access to a remote node

## Installation

### Create a New Project

```bash
# Create a new project
mkdir my-arch-app
cd my-arch-app
npm init -y

# Install the Saturn TypeScript SDK
npm install @saturnbtcio/arch-sdk

# Install TypeScript (optional but recommended)
npm install -D typescript @types/node
npx tsc --init
```

### For Existing Projects

```bash
# Using npm
npm install @saturnbtcio/arch-sdk

# Using yarn
yarn add @saturnbtcio/arch-sdk

# Using pnpm
pnpm add @saturnbtcio/arch-sdk
```

## Your First Connection

Create a file named `connect.ts` (or `connect.js` for JavaScript):

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function main() {
  // Connect to local validator
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    console.log('🔌 Connecting to Arch node at http://localhost:9002...\n');
    
    // Get current block count
    const blockCount = await connection.getBlockCount();
    console.log('✓ Current block count:', blockCount);
    
    // Get best block hash
    const bestBlockHash = await connection.getBestBlockHash();
    console.log('✓ Best block hash:', bestBlockHash);
    
    // Get block hash for a specific height
    if (blockCount > 0) {
      const blockHeight = blockCount - 1;
      const blockHash = await connection.getBlockHash(blockHeight);
      console.log(`✓ Block hash at height ${blockHeight}:`, blockHash);
    }
    
    console.log('\n✅ Successfully connected to Arch node!');
    console.log('📊 Network is active with', blockCount, 'blocks');
    
  } catch (error) {
    console.error('❌ Error connecting to Arch node:', error);
    console.log('\n💡 Make sure your Arch node is running at http://localhost:9002');
    console.log('   You can start it with: arch-node --network=testnet');
  }
}

// Run the main function
main().catch(console.error);
```

Run the script:
```bash
# TypeScript
npx ts-node connect.ts

# JavaScript
node connect.js
```

Example output:
```text
Connecting to Arch node at http://localhost:9002...

✓ Current block count: 57230
✓ Best block hash: 349e8a42cdc98d05d427ba8fe8efcfd13e875591f1f1f111960a991f3add8105
✓ Block hash at height 57229: 349e8a42cdc98d05d427ba8fe8efcfd13e875591f1f1f111960a991f3add8105

✅ Successfully connected to Arch node!
📊 Network is active with 57230 blocks
```

## Creating Accounts

The SDK provides utilities for creating accounts using secp256k1 cryptography:

```typescript
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

async function createAccount() {
  const connection = new RpcConnection('http://localhost:9002');
  const arch = ArchConnection(connection);
  
  // Create a new account
  const account = await arch.createNewAccount();
  
  console.log('🔑 New Account Created:');
  console.log('Private Key:', account.privkey);
  console.log('Public Key:', account.pubkey);
  console.log('Address:', account.address);
  
  return account;
}

createAccount().catch(console.error);
```

### Create Account with Faucet Funding

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';
import { randomBytes } from 'node:crypto';

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createAndFundAccount() {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    console.log('🔌 Connecting to Arch node...\n');
    
    // Check the current block height
    const initialBlockCount = await connection.getBlockCount();
    console.log('📊 Current block height:', initialBlockCount);
    
    // Generate a random 32-byte public key
    const pubkey = randomBytes(32);
    console.log('🔑 Generated public key:', pubkey.toString('hex'));
    
    // Create account with faucet
    console.log('\n💰 Step 1: Creating account with faucet...');
    await connection.createAccountWithFaucet(pubkey);
    console.log('✅ Faucet account creation initiated');
    
    // Get the Arch address
    const archAddress = await connection.getAccountAddress(pubkey);
    console.log('📍 Arch address:', archAddress);
    
    // Request airdrop to fund the account
    console.log('\n💰 Step 2: Requesting airdrop...');
    await connection.requestAirdrop(pubkey);
    console.log('✅ Airdrop requested');
    
    // Wait for account to be created and funded
    console.log('\n⏳ Waiting for account to be confirmed on chain...');
    console.log('   (This may take 5-10 seconds)');
    
    let accountFound = false;
    const maxAttempts = 6;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const waitTime = attempt * 2000; // Increase wait time each attempt
      console.log(`\n🔄 Attempt ${attempt}/${maxAttempts}: Waiting ${waitTime / 1000} seconds...`);
      await wait(waitTime);
      
      // Check block progress
      const currentBlockCount = await connection.getBlockCount();
      console.log(`📈 Blocks produced: ${currentBlockCount - initialBlockCount}`);
      
      try {
        const accountInfo = await connection.readAccountInfo(pubkey);
        console.log('\n✅ Account successfully created and funded!');
        console.log('\n📊 Account Details:');
        console.log('   Address:', archAddress);
        console.log('   Full info:', JSON.stringify(accountInfo, null, 2));
        
        // Access properties safely
        const info = accountInfo as any;
        if (info.lamports !== undefined) {
          console.log('   Balance:', info.lamports, 'lamports');
        }
        if (info.owner) {
          console.log('   Owner:', Buffer.from(Object.values(info.owner)).toString('hex'));
        }
        if (info.utxo) {
          console.log('   UTXO:', info.utxo);
        }
        if (info.is_executable !== undefined) {
          console.log('   Executable:', info.is_executable);
        }
        
        accountFound = true;
        break;
      } catch (error) {
        if (attempt === maxAttempts) {
          console.log('❌ Account not found after maximum attempts');
        } else {
          console.log('⏳ Account not ready yet, continuing to wait...');
        }
      }
    }
    
    if (accountFound) {
      console.log('\n🎉 Success! Your Arch account is ready to use.');
      console.log('💡 You can now:');
      console.log('   - Send transactions from this account');
      console.log('   - Interact with Arch programs');
      console.log('   - Deploy smart contracts');
      console.log('\n📝 Save these for future reference:');
      console.log('   Pubkey:', pubkey.toString('hex'));
      console.log('   Address:', archAddress);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Make sure your Arch node is running at http://localhost:9002');
    console.log('   - Ensure the node has faucet functionality enabled');
    console.log('   - Check that the node is syncing and producing blocks');
  }
}

createAndFundAccount();
```

## Reading Account Information

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function readAccount() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Example: System program pubkey (32 zero bytes with last byte as 1)
  const systemProgramPubkey = new Uint8Array(32);
  systemProgramPubkey[31] = 1;
  
  try {
    const accountInfo = await connection.readAccountInfo(systemProgramPubkey);
    console.log('Account Info:', accountInfo);
    
    // Get account address
    const address = await connection.getAccountAddress(systemProgramPubkey);
    console.log('Account Address:', address);
  } catch (error) {
    console.error('Error reading account:', error);
  }
}
```

## Working with Messages and Instructions

The SDK uses a low-level message format for transactions:

```typescript
import { RpcConnection, InstructionUtil, MessageUtil, PubkeyUtil } from '@saturnbtcio/arch-sdk';
import type { Message, Instruction } from '@saturnbtcio/arch-sdk';

// Create a simple instruction
const instruction: Instruction = {
  program_id: PubkeyUtil.systemProgram(), // Returns system program pubkey
  accounts: [
    {
      pubkey: new Uint8Array(32), // Your account pubkey
      is_signer: true,
      is_writable: true,
    },
  ],
  data: new Uint8Array([1, 2, 3, 4]), // Instruction data
};

// Create a message
const message: Message = {
  signers: [new Uint8Array(32)], // Array of signer pubkeys
  instructions: [instruction],
};

// Serialize the message for sending
const serializedMessage = MessageUtil.serialize(message);
console.log('Serialized message:', serializedMessage);
```

## Sending Transactions

To send transactions, you need to create a `RuntimeTransaction`:

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';
import type { RuntimeTransaction, SanitizedMessage } from '@saturnbtcio/arch-sdk';

async function sendTransaction() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Note: Creating valid transactions requires proper message construction
  // and cryptographic signatures. This is a simplified example.
  
  const sanitizedMessage: SanitizedMessage = {
    header: {
      num_required_signatures: 1,
      num_readonly_signed_accounts: 0,
      num_readonly_unsigned_accounts: 0,
    },
    account_keys: [
      new Uint8Array(32), // Signer pubkey
      PubkeyUtil.systemProgram(), // System program
    ],
    recent_blockhash: new Uint8Array(32), // Recent blockhash
    instructions: [
      {
        program_id_index: 1, // Index into account_keys
        accounts: [0], // Indexes into account_keys
        data: new Uint8Array([1, 2, 3, 4]),
      },
    ],
  };
  
  const transaction: RuntimeTransaction = {
    version: 0,
    signatures: [new Uint8Array(64)], // 64-byte signatures
    message: sanitizedMessage,
  };
  
  try {
    const txId = await connection.sendTransaction(transaction);
    console.log('Transaction sent:', txId);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}
```

## Querying Blocks

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function queryBlocks() {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    // Get the latest block
    const bestBlockHash = await connection.getBestBlockHash();
    const block = await connection.getBlock(bestBlockHash);
    
    if (block) {
      console.log('Block:', block);
      console.log('Number of transactions:', block.transactions?.length || 0);
    }
  } catch (error) {
    console.error('Error querying blocks:', error);
  }
}
```

## Get Processed Transaction

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function getTransaction(txId: string) {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    const processedTx = await connection.getProcessedTransaction(txId);
    
    if (processedTx) {
      console.log('Transaction found:', processedTx);
      console.log('Status:', processedTx.status);
    } else {
      console.log('Transaction not found');
    }
  } catch (error) {
    console.error('Error getting transaction:', error);
  }
}
```

## Get Program Accounts

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function getProgramAccounts() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Example: Get all accounts owned by a program
  const programId = new Uint8Array(32); // Your program ID
  
  try {
    const accounts = await connection.getProgramAccounts(programId);
    console.log(`Found ${accounts.length} accounts for program`);
    
    accounts.forEach((account, index) => {
      console.log(`Account ${index}:`, account);
    });
  } catch (error) {
    console.error('Error getting program accounts:', error);
  }
}
```

## Utility Functions

The SDK provides several utility modules for working with Arch data structures:

```typescript
import { 
  PubkeyUtil,
  MessageUtil,
  InstructionUtil,
  AccountUtil,
  SignatureUtil 
} from '@saturnbtcio/arch-sdk';

// Get system program pubkey
const systemProgram = PubkeyUtil.systemProgram();

// Work with public keys
const pubkeyBytes = new Uint8Array(32);
const pubkeyHex = PubkeyUtil.toHex(pubkeyBytes);
const pubkeyFromHex = PubkeyUtil.fromHex(pubkeyHex);

// Serialize/deserialize messages
const serializedMsg = MessageUtil.serialize(message);
const deserializedMsg = MessageUtil.deserialize(serializedMsg);
```

## Error Handling

The SDK provides custom error types:

```typescript
import { RpcConnection, ArchRpcError } from '@saturnbtcio/arch-sdk';

async function handleErrors() {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    await connection.getBlock('invalid-hash');
  } catch (error) {
    if (error instanceof ArchRpcError) {
      console.error('RPC Error:', error.error);
      console.error('Error code:', error.error.code);
      console.error('Error message:', error.error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Complete Example

Here's a complete example showing how to connect and query the network:

```typescript
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

async function completeExample() {
  // 1. Setup connection
  const connection = new RpcConnection('http://localhost:9002');
  const arch = ArchConnection(connection);
  
  try {
    // 2. Get network info
    console.log('📊 Network Information:');
    const blockCount = await connection.getBlockCount();
    console.log('Block count:', blockCount);
    
    const bestBlockHash = await connection.getBestBlockHash();
    console.log('Best block hash:', bestBlockHash);
    
    // 3. Create a new account
    console.log('\n🔑 Creating new account...');
    const account = await arch.createNewAccount();
    console.log('Address:', account.address);
    
    // 4. Get block information
    if (blockCount > 0) {
      const blockHash = await connection.getBlockHash(blockCount - 1);
      const block = await connection.getBlock(blockHash);
      
      if (block) {
        console.log('\n📦 Latest block:');
        console.log('Hash:', blockHash);
        console.log('Transactions:', block.transactions?.length || 0);
      }
    }
    
    console.log('\n✅ Example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

completeExample().catch(console.error);
```

## Important Notes

1. **Low-Level SDK**: This SDK provides low-level RPC access. High-level features like transaction building, wallet management, and program deployment helpers are not included.

2. **Message Construction**: Creating valid transactions requires proper understanding of Arch's message format and cryptographic signatures.

3. **Type Safety**: The SDK is written in TypeScript and provides type definitions for all data structures.

4. **Error Handling**: Always wrap RPC calls in try-catch blocks as network operations can fail.

## Next Steps

- Learn about [Arch's account model](../account.md)
- Understand [message and instruction formats](../instructions-and-messages.md)
- Explore the [RPC API](../../rpc/rpc.md) for all available methods
- Check the [TypeScript SDK source](https://github.com/saturnbtc/arch-typescript-sdk) for implementation details

## Resources

- **NPM Package**: [@saturnbtcio/arch-sdk](https://www.npmjs.com/package/@saturnbtcio/arch-sdk)
- **GitHub Repository**: [saturnbtc/arch-typescript-sdk](https://github.com/saturnbtc/arch-typescript-sdk)
- **Discord**: [Arch Network Discord](https://discord.gg/archnetwork) 