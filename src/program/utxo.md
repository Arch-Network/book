# UTXO (Unspent Transaction Output)

UTXOs (Unspent Transaction Outputs) are fundamental to Bitcoin's transaction model and serve as the foundation for state management in Arch Network. Unlike account-based systems that track balances, UTXOs represent discrete "coins" that must be consumed entirely in transactions.

## Core Concepts

### What is a UTXO?
- A UTXO represents an unspent output from a previous transaction
- Each UTXO is uniquely identified by a transaction ID (txid) and output index (vout)
- UTXOs are immutable - they can only be created or spent, never modified
- Once spent, a UTXO cannot be reused (prevents double-spending)

### Role in Arch Network
- UTXOs anchor program state to Bitcoin's security model
- They provide deterministic state transitions
- Enable atomic operations across the network
- Allow for provable ownership and state validation

## UTXO Structure

The `UtxoMeta` struct encapsulates the core UTXO identification data:

```rust,ignore
use arch_program::utxo::UtxoMeta;
use bitcoin::Txid;

#[derive(Debug, Clone, PartialEq)]
pub struct UtxoMeta {
    pub txid: [u8; 32],  // Bitcoin transaction ID (32 bytes)
    pub vout: u32,       // Output index in the transaction
}

impl UtxoMeta {
    /// Creates a new UTXO metadata instance
    pub fn new(txid: [u8; 32], vout: u32) -> Self {
        Self { txid, vout }
    }

    /// Deserializes UTXO metadata from a byte slice
    /// Format: [txid(32 bytes)][vout(4 bytes)]
    pub fn from_slice(data: &[u8]) -> Self {
        let mut txid = [0u8; 32];
        txid.copy_from_slice(&data[0..32]);
        let vout = u32::from_le_bytes([
            data[32], data[33], data[34], data[35]
        ]);
        Self { txid, vout }
    }
}
```

## UTXO Lifecycle

### 1. Creation Process

#### Creating a UTXO with Bitcoin RPC
```rust,ignore
use bitcoincore_rpc::{Auth, Client as RpcClient, RpcApi};
use bitcoin::{Amount, Address};
use arch_program::pubkey::Pubkey;

// Initialize Bitcoin RPC client
let rpc = RpcClient::new(
    "http://localhost:18443",  // Bitcoin node RPC endpoint
    Auth::UserPass(
        "user".to_string(),
        "pass".to_string()
    )
).expect("Failed to create RPC client");

// Generate a new account address
let account_address = Pubkey::new_unique();
let btc_address = Address::from_pubkey(&account_address);

// Create UTXO by sending Bitcoin
// Parameters explained:
// - address: Destination Bitcoin address
// - amount: Amount in satoshis (3000 sats = 0.00003 BTC)
// - comment: Optional transaction comment
// - replaceable: Whether the tx can be replaced (RBF)
let txid = rpc.send_to_address(
    &btc_address,
    Amount::from_sat(3000),
    Some("Create Arch UTXO"),  // Comment
    None,                      // Comment_to
    Some(true),               // Replaceable
    None,                     // Fee rate
    None,                     // Fee estimate mode
    None                      // Avoid reuse
)?;

// Wait for confirmation (recommended)
rpc.wait_for_confirmation(&txid, 1)?;
```

#### Creating an Arch Account with UTXO
```rust,ignore
use arch_program::{
    system_instruction::SystemInstruction,
    pubkey::Pubkey,
    transaction::Transaction,
};

// Create new program account backed by UTXO
let account_pubkey = Pubkey::new_unique();
let instruction = SystemInstruction::new_create_account_instruction(
    txid.try_into().unwrap(),
    0,  // vout index
    account_pubkey,
    // Additional parameters like:
    // - space: Amount of space to allocate
    // - owner: Program that owns the account
);

// Build and sign transaction
let transaction = Transaction::new_signed_with_payer(
    &[instruction],
    Some(&payer.pubkey()),
    &[&payer],
    recent_blockhash
);
```

### 2. State Management

```rust,ignore
// Example UTXO state tracking
#[derive(Debug)]
pub struct UtxoState {
    pub meta: UtxoMeta,
    pub status: UtxoStatus,
    pub owner: Pubkey,
    pub created_at: i64,
    pub spent_at: Option<i64>,
}

#[derive(Debug)]
pub enum UtxoStatus {
    Pending,    // Waiting for confirmations
    Active,     // Confirmed and spendable
    Spent,      // UTXO has been consumed
    Invalid,    // UTXO was invalidated (e.g., by reorg)
}
```

## Error Handling

Common UTXO-related errors to handle:

```rust,ignore
pub enum UtxoError {
    NotFound,                    // UTXO doesn't exist
    AlreadySpent,               // UTXO was already consumed
    InsufficientConfirmations,  // Not enough confirmations
    InvalidOwner,               // Unauthorized attempt to spend
    Reorged,                    // UTXO invalidated by reorg
    InvalidVout,                // Output index doesn't exist
    SerializationError,         // Data serialization failed
}
```

## Related Topics
- [Account Model](account.md) - How UTXOs relate to Arch accounts
- [Program State](program.md) - Using UTXOs for program state
- [System Program](../system-program/system-program.md) - Core UTXO operations

<!-- Internal -->
[Account]: account.md
[Program]: program.md
[System Program]: ../system-program/system-program.md
