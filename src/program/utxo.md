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
#[derive(Clone, Debug, PartialEq, Eq)]
#[repr(C)]
pub struct UtxoMeta([u8; 36]);

impl UtxoMeta {
    pub fn from(txid: [u8; 32], vout: u32) -> Self {
        let mut data: [u8; 36] = [0; 36];
        data[..32].copy_from_slice(&txid);
        data[32..].copy_from_slice(&vout.to_le_bytes());
        Self(data)
    }

    pub fn from_outpoint(txid: Txid, vout: u32) -> Self {
        let mut data: [u8; 36] = [0; 36];
        data[..32].copy_from_slice(
            &bitcoin::consensus::serialize(&txid)
                .into_iter()
                .rev()
                .collect::<Vec<u8>>(),
        );
        data[32..].copy_from_slice(&vout.to_le_bytes());
        Self(data)
    }

    pub fn to_outpoint(&self) -> OutPoint {
        OutPoint {
            txid: Txid::from_str(&hex::encode(self.txid())).unwrap(),
            vout: self.vout(),
        }
    }

    pub fn from_slice(data: &[u8]) -> Self {
        Self(data[..36].try_into().expect("utxo meta is 36 bytes long"))
    }

    pub fn txid(&self) -> &[u8] {
        &self.0[..32]
    }

    pub fn vout(&self) -> u32 {
        u32::from_le_bytes(self.0[32..].try_into().expect("utxo meta unreachable"))
    }

    pub fn serialize(&self) -> [u8; 36] {
        self.0
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

### 2. Validation & Usage

Programs must implement proper UTXO validation:

```rust,ignore
fn validate_utxo(utxo: &UtxoMeta) -> Result<(), ProgramError> {
    // 1. Verify UTXO exists on Bitcoin
    let btc_tx = rpc.get_transaction(&utxo.txid)?;
    
    // 2. Check confirmation count
    if btc_tx.confirmations < MIN_CONFIRMATIONS {
        return Err(ProgramError::InsufficientConfirmations);
    }
    
    // 3. Verify output index exists
    if utxo.vout() as usize >= btc_tx.vout.len() {
        return Err(ProgramError::InvalidVout);
    }
    
    // 4. Verify UTXO is unspent
    if is_spent(utxo) {
        return Err(ProgramError::UtxoAlreadySpent);
    }
    
    Ok(())
}
```

### 3. State Management

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

## Best Practices

1. **Validation**
   - Always verify UTXO existence on Bitcoin
   - Check for sufficient confirmations (recommended: 6+)
   - Validate ownership and spending conditions
   - Handle Bitcoin reorgs that might invalidate UTXOs

2. **State Management**
   - Implement robust UTXO tracking
   - Handle edge cases (reorgs, conflicting txs)
   - Consider implementing UTXO caching for performance
   - Maintain accurate UTXO sets for your program

3. **Security**
   - Never trust client-provided UTXO data without verification
   - Implement proper access controls
   - Consider timelock constraints for sensitive operations
   - Monitor for suspicious UTXO patterns

4. **Performance**
   - Batch UTXO operations when possible
   - Implement efficient UTXO lookup mechanisms
   - Consider UTXO consolidation strategies
   - Cache frequently accessed UTXO data

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
