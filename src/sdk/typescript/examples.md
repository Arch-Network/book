# TypeScript SDK Examples

This page provides practical examples of using the Arch Network TypeScript SDK (by Saturn) for common tasks.

> **Note**: These examples demonstrate the low-level RPC API. The SDK does not include high-level abstractions like transaction builders or wallet management.

## Basic Examples

### Connecting and Querying Network

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function networkExample() {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    // Get network status
    const blockCount = await connection.getBlockCount();
    console.log('Current block count:', blockCount);
    
    // Get latest block
    const bestBlockHash = await connection.getBestBlockHash();
    const block = await connection.getBlock(bestBlockHash);
    
    if (block) {
      console.log('Latest block:', {
        hash: block.hash,
        height: block.block_height,
        transactions: block.transactions?.length || 0
      });
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### Account Management

```typescript
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

async function accountExample() {
  const connection = new RpcConnection('http://localhost:9002');
  const arch = ArchConnection(connection);
  
  // Create a new account with private key
  const newAccount = await arch.createNewAccount();
  console.log('New account created:');
  console.log('  Private key:', newAccount.privkey);
  console.log('  Public key:', newAccount.pubkey);
  console.log('  Address:', newAccount.address);
  
  // Convert hex pubkey to Uint8Array for RPC calls
  const pubkeyBytes = new Uint8Array(
    newAccount.pubkey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  // Read account info
  try {
    const accountInfo = await connection.readAccountInfo(pubkeyBytes);
    console.log('Account info:', accountInfo);
  } catch (error) {
    console.log('Account not found (expected for new account)');
  }
}
```

### Creating and Funding Accounts

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function fundAccountExample() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Generate a random pubkey (in practice, derive from private key)
  const pubkey = new Uint8Array(32);
  crypto.getRandomValues(pubkey);
  
  try {
    // Create and fund account (testnet only)
    await connection.createAccountWithFaucet(pubkey);
    console.log('Account created and funded');
    
    // Read the funded account
    const accountInfo = await connection.readAccountInfo(pubkey);
    console.log('Account balance:', accountInfo.lamports);
  } catch (error) {
    console.error('Failed to create account:', error);
  }
}
```

## Working with Messages and Instructions

### Creating a Simple Message

```typescript
import { MessageUtil, PubkeyUtil } from '@saturnbtcio/arch-sdk';
import type { Message, Instruction } from '@saturnbtcio/arch-sdk';

function createSimpleMessage() {
  // Create account pubkeys
  const signer = new Uint8Array(32);
  crypto.getRandomValues(signer);
  
  // Create an instruction
  const instruction: Instruction = {
    program_id: PubkeyUtil.systemProgram(),
    accounts: [
      {
        pubkey: signer,
        is_signer: true,
        is_writable: true,
      },
    ],
    data: new Uint8Array([1, 2, 3, 4]), // Instruction data
  };
  
  // Create a message
  const message: Message = {
    signers: [signer],
    instructions: [instruction],
  };
  
  // Serialize for sending
  const serialized = MessageUtil.serialize(message);
  console.log('Serialized message:', serialized);
  
  // Deserialize back
  const deserialized = MessageUtil.deserialize(serialized);
  console.log('Deserialized:', deserialized);
}
```

### Creating a Runtime Transaction

```typescript
import { RpcConnection, SanitizedMessageUtil } from '@saturnbtcio/arch-sdk';
import type { RuntimeTransaction, SanitizedMessage } from '@saturnbtcio/arch-sdk';

async function createTransaction() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Create account keys
  const signer = new Uint8Array(32);
  crypto.getRandomValues(signer);
  
  // Create a sanitized message
  const sanitizedMessage: SanitizedMessage = {
    header: {
      num_required_signatures: 1,
      num_readonly_signed_accounts: 0,
      num_readonly_unsigned_accounts: 1,
    },
    account_keys: [
      signer,                          // Index 0: Signer
      PubkeyUtil.systemProgram(),      // Index 1: System program
    ],
    recent_blockhash: new Uint8Array(32), // You need a real blockhash
    instructions: [
      {
        program_id_index: 1,           // System program
        accounts: [0],                 // Signer account
        data: new Uint8Array([0, 0, 0, 0]), // Transfer instruction
      },
    ],
  };
  
  // Create the runtime transaction
  const transaction: RuntimeTransaction = {
    version: 0,
    signatures: [new Uint8Array(64)], // Need real signature
    message: sanitizedMessage,
  };
  
  // Note: This example doesn't include proper signing
  // In practice, you need to sign the message with the private key
  
  console.log('Transaction created (unsigned)');
}
```

## Advanced Examples

### Querying Blocks and Transactions

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function blockExplorer() {
  const connection = new RpcConnection('http://localhost:9002');
  
  try {
    // Get recent blocks
    const blockCount = await connection.getBlockCount();
    console.log(`\nExploring last 5 blocks (current height: ${blockCount})`);
    
    for (let i = 0; i < 5 && blockCount - i > 0; i++) {
      const height = blockCount - i - 1;
      const hash = await connection.getBlockHash(height);
      const block = await connection.getBlock(hash);
      
      if (block) {
        console.log(`\nBlock ${height}:`);
        console.log(`  Hash: ${hash}`);
        console.log(`  Transactions: ${block.transactions?.length || 0}`);
        
        // Check transactions in the block
        if (block.transactions && block.transactions.length > 0) {
          for (const tx of block.transactions) {
            console.log(`  TX: ${tx.txid}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error exploring blocks:', error);
  }
}
```

### Getting Program Accounts

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';

async function getProgramAccountsExample() {
  const connection = new RpcConnection('http://localhost:9002');
  
  // Example program ID (replace with actual program)
  const programId = new Uint8Array(32);
  programId[31] = 2; // Example program ID
  
  try {
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(programId);
    
    console.log(`Found ${accounts.length} accounts for program`);
    
    accounts.forEach((account, index) => {
      console.log(`\nAccount ${index}:`);
      console.log('  Pubkey:', account.pubkey);
      console.log('  Account:', account.account);
    });
    
    // With filters (if supported)
    const filteredAccounts = await connection.getProgramAccounts(
      programId,
      [
        // Filter examples would go here
        // The actual filter format depends on implementation
      ]
    );
  } catch (error) {
    console.error('Error getting program accounts:', error);
  }
}
```

### Error Handling with Retry

```typescript
import { RpcConnection, ArchRpcError } from '@saturnbtcio/arch-sdk';

async function robustRpcCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof ArchRpcError) {
        console.error(`RPC Error (attempt ${i + 1}):`, error.error);
        
        // Don't retry on certain errors
        if (error.error.code === 404) {
          throw error; // Not found - don't retry
        }
      }
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  }
  
  throw lastError;
}

// Usage example
async function example() {
  const connection = new RpcConnection('http://localhost:9002');
  
  const blockCount = await robustRpcCall(
    () => connection.getBlockCount()
  );
  console.log('Block count:', blockCount);
}
```

## Integration Examples

### Node.js Service Example

```typescript
import express from 'express';
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

const app = express();
app.use(express.json());

const connection = new RpcConnection(process.env.ARCH_RPC_URL || 'http://localhost:9002');
const arch = ArchConnection(connection);

// Get network status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const blockCount = await connection.getBlockCount();
    const bestBlockHash = await connection.getBestBlockHash();
    
    res.json({
      success: true,
      data: {
        blockCount,
        bestBlockHash,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new account endpoint
app.post('/api/account/new', async (req, res) => {
  try {
    const account = await arch.createNewAccount();
    
    // In production, you'd want to securely store the private key
    res.json({
      success: true,
      data: {
        address: account.address,
        pubkey: account.pubkey,
        // Don't return private key in production!
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { RpcConnection } from '@saturnbtcio/arch-sdk';

function useArchBlockCount() {
  const [blockCount, setBlockCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const connection = new RpcConnection('https://api.arch.network');
    let mounted = true;
    
    async function fetchBlockCount() {
      try {
        const count = await connection.getBlockCount();
        if (mounted) {
          setBlockCount(count);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setBlockCount(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchBlockCount();
    
    // Set up polling
    const interval = setInterval(fetchBlockCount, 10000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  
  return { blockCount, loading, error };
}

// Usage in component
function BlockCounter() {
  const { blockCount, loading, error } = useArchBlockCount();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Current block: {blockCount}</div>;
}
```

## Utility Functions

### Working with Public Keys

```typescript
import { PubkeyUtil } from '@saturnbtcio/arch-sdk';

// Convert between formats
function pubkeyExamples() {
  // Create a pubkey from hex string
  const hexPubkey = '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20';
  const pubkeyBytes = PubkeyUtil.fromHex(hexPubkey);
  
  // Convert back to hex
  const hexAgain = PubkeyUtil.toHex(pubkeyBytes);
  console.log('Hex match:', hexPubkey === hexAgain);
  
  // Get system program pubkey
  const systemProgram = PubkeyUtil.systemProgram();
  console.log('System program:', PubkeyUtil.toHex(systemProgram));
}
```

## More Examples

For more examples and implementation details:
- [Arch Network Examples](https://github.com/arch-network/arch-network/tree/main/examples)
- [TypeScript SDK Source](https://github.com/saturnbtc/arch-typescript-sdk/tree/main/src)

## Next Steps

- [TypeScript API Reference](api-reference.md)
- [Getting Started Guide](getting-started.md) 
- [RPC Methods Documentation](../../rpc/rpc.md) 