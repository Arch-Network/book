# Instructions and Messages

Instructions and messages are the core building blocks for interacting with programs on the Arch Network. They define what operations to perform and how to execute them atomically.

## Overview

- **Instructions** define individual operations to be performed by a program
- **Messages** group instructions together for atomic execution
- **Transactions** contain messages with signatures for network submission

## Instructions

An instruction specifies a program to call, accounts to use, and data to pass.

### Structure

```rust
pub struct Instruction {
    pub program_id: Pubkey,        // Program to execute
    pub accounts: Vec<AccountMeta>, // Required accounts
    pub data: Vec<u8>,             // Instruction data
}
```

### Creating Instructions

```typescript
import { Instruction, AccountMeta } from '@saturnbtcio/arch-sdk';

// Create a basic instruction
const instruction = new Instruction({
  programId: myProgramId,
  accounts: [
    {
      pubkey: userAccount,
      isSigner: true,
      isWritable: true
    },
    {
      pubkey: dataAccount,
      isSigner: false,
      isWritable: true
    }
  ],
  data: Buffer.from([1, 2, 3, 4]) // Serialized instruction data
});
```

### Account Metadata

Each instruction must specify how accounts will be used:

```typescript
interface AccountMeta {
  pubkey: Pubkey;    // Account's public key
  isSigner: boolean; // Must the account sign the transaction?
  isWritable: boolean; // Can the account's data be modified?
}
```

#### Permission Examples

```typescript
// Signer and writable (user's main account)
{
  pubkey: userPublicKey,
  isSigner: true,
  isWritable: true
}

// Read-only reference (program or config account)
{
  pubkey: configAccount,
  isSigner: false,
  isWritable: false
}

// Writable but not signer (data account owned by program)
{
  pubkey: dataAccount,
  isSigner: false,
  isWritable: true
}
```

### Instruction Data

Instruction data is typically serialized using Borsh or similar formats:

```typescript
// Define instruction enum
enum MyProgramInstruction {
  Initialize = 0,
  UpdateValue = 1,
  Close = 2
}

// Serialize instruction data
function createUpdateInstruction(newValue: number): Buffer {
  const data = Buffer.alloc(9); // 1 byte for instruction + 8 bytes for u64
  data.writeUInt8(MyProgramInstruction.UpdateValue, 0);
  data.writeBigUInt64LE(BigInt(newValue), 1);
  return data;
}

// Use in instruction
const instruction = new Instruction({
  programId: myProgramId,
  accounts: [/* ... */],
  data: createUpdateInstruction(42)
});
```

## Messages

Messages group instructions for atomic execution and include transaction metadata.

### Structure

```rust
pub struct Message {
    pub signers: Vec<Pubkey>,              // Required signers
    pub instructions: Vec<Instruction>,     // Instructions to execute
}
```

### Creating Messages

```typescript
import { Message, Transaction } from '@saturnbtcio/arch-sdk';

// Create transaction with multiple instructions
const transaction = new Transaction()
  .add(instruction1)
  .add(instruction2)
  .add(instruction3);

// The transaction internally creates a message
const message = transaction.compileMessage();
```

### Atomic Execution

All instructions in a message execute atomically - if any instruction fails, the entire transaction fails:

```typescript
// These instructions will all succeed or all fail together
const transaction = new Transaction()
  .add(transferInstruction)      // Transfer tokens
  .add(updateAccountInstruction) // Update account data
  .add(logInstruction);         // Log the operation
```

## Building Transactions

### Simple Transaction

```typescript
// Single instruction transaction
const transaction = new Transaction()
  .add(instruction);

// Sign and send
const signature = await connection.sendAndConfirmTransaction(
  transaction,
  [keypair]
);
```

### Multi-Instruction Transaction

```typescript
// Complex transaction with multiple operations
const transaction = new Transaction()
  .add(createAccountInstruction)
  .add(initializeAccountInstruction)
  .add(transferInstruction);

// Sign with multiple keypairs if needed
const signature = await connection.sendAndConfirmTransaction(
  transaction,
  [payer, newAccount, authority]
);
```

### Transaction Limits

```typescript
// Check transaction size before sending
const messageSize = transaction.compileMessage().serialize().length;
const maxSize = 1232; // Current limit

if (messageSize > maxSize) {
  throw new Error(`Transaction too large: ${messageSize} bytes`);
}
```

## Common Patterns

### System Program Operations

```typescript
import { SystemProgram } from '@saturnbtcio/arch-sdk';

// Create account
const createInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: newAccount.publicKey,
  lamports: 1000000,
  space: 256,
  programId: myProgramId
});

// Transfer lamports
const transferInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: recipient.publicKey,
  lamports: 1000000
});
```

### Program-Specific Instructions

```typescript
// Create helper functions for your program
class MyProgram {
  static initialize(
    account: Pubkey,
    authority: Pubkey,
    initialValue: number
  ): Instruction {
    return new Instruction({
      programId: MY_PROGRAM_ID,
      accounts: [
        { pubkey: account, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false }
      ],
      data: Buffer.from([0, ...new BN(initialValue).toArray('le', 8)])
    });
  }

  static updateValue(
    account: Pubkey,
    authority: Pubkey,
    newValue: number
  ): Instruction {
    return new Instruction({
      programId: MY_PROGRAM_ID,
      accounts: [
        { pubkey: account, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false }
      ],
      data: Buffer.from([1, ...new BN(newValue).toArray('le', 8)])
    });
  }
}

// Use the helper functions
const initInstruction = MyProgram.initialize(
  dataAccount.publicKey,
  authority.publicKey,
  100
);
```

## Cross-Program Invocation (CPI)

Programs can call other programs using CPI:

```rust
// In your program
use arch_sdk::{invoke, invoke_signed};

// Invoke another program
invoke(
    &instruction,
    &[account1, account2, program_account]
)?;

// Invoke with program-derived address
invoke_signed(
    &instruction,
    &[account1, account2, program_account],
    &[&[b"seed", &[bump]]]
)?;
```

## Error Handling

### Client-Side Validation

```typescript
// Validate instruction before sending
function validateInstruction(instruction: Instruction): void {
  if (!instruction.programId) {
    throw new Error('Program ID is required');
  }
  
  if (instruction.accounts.length === 0) {
    throw new Error('At least one account is required');
  }
  
  // Check for required signers
  const hasRequiredSigner = instruction.accounts.some(
    account => account.isSigner
  );
  
  if (!hasRequiredSigner) {
    throw new Error('At least one signer is required');
  }
}
```

### Transaction Errors

```typescript
try {
  const signature = await connection.sendAndConfirmTransaction(
    transaction,
    [keypair]
  );
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('Transaction failed:', error.message);
    console.error('Logs:', error.logs);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

### Security
- **Validate all accounts**: Ensure accounts have correct permissions
- **Check program ownership**: Verify accounts are owned by expected programs
- **Sanitize instruction data**: Validate all input parameters
- **Use type-safe serialization**: Prefer Borsh or similar libraries

### Performance
- **Batch operations**: Group related instructions in single transactions
- **Minimize account usage**: Only include necessary accounts
- **Cache program IDs**: Store frequently used program IDs as constants
- **Optimize instruction data**: Use efficient serialization formats

### Development
- **Create instruction builders**: Build helper functions for common operations
- **Document instruction formats**: Clearly document expected data formats
- **Test edge cases**: Test with invalid accounts, insufficient funds, etc.
- **Use TypeScript**: Take advantage of type safety

## Advanced Patterns

### Conditional Instructions

```typescript
// Build instructions based on conditions
const instructions: Instruction[] = [];

// Always initialize
instructions.push(initializeInstruction);

// Conditionally add operations
if (shouldTransfer) {
  instructions.push(transferInstruction);
}

if (shouldClose) {
  instructions.push(closeInstruction);
}

// Build transaction
const transaction = new Transaction();
instructions.forEach(ix => transaction.add(ix));
```

### Instruction Factories

```typescript
// Create reusable instruction factories
interface TokenTransferParams {
  source: Pubkey;
  destination: Pubkey;
  authority: Pubkey;
  amount: number;
}

function createTokenTransferInstruction(
  params: TokenTransferParams
): Instruction {
  return new Instruction({
    programId: TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: params.source, isSigner: false, isWritable: true },
      { pubkey: params.destination, isSigner: false, isWritable: true },
      { pubkey: params.authority, isSigner: true, isWritable: false }
    ],
    data: encodeTokenTransferData(params.amount)
  });
}
```

## Examples

For complete examples using instructions and messages, see:
- **[Hello World](https://github.com/Arch-Network/arch-examples/tree/main/examples/helloworld)** - Basic instruction usage
- **[Counter](https://github.com/Arch-Network/arch-examples/tree/main/examples/counter)** - State management instructions
- **[Token Program](https://github.com/Arch-Network/arch-examples/tree/main/examples/token)** - Complex instruction patterns
- **[Escrow](https://github.com/Arch-Network/arch-examples/tree/main/examples/escrow)** - Multi-party transaction coordination

## Source Code

The instruction and message implementations are available in the [Arch Examples Repository](https://github.com/Arch-Network/arch-examples/blob/main/program/src/instruction.rs). 