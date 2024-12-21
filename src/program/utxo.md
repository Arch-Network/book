# UTXO (Unspent Transaction Output)

UTXOs are fundamental to Bitcoin's transaction model and are used in Arch Network to anchor program state.

## UTXO Structure

```rust,ignore
use arch_program::utxo::UtxoMeta;
use bitcoin::Txid;

#[derive(Debug, Clone, PartialEq)]
pub struct UtxoMeta {
    pub txid: [u8; 32],  // Transaction ID
    pub vout: u32,       // Output index
}

impl UtxoMeta {
    pub fn new(txid: [u8; 32], vout: u32) -> Self {
        Self { txid, vout }
    }

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

## UTXO Creation Process

### Creating a UTXO with Bitcoin RPC
```rust,ignore
use bitcoincore_rpc::{Auth, Client as RpcClient};
use bitcoin::Amount;
use arch_program::pubkey::Pubkey;

// Initialize RPC client
let rpc = RpcClient::new(
    "http://localhost:18443",
    Auth::UserPass("user".to_string(), "pass".to_string())
).unwrap();

// Create new account address
let account_address = Pubkey::new_unique();

// Send Bitcoin to create UTXO
let txid = rpc.send_to_address(
    &account_address,
    Amount::from_sat(3000),
    None,
    None,
    None,
    None,
    None,
    None
)?;
```

### Creating Account with UTXO
```rust,ignore
use arch_program::{
    system_instruction::SystemInstruction,
    pubkey::Pubkey,
};

// Create new account with UTXO
let account_pubkey = Pubkey::new_unique();
let instruction = SystemInstruction::new_create_account_instruction(
    txid.try_into().unwrap(),
    0, // vout
    account_pubkey
);
```

## UTXO Operations

Programs can:
- Create new UTXO accounts
- Read UTXO metadata
- Validate UTXO state
- Transfer UTXOs between accounts

## Best Practices

1. **Validation**
   - Always check UTXO initialization
   - Verify UTXO ownership
   - Handle Bitcoin confirmations

2. **State Management**
   - Track UTXO states
   - Handle reorgs
   - Maintain UTXO sets

<!-- Internal -->
[Account]: account.md
[Program]: program.md
[System Program]: ../system-program/system-program.md
