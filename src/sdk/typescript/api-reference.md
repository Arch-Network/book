# TypeScript SDK API Reference

This page provides a comprehensive API reference for the Arch Network TypeScript SDK developed by Saturn.

> **Note**: The Arch TypeScript SDK is a low-level SDK that provides direct RPC access to Arch nodes. It does not include high-level abstractions like transaction builders or wallet management.

## Core Classes

### RpcConnection

The main class for interacting with an Arch Network node via RPC.

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

const connection = new RpcConnection('http://localhost:9002');
```

#### Methods

- `sendTransaction(params: RuntimeTransaction): Promise<string>` - Send a transaction
- `sendTransactions(params: RuntimeTransaction[]): Promise<string[]>` - Send multiple transactions
- `readAccountInfo(pubkey: Pubkey): Promise<AccountInfoResult>` - Read account information
- `getAccountAddress(pubkey: Pubkey): Promise<string>` - Get account address from pubkey
- `getBestBlockHash(): Promise<string>` - Get the best block hash
- `getBlock(blockHash: string): Promise<Block | undefined>` - Get block by hash
- `getBlockCount(): Promise<number>` - Get current block count
- `getBlockHash(blockHeight: number): Promise<string>` - Get block hash by height
- `getProcessedTransaction(txid: string): Promise<ProcessedTransaction | undefined>` - Get transaction info
- `getProgramAccounts(programId: Pubkey, filters?: AccountFilter[]): Promise<ProgramAccount[]>` - Get program accounts
- `requestAirdrop(pubkey: Pubkey): Promise<void>` - Request airdrop (testnet only)
- `createAccountWithFaucet(pubkey: Pubkey): Promise<void>` - Create and fund account (testnet only)

### ArchConnection

A wrapper that adds additional functionality to any Provider implementation.

```typescript
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

const connection = new RpcConnection('http://localhost:9002');
const arch = ArchConnection(connection);
```

#### Methods

- `createNewAccount(): Promise<CreatedAccount>` - Create a new account with secp256k1 keypair

## Core Types

### Pubkey
```typescript
type Pubkey = Uint8Array; // 32 bytes
```

### Message
```typescript
interface Message {
  signers: Pubkey[];
  instructions: Instruction[];
}
```

### Instruction
```typescript
interface Instruction {
  program_id: Pubkey;
  accounts: AccountMeta[];
  data: Uint8Array;
}
```

### AccountMeta
```typescript
interface AccountMeta {
  pubkey: Pubkey;
  is_signer: boolean;
  is_writable: boolean;
}
```

### RuntimeTransaction
```typescript
interface RuntimeTransaction {
  version: number;
  signatures: Signature[]; // Array of 64-byte signatures
  message: SanitizedMessage;
}
```

### SanitizedMessage
```typescript
interface SanitizedMessage {
  header: MessageHeader;
  account_keys: Pubkey[];
  recent_blockhash: Uint8Array;
  instructions: SanitizedInstruction[];
}
```

### MessageHeader
```typescript
interface MessageHeader {
  num_required_signatures: number;
  num_readonly_signed_accounts: number;
  num_readonly_unsigned_accounts: number;
}
```

### SanitizedInstruction
```typescript
interface SanitizedInstruction {
  program_id_index: number;
  accounts: number[];
  data: Uint8Array;
}
```

### AccountInfoResult
```typescript
interface AccountInfoResult {
  lamports: number;
  data: Uint8Array;
  owner: Pubkey;
  executable: boolean;
  rent_epoch: number;
}
```

### CreatedAccount
```typescript
interface CreatedAccount {
  privkey: string; // Hex-encoded private key
  pubkey: string;  // Hex-encoded public key
  address: string; // Bitcoin-style address
}
```

### Block
```typescript
interface Block {
  hash: string;
  previous_blockhash: string;
  parent_slot: number;
  transactions?: ProcessedTransaction[];
  block_time?: number;
  block_height?: number;
}
```

### ProcessedTransaction
```typescript
interface ProcessedTransaction {
  txid: string;
  status: ProcessedTransactionStatus;
  bitcoin_txids: string[];
}

interface ProcessedTransactionStatus {
  Processed?: {
    runtime_transaction: RuntimeTransaction;
    execution_result: any;
    bitcoin_txids: string[];
  };
}
```

## Utility Modules

### PubkeyUtil
```typescript
import { PubkeyUtil } from '@saturnbtcio/arch-sdk';

// Get system program pubkey
const systemProgram = PubkeyUtil.systemProgram();

// Convert to/from hex
const hex = PubkeyUtil.toHex(pubkey);
const pubkey = PubkeyUtil.fromHex(hex);
```

### MessageUtil
```typescript
import { MessageUtil } from '@saturnbtcio/arch-sdk';

// Serialize/deserialize messages
const serialized = MessageUtil.serialize(message);
const message = MessageUtil.deserialize(serialized);
```

### SanitizedMessageUtil
```typescript
import { SanitizedMessageUtil } from '@saturnbtcio/arch-sdk';

// Work with sanitized messages
const serialized = SanitizedMessageUtil.serialize(sanitizedMessage);
const sanitizedMessage = SanitizedMessageUtil.deserialize(serialized);
```

### InstructionUtil
```typescript
import { InstructionUtil } from '@saturnbtcio/arch-sdk';

// Serialize/deserialize instructions
const serialized = InstructionUtil.serialize(instruction);
const instruction = InstructionUtil.deserialize(serialized);
```

### AccountUtil
```typescript
import { AccountUtil } from '@saturnbtcio/arch-sdk';

// Work with account data
const serialized = AccountUtil.serialize(accountInfo);
const accountInfo = AccountUtil.deserialize(serialized);
```

### SignatureUtil
```typescript
import { SignatureUtil } from '@saturnbtcio/arch-sdk';

// Signature utilities (implementation details vary)
```

## Error Handling

### ArchRpcError
```typescript
import { ArchRpcError } from '@saturnbtcio/arch-sdk';

try {
  await connection.getBlock('invalid-hash');
} catch (error) {
  if (error instanceof ArchRpcError) {
    console.error('RPC Error:', error.error);
    // error.error.code - Error code
    // error.error.message - Error message
  }
}
```

## Schema Exports

The SDK exports Borsh schemas for serialization:

- `PubkeySchema`
- `MessageSchema`
- `SanitizedMessageSchema`
- `InstructionSchema`
- `SanitizedInstructionSchema`
- `MessageHeaderSchema`
- `UtxoMetaSchema`

## Constants

### Action
```typescript
import { Action } from '@saturnbtcio/arch-sdk';

// RPC action constants used internally
```

## Complete API Documentation

For the most up-to-date API reference and implementation details:
- [NPM Package](https://www.npmjs.com/package/@saturnbtcio/arch-sdk)
- [GitHub Repository](https://github.com/saturnbtc/arch-typescript-sdk)
- [Source Code](https://github.com/saturnbtc/arch-typescript-sdk/tree/main/src)