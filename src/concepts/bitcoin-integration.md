# Bitcoin Integration

Arch Network provides direct integration with Bitcoin, enabling programs to interact with Bitcoin's UTXO model while maintaining Bitcoin's security guarantees. This document details how Arch Network integrates with Bitcoin.

## Architecture Overview

```ascii
┌──────────────────────────────────────────────────────────┐
│                     Bitcoin Network                      │
│                           ▲                              │
│                           │                              │
│               ┌───────────┴──────────┐                  │
│               │    Bitcoin Node      │                  │
│               └───────────┬──────────┘                  │
└───────────────────────────┼──────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────┐
│              Arch Network │                              │
│                          │                              │
│         ┌────────────────┴───────────────┐              │
│         │        Leader Node             │              │
│         │   (Bitcoin Integration)        │              │
│         └────────────────┬───────────────┘              │
│                          │                              │
│         ┌────────────────┴───────────────┐              │
│         │      Validator Network         │              │
│         │                               │              │
│         │  ┌─────────┐     ┌─────────┐  │              │
│         │  │Program 1│ ... │Program N│  │              │
│         │  └─────────┘     └─────────┘  │              │
│         └───────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. UTXO Management
Arch Network manages Bitcoin UTXOs through a specialized system:

```ascii
┌─────────────────┐      ┌──────────────┐
│  Bitcoin UTXO   │      │ Arch Account │
│                 │      │              │
│  ┌───────────┐  │      │ ┌────────┐   │
│  │Transaction│  │      │ │ UTXO   │   │
│  │   ID      │──┼──────┼─►Meta    │   │
│  └───────────┘  │      │ └────────┘   │
│  ┌───────────┐  │      │ ┌────────┐   │
│  │Output     │  │      │ │Program │   │
│  │Index      │──┼──────┼─►State   │   │
│  └───────────┘  │      │ └────────┘   │
└─────────────────┘      └──────────────┘
```

```rust
// UTXO Metadata Structure
pub struct UtxoMeta {
    pub txid: [u8; 32],  // Transaction ID
    pub vout: u32,       // Output index
}
```

Key operations:
- UTXO creation and tracking
- Ownership validation
- State anchoring
- Transaction management

### 2. Bitcoin RPC Integration

```ascii
┌──────────────┐    ┌───────────────┐    ┌─────────────┐
│  Arch        │    │  Bitcoin RPC  │    │  Bitcoin    │
│  Program     │───►│  Interface    │───►│  Node       │
└──────────────┘    └───────────────┘    └─────────────┘
       │                    ▲                   │
       │                    │                   │
       │            ┌───────┴──────┐           │
       └───────────►│ Configuration│           │
                   └──────────────┘            ▼
                                         ┌─────────────┐
                                         │  Bitcoin    │
                                         │  Network    │
                                         └─────────────┘
```

Programs can interact with Bitcoin through RPC calls:
```rust
// Bitcoin RPC Configuration
pub struct BitcoinRpcConfig {
    pub endpoint: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub wallet: Option<String>,
}
```

## Transaction Flow

```ascii
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Program  │   │ Leader   │   │Validator │   │ Bitcoin  │
│          │   │ Node     │   │ Network  │   │ Network  │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │
     │ Create UTXO  │              │              │
     │─────────────►│              │              │
     │              │              │              │
     │              │ Validate     │              │
     │              │──────────────►│              │
     │              │              │              │
     │              │ Sign         │              │
     │              │◄─────────────│              │
     │              │              │              │
     │              │ Submit TX    │              │
     │              │─────────────────────────────►│
     │              │              │              │
     │              │ Confirmation │              │
     │◄────────────────────────────────────────────│
     │              │              │              │
┌────┴─────┐   ┌────┴─────┐   ┌────┴─────┐   ┌────┴─────┐
│ Program  │   │ Leader   │   │Validator │   │ Bitcoin  │
│          │   │ Node     │   │ Network  │   │ Network  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### 1. UTXO Creation
```rust
// Create new UTXO
let txid = rpc.send_to_address(
    &account_address,
    Amount::from_sat(3000),
    None, None, None, None, None, None,
)?;

// Get transaction details
let sent_tx = rpc.get_raw_transaction(&txid, None)?;
let vout = find_output_index(&sent_tx, &account_address);
```

### 2. Account Creation
```rust
// Create account with UTXO reference
let instruction = SystemInstruction::new_create_account_instruction(
    txid.try_into().unwrap(),
    vout,
    account_pubkey
);
```

### 3. State Management
- UTXO tracking
- State transitions
- Transaction validation
- Finality confirmation

## Security Model

### 1. Multi-Signature Operations
- Threshold signing
- Signature aggregation
- Key management
- Transaction validation

### 2. State Protection
- UTXO ownership validation
- Script verification
- State consistency
- Reorg handling

### 3. Network Security
- Bitcoin finality
- Transaction confirmation
- Network synchronization
- State verification

## Best Practices

### 1. UTXO Management
- Track UTXO states
- Handle confirmations
- Manage change outputs
- Validate ownership

### 2. Transaction Handling
- Proper fee calculation
- Confirmation monitoring
- Error handling
- State verification

### 3. Security Considerations
- Key management
- Transaction validation
- State consistency
- Network monitoring

## Development Guidelines

### 1. Local Development
```bash
# Configure Bitcoin RPC for local development
BITCOIN_RPC_ENDPOINT=127.0.0.1
BITCOIN_RPC_PORT=18443
BITCOIN_RPC_USERNAME=bitcoin
BITCOIN_RPC_PASSWORD=bitcoin
```

### 2. Testing
- Use testnet for development
- Monitor UTXO states
- Handle edge cases
- Validate transactions

### 3. Production
- Secure key management
- Monitor Bitcoin network
- Handle reorgs
- Maintain state consistency

<!-- Internal -->
[UTXO]: ../program/utxo.md
[Program]: ../program/program.md
[Instructions]: ../program/instructions-and-messages.md
[Network Architecture]: ./network-architecture.md 