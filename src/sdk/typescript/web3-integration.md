# Web3 Integration Guide

This guide covers how to integrate the Arch Network TypeScript SDK (by Saturn) with Web3 applications, wallets, and dApps.

> **Important**: The Arch TypeScript SDK is a low-level RPC client. It does not include wallet adapters, transaction builders, or other high-level abstractions. This guide shows how you could build these features on top of the SDK.

## Understanding the Limitations

The current TypeScript SDK provides:
- Low-level RPC connection (`RpcConnection`)
- Basic account creation with secp256k1 (`ArchConnection`)
- Message/transaction serialization utilities
- Type definitions for Arch data structures

It does **NOT** provide:
- Wallet adapters or browser wallet integration
- High-level transaction builders
- React/Vue components or hooks
- State management solutions

## Building Wallet Integration

Since the SDK doesn't include wallet adapters, you'll need to build your own. Here's a conceptual approach:

### Defining a Wallet Interface

```typescript
import { RpcConnection } from '@saturnbtcio/arch-sdk';
import type { RuntimeTransaction, SanitizedMessage } from '@saturnbtcio/arch-sdk';

// Define what a wallet adapter might look like
interface ArchWallet {
  publicKey: Uint8Array | null;
  connected: boolean;
  connect(): Promise<{ publicKey: string }>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction(tx: SanitizedMessage): Promise<Uint8Array>;
}

// Example implementation skeleton
class BrowserWalletAdapter implements ArchWallet {
  publicKey: Uint8Array | null = null;
  connected: boolean = false;
  
  async connect(): Promise<{ publicKey: string }> {
    // This would interface with actual browser wallet
    // For now, this is just a placeholder
    throw new Error('Wallet integration not implemented');
  }
  
  async disconnect(): Promise<void> {
    this.publicKey = null;
    this.connected = false;
  }
  
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    // Would call wallet's signing method
    throw new Error('Message signing not implemented');
  }
  
  async signTransaction(tx: SanitizedMessage): Promise<Uint8Array> {
    // Would call wallet's transaction signing
    throw new Error('Transaction signing not implemented');
  }
}
```

### Creating Transactions with External Signing

```typescript
import { RpcConnection, SanitizedMessageUtil, PubkeyUtil } from '@saturnbtcio/arch-sdk';
import type { RuntimeTransaction, SanitizedMessage, SanitizedInstruction } from '@saturnbtcio/arch-sdk';

async function createAndSignTransaction(
  connection: RpcConnection,
  signer: Uint8Array,
  signFunction: (message: Uint8Array) => Promise<Uint8Array>
) {
  // Build a sanitized message
  const message: SanitizedMessage = {
    header: {
      num_required_signatures: 1,
      num_readonly_signed_accounts: 0,
      num_readonly_unsigned_accounts: 1,
    },
    account_keys: [
      signer,                      // Signer pubkey
      PubkeyUtil.systemProgram(),  // System program
    ],
    recent_blockhash: new Uint8Array(32), // Need actual blockhash
    instructions: [
      {
        program_id_index: 1,
        accounts: [0],
        data: new Uint8Array([0, 0, 0, 0]),
      },
    ],
  };
  
  // Serialize message for signing
  const serializedMessage = SanitizedMessageUtil.serialize(message);
  
  // Sign with external wallet
  const signature = await signFunction(serializedMessage);
  
  // Create runtime transaction
  const transaction: RuntimeTransaction = {
    version: 0,
    signatures: [signature],
    message: message,
  };
  
  // Send transaction
  const txId = await connection.sendTransaction(transaction);
  return txId;
}
```

## React Integration Pattern

Here's how you might structure a React integration:

### Basic Context Provider

```typescript
import React, { createContext, useContext, useState } from 'react';
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

interface ArchContextState {
  connection: RpcConnection;
  arch: ReturnType<typeof ArchConnection>;
  // Add your wallet adapter here when implemented
}

const ArchContext = createContext<ArchContextState | null>(null);

export function ArchProvider({ children, endpoint }: { children: React.ReactNode, endpoint: string }) {
  const connection = new RpcConnection(endpoint);
  const arch = ArchConnection(connection);
  
  const value = {
    connection,
    arch,
  };
  
  return (
    <ArchContext.Provider value={value}>
      {children}
    </ArchContext.Provider>
  );
}

export function useArch() {
  const context = useContext(ArchContext);
  if (!context) {
    throw new Error('useArch must be used within ArchProvider');
  }
  return context;
}
```

### Custom Hooks

```typescript
import { useState, useEffect } from 'react';
import { RpcConnection } from '@saturnbtcio/arch-sdk';

// Hook for monitoring block count
export function useBlockCount(endpoint: string) {
  const [blockCount, setBlockCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const connection = new RpcConnection(endpoint);
    let mounted = true;
    
    const fetchBlockCount = async () => {
      try {
        const count = await connection.getBlockCount();
        if (mounted) {
          setBlockCount(count);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchBlockCount();
    const interval = setInterval(fetchBlockCount, 10000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [endpoint]);
  
  return { blockCount, loading, error };
}

// Hook for account information
export function useAccountInfo(pubkey: Uint8Array | null) {
  const { connection } = useArch();
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!pubkey) return;
    
    let cancelled = false;
    
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const info = await connection.readAccountInfo(pubkey);
        if (!cancelled) {
          setAccountInfo(info);
        }
      } catch (error) {
        console.error('Failed to fetch account:', error);
        if (!cancelled) {
          setAccountInfo(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchAccount();
    
    return () => {
      cancelled = true;
    };
  }, [pubkey, connection]);
  
  return { accountInfo, loading };
}
```

## Building Transaction Helpers

Since the SDK doesn't include transaction builders, here's how you might create your own:

```typescript
import { PubkeyUtil } from '@saturnbtcio/arch-sdk';
import type { SanitizedMessage, SanitizedInstruction } from '@saturnbtcio/arch-sdk';

class TransactionBuilder {
  private accountKeys: Uint8Array[] = [];
  private instructions: SanitizedInstruction[] = [];
  private signerCount = 0;
  
  addSigner(pubkey: Uint8Array): number {
    const index = this.accountKeys.length;
    this.accountKeys.push(pubkey);
    this.signerCount++;
    return index;
  }
  
  addAccount(pubkey: Uint8Array): number {
    const index = this.accountKeys.length;
    this.accountKeys.push(pubkey);
    return index;
  }
  
  addInstruction(
    programId: Uint8Array,
    accounts: number[],
    data: Uint8Array
  ): void {
    // Ensure program ID is in account keys
    let programIdIndex = this.accountKeys.findIndex(
      key => this.arraysEqual(key, programId)
    );
    
    if (programIdIndex === -1) {
      programIdIndex = this.addAccount(programId);
    }
    
    this.instructions.push({
      program_id_index: programIdIndex,
      accounts,
      data,
    });
  }
  
  build(recentBlockhash: Uint8Array): SanitizedMessage {
    return {
      header: {
        num_required_signatures: this.signerCount,
        num_readonly_signed_accounts: 0,
        num_readonly_unsigned_accounts: this.accountKeys.length - this.signerCount,
      },
      account_keys: this.accountKeys,
      recent_blockhash: recentBlockhash,
      instructions: this.instructions,
    };
  }
  
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}

// Usage example
function createTransferMessage(from: Uint8Array, to: Uint8Array, amount: bigint): SanitizedMessage {
  const builder = new TransactionBuilder();
  
  // Add accounts
  const fromIndex = builder.addSigner(from);
  const toIndex = builder.addAccount(to);
  
  // Create transfer instruction data
  // Note: This is a simplified example - actual encoding depends on the program
  const data = new Uint8Array(8);
  new DataView(data.buffer).setBigUint64(0, amount, true);
  
  // Add instruction
  builder.addInstruction(
    PubkeyUtil.systemProgram(),
    [fromIndex, toIndex],
    data
  );
  
  // Build with a recent blockhash (you need to fetch this)
  const recentBlockhash = new Uint8Array(32); // Placeholder
  return builder.build(recentBlockhash);
}
```

## Security Considerations

When building Web3 integrations with the low-level SDK:

1. **Key Management**: Never handle private keys directly in browser code
2. **Message Validation**: Always validate message contents before signing
3. **Error Handling**: Implement robust error handling for RPC calls
4. **Type Safety**: Use TypeScript strictly to catch errors at compile time
5. **Input Validation**: Validate all user inputs, especially addresses and amounts

## Example: Simple dApp Structure

```typescript
// services/arch.ts
import { RpcConnection, ArchConnection } from '@saturnbtcio/arch-sdk';

export class ArchService {
  private connection: RpcConnection;
  private arch: ReturnType<typeof ArchConnection>;
  
  constructor(endpoint: string) {
    this.connection = new RpcConnection(endpoint);
    this.arch = ArchConnection(this.connection);
  }
  
  async getNetworkStatus() {
    const blockCount = await this.connection.getBlockCount();
    const bestBlockHash = await this.connection.getBestBlockHash();
    return { blockCount, bestBlockHash };
  }
  
  async createAccount() {
    return await this.arch.createNewAccount();
  }
  
  async getAccountInfo(pubkey: Uint8Array) {
    return await this.connection.readAccountInfo(pubkey);
  }
}

// components/NetworkStatus.tsx
import React from 'react';
import { useBlockCount } from '../hooks/useBlockCount';

export function NetworkStatus() {
  const { blockCount, loading, error } = useBlockCount('http://localhost:9002');
  
  if (loading) return <div>Loading network status...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>Network Status</h3>
      <p>Current block: {blockCount}</p>
    </div>
  );
}
```

## Next Steps

Since the TypeScript SDK is low-level, you'll need to:

1. Implement your own wallet integration layer
2. Build transaction construction utilities
3. Create state management solutions
4. Develop UI components for common operations

For more information:
- [TypeScript SDK API Reference](api-reference.md)
- [Low-Level Examples](examples.md)
- [RPC Documentation](../../rpc/rpc.md) 