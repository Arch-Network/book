# SDK Reference

The Arch Network SDK provides comprehensive tools and type definitions for building applications on the Arch Network. Whether you're developing programs, building client applications, or integrating with existing systems, this SDK offers everything you need to interact with the network.

## Quick Start

> **New to the Arch SDK?** Start with our [Getting Started Guide](getting-started.md) for a comprehensive walkthrough.

### Installation

**TypeScript/JavaScript**
```bash
npm install @saturnbtcio/arch-sdk
```

**Rust**
```toml
[dependencies]
arch_sdk = "0.1.0"
```

### Basic Usage

**TypeScript Example:**
```typescript
import { Connection, Keypair, Transaction } from '@saturnbtcio/arch-sdk';

// Connect to a validator
const connection = new Connection('http://localhost:9002');

// Generate a new keypair
const keypair = Keypair.generate();

// Check if node is ready
const isReady = await connection.isNodeReady();
console.log('Node ready:', isReady);
```

**Rust Example:**
```rust
use arch_sdk::{Connection, Keypair, Transaction};

// Connect to a validator
let connection = Connection::new("http://localhost:9002");

// Generate a new keypair
let keypair = Keypair::new();

// Check if node is ready
let is_ready = connection.is_node_ready().await?;
println!("Node ready: {}", is_ready);
```

## Core Types

### [Pubkey](pubkey.md)
Public key type for identifying accounts, programs, and other entities on the network. Essential for all operations.

### [Account](account.md)
Data structure representing accounts on the network, including their state and metadata. Learn account creation, management, and data handling.

### [Instructions and Messages](instructions-and-messages.md)
Core types for building transactions and interacting with programs. Master transaction construction and program interactions.

### [Runtime Transaction](runtime-transaction.md)
The fundamental transaction type that gets processed by the Arch Network runtime. Contains version, signatures, and message data.

### [Processed Transaction](processed-transaction.md)
A wrapper around Runtime Transaction that includes execution status and associated Bitcoin transaction IDs. What you receive from RPC calls.

### [Signature](signature.md)
Digital signature implementation used to authenticate transactions and instructions. 64-byte signature format.

## Key Features

### Connection Management
- **Multiple endpoints**: Connect to local validators, testnets, or mainnet
- **Automatic retries**: Built-in retry logic for network requests
- **Connection pooling**: Efficient management of network connections

### Account Management
- **Account creation**: Create new accounts with proper initialization
- **Balance queries**: Check account balances and state
- **Program interactions**: Invoke programs and read program accounts

### Transaction Building
- **Transaction construction**: Build complex transactions with multiple instructions
- **Automatic signing**: Sign transactions with your keypairs
- **Fee calculation**: Automatic fee estimation and payment

### Program Development
- **Program deployment**: Deploy your programs to the network
- **Cross-program invocation**: Call other programs from your programs
- **State management**: Manage program state and account data

## Common Operations

### Creating and Funding Accounts

```typescript
// Create a new account
const newAccount = Keypair.generate();

// Request airdrop (testnet/devnet only)
const airdropTx = await connection.requestAirdrop(
  newAccount.publicKey,
  1000000 // lamports
);

// Confirm the transaction
await connection.confirmTransaction(airdropTx);
```

### Reading Account Information

```typescript
// Get account info
const accountInfo = await connection.getAccountInfo(publicKey);

// Get account balance
const balance = await connection.getBalance(publicKey);

// Get program accounts
const programAccounts = await connection.getProgramAccounts(programId);
```

### Building and Sending Transactions

```typescript
// Create instruction
const instruction = new Instruction({
  programId: myProgramId,
  accounts: [
    { pubkey: account1, isSigner: true, isWritable: true },
    { pubkey: account2, isSigner: false, isWritable: false }
  ],
  data: instructionData
});

// Build transaction
const transaction = new Transaction()
  .add(instruction);

// Sign and send
const signature = await connection.sendAndConfirmTransaction(
  transaction,
  [keypair]
);
```

### Working with Programs

```typescript
// Deploy a program
const programId = await connection.deployProgram(
  programBinary,
  deployerKeypair
);

// Call a program function
const result = await myProgram.methods
  .myFunction(arg1, arg2)
  .accounts({
    account1: account1Pubkey,
    account2: account2Pubkey
  })
  .signers([keypair])
  .rpc();
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
try {
  const result = await connection.sendTransaction(transaction);
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('Transaction failed:', error.message);
    console.error('Error code:', error.code);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Configuration

### Network Configuration
```typescript
// Local validator
const connection = new Connection('http://localhost:9002');

// Testnet
const connection = new Connection('https://testnet.arch.network');

// Custom configuration
const connection = new Connection('http://localhost:9002', {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});
```

### Environment Variables
```bash
# Set default network
export ARCH_NETWORK=testnet

# Set custom RPC endpoint
export ARCH_RPC_URL=http://localhost:9002

# Set logging level
export ARCH_LOG_LEVEL=debug
```

## Best Practices

### Security
- **Never expose private keys**: Use secure key management
- **Validate all inputs**: Check all parameters before use
- **Use secure connections**: Always use HTTPS in production
- **Implement proper error handling**: Don't ignore errors

### Performance
- **Batch operations**: Use batch methods when possible
- **Cache frequently accessed data**: Reduce unnecessary network calls
- **Use connection pooling**: Reuse connections efficiently
- **Monitor resource usage**: Track memory and CPU usage

### Development
- **Test thoroughly**: Test all code paths and edge cases
- **Use type safety**: Take advantage of TypeScript/Rust type systems
- **Follow conventions**: Use consistent naming and patterns
- **Document your code**: Write clear documentation

## Examples

For complete examples, check out the [Arch Examples Repository](https://github.com/Arch-Network/arch-examples):

- **[Hello World](https://github.com/Arch-Network/arch-examples/tree/main/examples/helloworld)** - Basic program structure
- **[Counter](https://github.com/Arch-Network/arch-examples/tree/main/examples/counter)** - State management
- **[Token Program](https://github.com/Arch-Network/arch-examples/tree/main/examples/token)** - Fungible tokens
- **[Escrow](https://github.com/Arch-Network/arch-examples/tree/main/examples/escrow)** - Multi-party agreements

## Source Code

The complete SDK source code is available on:
- **Main SDK**: [GitHub](https://github.com/Arch-Network/arch-sdk)
- **Examples**: [GitHub](https://github.com/Arch-Network/arch-examples)
- **Documentation**: [GitHub](https://github.com/Arch-Network/arch-docs)

## Getting Help

- **Documentation**: [https://docs.arch.network](https://docs.arch.network)
- **Discord**: [https://discord.gg/archnetwork](https://discord.gg/archnetwork)
- **GitHub Issues**: [https://github.com/Arch-Network/arch-sdk/issues](https://github.com/Arch-Network/arch-sdk/issues)
- **Stack Overflow**: Use the `arch-network` tag
