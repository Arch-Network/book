# Getting Started with the Arch SDK

This guide will walk you through setting up and using the Arch SDK to build your first application on the Arch Network.

## Prerequisites

- **Node.js 16+** (for TypeScript/JavaScript)
- **Rust 1.70+** (for Rust development)
- **Basic understanding** of blockchain concepts
- **Arch Network node** running locally or access to a remote node

## Installation

### TypeScript/JavaScript

```bash
# Create a new project
mkdir my-arch-app
cd my-arch-app
npm init -y

# Install the SDK
npm install @saturnbtcio/arch-sdk

# Install TypeScript (optional but recommended)
npm install -D typescript @types/node
npx tsc --init
```

### Rust

```bash
# Create a new Rust project
cargo new my-arch-app --bin
cd my-arch-app

# Add the SDK to Cargo.toml
cat >> Cargo.toml << EOF
[dependencies]
arch_sdk = "0.1.0"
tokio = { version = "1.0", features = ["full"] }
EOF
```

## Your First Connection

### TypeScript Example

```typescript
import { Connection } from '@saturnbtcio/arch-sdk';

async function main() {
  // Connect to local validator
  const connection = new Connection('http://localhost:9002');
  
  // Check if node is ready
  const isReady = await connection.isNodeReady();
  console.log('Node ready:', isReady);
  
  // Get current block count
  const blockCount = await connection.getBlockCount();
  console.log('Current block count:', blockCount);
}

main().catch(console.error);
```

### Rust Example

```rust
use arch_sdk::Connection;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to local validator
    let connection = Connection::new("http://localhost:9002");
    
    // Check if node is ready
    let is_ready = connection.is_node_ready().await?;
    println!("Node ready: {}", is_ready);
    
    // Get current block count
    let block_count = connection.get_block_count().await?;
    println!("Current block count: {}", block_count);
    
    Ok(())
}
```

## Creating Your First Account

### Generate a Keypair

```typescript
import { Keypair } from '@saturnbtcio/arch-sdk';

// Generate a new keypair
const keypair = Keypair.generate();
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Private key:', keypair.secretKey);

// Or from existing secret key
const existingKeypair = Keypair.fromSecretKey(secretKeyBytes);
```

### Fund Your Account (Testnet/Devnet)

```typescript
// Request airdrop for testing
const airdropSignature = await connection.requestAirdrop(
  keypair.publicKey,
  1000000 // 1 SOL equivalent in lamports
);

// Wait for confirmation
await connection.confirmTransaction(airdropSignature);

// Check balance
const balance = await connection.getBalance(keypair.publicKey);
console.log('Balance:', balance);
```

## Reading Account Information

### Basic Account Info

```typescript
import { PublicKey } from '@saturnbtcio/arch-sdk';

const accountPubkey = new PublicKey('YourAccountAddress...');
const accountInfo = await connection.getAccountInfo(accountPubkey);

if (accountInfo) {
  console.log('Owner:', accountInfo.owner.toBase58());
  console.log('Lamports:', accountInfo.lamports);
  console.log('Data length:', accountInfo.data.length);
  console.log('Executable:', accountInfo.executable);
} else {
  console.log('Account not found');
}
```

### Query Multiple Accounts

```typescript
const accounts = await connection.getMultipleAccountsInfo([
  keypair1.publicKey,
  keypair2.publicKey,
  keypair3.publicKey
]);

accounts.forEach((account, index) => {
  if (account) {
    console.log(`Account ${index}: ${account.lamports} lamports`);
  } else {
    console.log(`Account ${index}: Not found`);
  }
});
```

## Your First Transaction

### Simple Transfer

```typescript
import { Transaction, SystemProgram } from '@saturnbtcio/arch-sdk';

async function transferLamports() {
  const recipient = Keypair.generate();
  
  // Create transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 1000000 // 1 SOL equivalent
  });
  
  // Create transaction
  const transaction = new Transaction()
    .add(transferInstruction);
  
  // Sign and send
  const signature = await connection.sendAndConfirmTransaction(
    transaction,
    [sender] // Signer array
  );
  
  console.log('Transaction signature:', signature);
}
```

### Create and Initialize Account

```typescript
async function createAccount() {
  const newAccount = Keypair.generate();
  
  // Create account instruction
  const createInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports: 1000000, // Rent-exempt amount
    space: 256,        // Account data size
    programId: myProgramId
  });
  
  // Create transaction
  const transaction = new Transaction()
    .add(createInstruction);
  
  // Sign with both payer and new account
  const signature = await connection.sendAndConfirmTransaction(
    transaction,
    [payer, newAccount]
  );
  
  console.log('Account created:', newAccount.publicKey.toBase58());
  console.log('Transaction:', signature);
}
```

## Working with Programs

### Deploy a Program

```typescript
import { BpfLoader } from '@saturnbtcio/arch-sdk';
import fs from 'fs';

async function deployProgram() {
  // Load program binary
  const programBinary = fs.readFileSync('path/to/your/program.so');
  
  // Deploy program
  const programId = await BpfLoader.deploy(
    connection,
    payer,
    programBinary
  );
  
  console.log('Program deployed:', programId.toBase58());
  return programId;
}
```

### Call a Program

```typescript
import { Instruction } from '@saturnbtcio/arch-sdk';

async function callProgram() {
  // Create instruction for your program
  const instruction = new Instruction({
    programId: myProgramId,
    accounts: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: dataAccount, isSigner: false, isWritable: true }
    ],
    data: Buffer.from([1, 2, 3, 4]) // Your instruction data
  });
  
  // Create and send transaction
  const transaction = new Transaction()
    .add(instruction);
  
  const signature = await connection.sendAndConfirmTransaction(
    transaction,
    [userKeypair]
  );
  
  console.log('Program called:', signature);
}
```

## Error Handling

### Robust Error Handling

```typescript
import { 
  TransactionError, 
  SendTransactionError, 
  NetworkError 
} from '@saturnbtcio/arch-sdk';

async function robustTransaction() {
  try {
    const signature = await connection.sendAndConfirmTransaction(
      transaction,
      [keypair]
    );
    console.log('Success:', signature);
  } catch (error) {
    if (error instanceof TransactionError) {
      console.error('Transaction failed:', error.message);
      console.error('Error logs:', error.logs);
    } else if (error instanceof SendTransactionError) {
      console.error('Send failed:', error.message);
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### Retry Logic

```typescript
async function sendWithRetry(transaction: Transaction, signers: Keypair[]) {
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const signature = await connection.sendAndConfirmTransaction(
        transaction,
        signers
      );
      return signature;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error; // Final attempt failed
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

## Configuration

### Environment Configuration

```typescript
// config.ts
export const CONFIG = {
  network: process.env.ARCH_NETWORK || 'localnet',
  rpcUrl: process.env.ARCH_RPC_URL || 'http://localhost:9002',
  commitment: 'confirmed' as const,
};

// Use configuration
const connection = new Connection(CONFIG.rpcUrl, CONFIG.commitment);
```

### Connection Options

```typescript
const connection = new Connection('http://localhost:9002', {
  commitment: 'confirmed',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  skipPreflight: false
});
```

## Best Practices

### Security

```typescript
// 1. Always validate public keys
function validatePubkey(input: string): boolean {
  try {
    new PublicKey(input);
    return true;
  } catch {
    return false;
  }
}

// 2. Use environment variables for sensitive data
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.PRIVATE_KEY!))
);

// 3. Validate account ownership
if (!account.owner.equals(expectedProgramId)) {
  throw new Error('Invalid account owner');
}
```

### Performance

```typescript
// 1. Batch account queries
const accounts = await connection.getMultipleAccountsInfo([
  pubkey1, pubkey2, pubkey3
]);

// 2. Use appropriate commitment levels
const recentBlockhash = await connection.getLatestBlockhash('confirmed');

// 3. Cache frequently accessed data
const programAccountsCache = new Map();
```

## Next Steps

Now that you have the basics, explore these advanced topics:

1. **[Account Management](account.md)** - Deep dive into account creation and management
2. **[Instructions and Messages](instructions-and-messages.md)** - Building complex transactions
3. **[Program Development](../program/program.md)** - Writing your own programs
4. **[Token Operations](../apl/token-program.md)** - Working with tokens

## Common Issues

### Connection Issues

```typescript
// Check if node is accessible
try {
  await connection.getVersion();
} catch (error) {
  console.error('Cannot connect to node:', error);
}
```

### Transaction Failures

```typescript
// Common causes and solutions
if (error.message.includes('insufficient funds')) {
  // Fund the account
  await connection.requestAirdrop(payer.publicKey, 1000000);
}

if (error.message.includes('AccountNotFound')) {
  // Create the account first
  await createAccount();
}
```

## Complete Example

Here's a complete example that demonstrates the concepts:

```typescript
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram 
} from '@saturnbtcio/arch-sdk';

async function completeExample() {
  // 1. Setup connection
  const connection = new Connection('http://localhost:9002');
  
  // 2. Create accounts
  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  
  // 3. Fund payer account
  await connection.requestAirdrop(payer.publicKey, 2000000);
  
  // 4. Create and send transaction
  const transaction = new Transaction()
    .add(SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 1000000
    }));
  
  const signature = await connection.sendAndConfirmTransaction(
    transaction,
    [payer]
  );
  
  // 5. Verify the transfer
  const recipientBalance = await connection.getBalance(recipient.publicKey);
  console.log('Recipient balance:', recipientBalance);
  console.log('Transaction signature:', signature);
}

completeExample().catch(console.error);
```

This guide covers the essentials of getting started with the Arch SDK. For more advanced topics and examples, explore the other sections of the documentation.
