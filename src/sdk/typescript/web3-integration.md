# Web3 Integration Guide

This guide covers how to integrate the Arch Network TypeScript SDK (by Saturn) with Web3 applications, wallets, and dApps.

## Wallet Integration

### Browser Wallet Detection

```typescript
import { Connection, PublicKey } from '@saturnbtcio/arch-sdk';

// Check if Arch wallet is installed
function isArchWalletInstalled(): boolean {
  return typeof window !== 'undefined' && 
         window.arch !== undefined;
}

// Connect to wallet
async function connectWallet() {
  if (!isArchWalletInstalled()) {
    throw new Error('Arch wallet not installed');
  }
  
  try {
    const response = await window.arch.connect();
    const publicKey = new PublicKey(response.publicKey);
    console.log('Connected:', publicKey.toBase58());
    return publicKey;
  } catch (error) {
    console.error('Failed to connect:', error);
    throw error;
  }
}
```

### Wallet Adapter Pattern

```typescript
interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

class ArchWalletAdapter implements WalletAdapter {
  publicKey: PublicKey | null = null;
  connected: boolean = false;
  
  async connect(): Promise<void> {
    const response = await window.arch.connect();
    this.publicKey = new PublicKey(response.publicKey);
    this.connected = true;
  }
  
  async disconnect(): Promise<void> {
    await window.arch.disconnect();
    this.publicKey = null;
    this.connected = false;
  }
  
  async signTransaction(tx: Transaction): Promise<Transaction> {
    return window.arch.signTransaction(tx);
  }
  
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return window.arch.signAllTransactions(txs);
  }
}
```

## React Integration

### Context Provider

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@saturnbtcio/arch-sdk';

interface ArchContextState {
  connection: Connection;
  publicKey: PublicKey | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}

const ArchContext = createContext<ArchContextState | null>(null);

export function ArchProvider({ children, endpoint }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const connection = new Connection(endpoint);
  
  const connect = async () => {
    try {
      const response = await window.arch.connect();
      setPublicKey(new PublicKey(response.publicKey));
      setConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  };
  
  const disconnect = async () => {
    await window.arch.disconnect();
    setPublicKey(null);
    setConnected(false);
  };
  
  const signTransaction = async (tx: Transaction) => {
    if (!connected) throw new Error('Wallet not connected');
    return window.arch.signTransaction(tx);
  };
  
  const value = {
    connection,
    publicKey,
    connected,
    connect,
    disconnect,
    signTransaction
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

### React Hooks

```typescript
// Hook for account balance
export function useBalance(address?: PublicKey) {
  const { connection } = useArch();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!address) return;
    
    let cancelled = false;
    
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const balance = await connection.getBalance(address);
        if (!cancelled) {
          setBalance(balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchBalance();
    
    // Subscribe to changes
    const id = connection.onAccountChange(
      address,
      (accountInfo) => {
        setBalance(accountInfo.lamports);
      },
      'confirmed'
    );
    
    return () => {
      cancelled = true;
      connection.removeAccountChangeListener(id);
    };
  }, [address, connection]);
  
  return { balance, loading };
}

// Hook for sending transactions
export function useSendTransaction() {
  const { connection, signTransaction } = useArch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const sendTransaction = async (transaction: Transaction) => {
    setLoading(true);
    setError(null);
    
    try {
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);
      return signature;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { sendTransaction, loading, error };
}
```

## Vue.js Integration

### Composition API

```typescript
import { ref, computed, watch } from 'vue';
import { Connection, PublicKey } from '@saturnbtcio/arch-sdk';

export function useArchWallet(endpoint: string) {
  const connection = new Connection(endpoint);
  const publicKey = ref<PublicKey | null>(null);
  const connected = computed(() => publicKey.value !== null);
  const balance = ref(0);
  
  const connect = async () => {
    try {
      const response = await window.arch.connect();
      publicKey.value = new PublicKey(response.publicKey);
      await updateBalance();
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  };
  
  const disconnect = async () => {
    await window.arch.disconnect();
    publicKey.value = null;
    balance.value = 0;
  };
  
  const updateBalance = async () => {
    if (!publicKey.value) return;
    
    try {
      const bal = await connection.getBalance(publicKey.value);
      balance.value = bal;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };
  
  // Watch for account changes
  watch(publicKey, (newKey) => {
    if (newKey) {
      updateBalance();
    }
  });
  
  return {
    connection,
    publicKey,
    connected,
    balance,
    connect,
    disconnect,
    updateBalance
  };
}
```

## dApp Development

### Transaction Builder UI

```typescript
import React, { useState } from 'react';
import { 
  Transaction, 
  SystemProgram, 
  PublicKey,
  LAMPORTS_PER_SOL 
} from '@saturnbtcio/arch-sdk';
import { useArch, useSendTransaction } from './arch-context';

function TransferForm() {
  const { publicKey } = useArch();
  const { sendTransaction, loading } = useSendTransaction();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const handleTransfer = async () => {
    if (!publicKey) return;
    
    try {
      const recipientPubkey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports
        })
      );
      
      const signature = await sendTransaction(transaction);
      console.log('Transfer successful:', signature);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };
  
  return (
    <div>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (SOL)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button 
        onClick={handleTransfer}
        disabled={loading || !publicKey}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

### Multi-Signature Support

```typescript
interface MultiSigConfig {
  threshold: number;
  signers: PublicKey[];
}

async function createMultiSigTransaction(
  config: MultiSigConfig,
  instruction: Instruction
): Promise<Transaction> {
  const transaction = new Transaction();
  
  // Add multisig verification instruction
  transaction.add(
    createMultiSigVerifyInstruction(config)
  );
  
  // Add the actual instruction
  transaction.add(instruction);
  
  return transaction;
}

async function collectSignatures(
  transaction: Transaction,
  signers: PublicKey[]
): Promise<Transaction> {
  let signedTx = transaction;
  
  for (const signer of signers) {
    // Request signature from each signer
    // This could be through different wallet connections
    signedTx = await requestSignature(signedTx, signer);
  }
  
  return signedTx;
}
```

## Best Practices

### Error Handling

```typescript
class WalletError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function safeWalletOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 4001) {
      throw new WalletError('User rejected request', 'USER_REJECTED');
    } else if (error.code === -32002) {
      throw new WalletError('Request already pending', 'REQUEST_PENDING');
    } else if (error.message?.includes('not connected')) {
      throw new WalletError('Wallet not connected', 'NOT_CONNECTED');
    }
    throw error;
  }
}
```

### State Management

```typescript
// Using Redux Toolkit
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Connection, PublicKey } from '@saturnbtcio/arch-sdk';

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async () => {
    const response = await window.arch.connect();
    return response.publicKey;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    publicKey: null as string | null,
    connected: false,
    loading: false,
    error: null as string | null
  },
  reducers: {
    disconnect: (state) => {
      state.publicKey = null;
      state.connected = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.publicKey = action.payload;
        state.connected = true;
        state.loading = false;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Connection failed';
      });
  }
});
```

## Security Considerations

1. **Always validate addresses** before transactions
2. **Never store private keys** in frontend code
3. **Use HTTPS** in production
4. **Implement transaction limits** for automated operations
5. **Show transaction details** before signing
6. **Handle wallet disconnections** gracefully

## Resources

- [TypeScript SDK Documentation](getting-started.md)
- [React Examples](examples.md#react-hook-example)
- [Arch Network Documentation](https://docs.arch.network) 