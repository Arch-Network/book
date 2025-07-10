# TypeScript SDK Examples

This page provides practical examples of using the Arch Network TypeScript SDK (by Saturn) for common tasks.

## Basic Examples

### Account Management

```typescript
import { Connection, Keypair, PublicKey } from '@saturnbtcio/arch-sdk';

async function accountExample() {
  const connection = new Connection('http://localhost:9002');
  
  // Create a new account
  const newAccount = Keypair.generate();
  console.log('New account:', newAccount.publicKey.toBase58());
  
  // Check if account exists
  const accountInfo = await connection.getAccountInfo(newAccount.publicKey);
  if (!accountInfo) {
    console.log('Account does not exist yet');
  }
  
  // Get multiple accounts at once
  const accounts = await connection.getMultipleAccountsInfo([
    new PublicKey('Account1...'),
    new PublicKey('Account2...'),
    newAccount.publicKey
  ]);
}
```

### Token Operations

```typescript
import { 
  Connection, 
  Keypair, 
  Transaction,
  SystemProgram
} from '@saturnbtcio/arch-sdk';

async function tokenExample() {
  const connection = new Connection('http://localhost:9002');
  const payer = Keypair.generate();
  
  // Create a token mint account
  const mint = Keypair.generate();
  const mintSpace = 82; // Token mint size
  const mintRent = await connection.getMinimumBalanceForRentExemption(mintSpace);
  
  const createMintIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    lamports: mintRent,
    space: mintSpace,
    programId: TOKEN_PROGRAM_ID
  });
  
  const transaction = new Transaction().add(createMintIx);
  // Add token initialization instructions here
}
```

### Working with UTXOs

```typescript
import { Connection, PublicKey } from '@saturnbtcio/arch-sdk';

async function utxoExample() {
  const connection = new Connection('http://localhost:9002');
  const address = new PublicKey('YourAddress...');
  
  // Get UTXOs for an address
  const utxos = await connection.getUtxos(address);
  
  console.log('Found UTXOs:', utxos.length);
  utxos.forEach((utxo, index) => {
    console.log(`UTXO ${index}:`, {
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value
    });
  });
}
```

## Advanced Examples

### Batch Transactions

```typescript
async function batchTransactions() {
  const connection = new Connection('http://localhost:9002');
  const payer = Keypair.generate();
  
  // Create multiple transactions
  const transactions = [];
  
  for (let i = 0; i < 5; i++) {
    const recipient = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient.publicKey,
        lamports: 1000000
      })
    );
    transactions.push(tx);
  }
  
  // Send all transactions
  const signatures = await Promise.all(
    transactions.map(tx => 
      connection.sendAndConfirmTransaction(tx, [payer])
    )
  );
  
  console.log('Batch complete:', signatures);
}
```

### Error Handling Patterns

```typescript
import { TransactionError, NetworkError } from '@saturnbtcio/arch-sdk';

async function robustTransactionHandling() {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await connection.sendAndConfirmTransaction(
        transaction,
        signers
      );
      return result; // Success!
    } catch (error) {
      lastError = error;
      
      if (error instanceof TransactionError) {
        // Transaction-specific error
        console.error(`Attempt ${attempt + 1} failed:`, error.logs);
        
        if (error.message.includes('insufficient funds')) {
          // Don't retry insufficient funds
          throw error;
        }
      } else if (error instanceof NetworkError) {
        // Network error - worth retrying
        console.error(`Network error on attempt ${attempt + 1}`);
      }
      
      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}
```

### Subscribing to Account Changes

```typescript
async function subscribeToAccount() {
  const connection = new Connection('http://localhost:9002');
  const accountToWatch = new PublicKey('AccountAddress...');
  
  // Subscribe to account changes
  const subscriptionId = connection.onAccountChange(
    accountToWatch,
    (accountInfo, context) => {
      console.log('Account updated:', {
        slot: context.slot,
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length
      });
    },
    'confirmed'
  );
  
  // Later: unsubscribe
  // await connection.removeAccountChangeListener(subscriptionId);
}
```

## Integration Examples

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@saturnbtcio/arch-sdk';

function useArchBalance(address: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const connection = new Connection('https://api.arch.network');
    
    async function fetchBalance() {
      try {
        setLoading(true);
        const pubkey = new PublicKey(address);
        const balance = await connection.getBalance(pubkey);
        setBalance(balance);
        setError(null);
      } catch (err) {
        setError(err.message);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBalance();
    
    // Set up polling
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);
  
  return { balance, loading, error };
}
```

### Node.js Backend Service

```typescript
import express from 'express';
import { Connection, Keypair, Transaction } from '@saturnbtcio/arch-sdk';

const app = express();
const connection = new Connection(process.env.ARCH_RPC_URL!);

app.post('/api/transfer', async (req, res) => {
  try {
    const { to, amount } = req.body;
    
    // Load server wallet
    const serverWallet = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SERVER_WALLET!))
    );
    
    // Create and send transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: serverWallet.publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount
      })
    );
    
    const signature = await connection.sendAndConfirmTransaction(
      transaction,
      [serverWallet]
    );
    
    res.json({ success: true, signature });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

## More Examples

For more examples, check out:
- [Arch Network Examples](https://github.com/arch-network/arch-network/tree/main/examples)

## Next Steps

- [TypeScript API Reference](api-reference.md)
- [Web3 Integration Guide](web3-integration.md)
- [Getting Started Guide](getting-started.md) 