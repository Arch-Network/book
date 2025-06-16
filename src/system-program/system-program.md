# System Program

The Arch System Program is the core program that manages fundamental account operations on the Arch Network. This program provides essential functionality for account creation, ownership management, UTXO anchoring, and lamport transfers.

## Overview

The System Program handles:
- **Account Creation**: Creating new accounts with specified ownership and data allocation
- **UTXO Integration**: Anchoring accounts to Bitcoin UTXOs for native Bitcoin integration
- **Ownership Management**: Transferring account ownership between programs
- **Lamport Transfers**: Moving lamports (the base unit of value) between accounts
- **Space Allocation**: Allocating data storage space for accounts

## Available Instructions

### CreateAccount

Creates a new account with the specified parameters.

**Parameters:**
- `lamports: u64` - Number of lamports to transfer to the new account
- `space: u64` - Number of bytes of memory to allocate
- `owner: Pubkey` - Address of the program that will own the new account

**Account References:**
1. `[WRITE, SIGNER]` Funding account (payer)
2. `[WRITE, SIGNER]` New account to create

**Example:**
```rust
use arch_program::{
    system_instruction,
    pubkey::Pubkey,
};

let instruction = system_instruction::create_account(
    &from_pubkey,
    &to_pubkey,
    1_000_000,  // lamports
    165,        // space in bytes
    &owner_pubkey,
);
```

### CreateAccountWithAnchor

Creates a new account and anchors it to a specific Bitcoin UTXO.

**Parameters:**
- `lamports: u64` - Number of lamports to transfer
- `space: u64` - Number of bytes to allocate
- `owner: Pubkey` - Program that will own the account
- `txid: [u8; 32]` - Bitcoin transaction ID
- `vout: u32` - Output index in the Bitcoin transaction

**Account References:**
1. `[WRITE, SIGNER]` Funding account
2. `[WRITE, SIGNER]` New account to create

**Example:**
```rust
let instruction = system_instruction::create_account_with_anchor(
    &from_pubkey,
    &to_pubkey,
    1_000_000,  // lamports
    165,        // space
    &owner_pubkey,
    txid,       // Bitcoin transaction ID
    vout,       // Bitcoin output index
);
```

### Assign

Changes the owner of an existing account.

**Parameters:**
- `owner: Pubkey` - New owner program

**Account References:**
1. `[WRITE, SIGNER]` Account to reassign

**Example:**
```rust
let instruction = system_instruction::assign(
    &account_pubkey,
    &new_owner_pubkey,
);
```

### Anchor

Anchors an existing account to a Bitcoin UTXO.

**Parameters:**
- `txid: [u8; 32]` - Bitcoin transaction ID
- `vout: u32` - Output index

**Account References:**
1. `[WRITE, SIGNER]` Account to anchor

### Transfer

Transfers lamports from one account to another.

**Parameters:**
- `lamports: u64` - Amount to transfer

**Account References:**
1. `[WRITE, SIGNER]` Source account
2. `[WRITE]` Destination account

**Example:**
```rust
let instruction = system_instruction::transfer(
    &from_pubkey,
    &to_pubkey,
    500_000,  // lamports to transfer
);
```

### Allocate

Allocates space in an account without funding it.

**Parameters:**
- `space: u64` - Number of bytes to allocate

**Account References:**
1. `[WRITE, SIGNER]` Account to allocate space for

**Example:**
```rust
let instruction = system_instruction::allocate(
    &account_pubkey,
    1024,  // bytes to allocate
);
```

## Error Handling

The System Program can return the following errors:

- `AccountAlreadyInUse` - Account with the same address already exists
- `ResultWithNegativeLamports` - Account doesn't have enough lamports for operation
- `InvalidProgramId` - Cannot assign account to this program ID
- `InvalidAccountDataLength` - Cannot allocate account data of this length
- `MaxSeedLengthExceeded` - Requested seed length is too long
- `AddressWithSeedMismatch` - Address doesn't match derived seed

## Important Constants

```rust
// Minimum lamports required for any account
pub const MIN_ACCOUNT_LAMPORTS: u64 = 1024;

// Maximum permitted data length for accounts
pub const MAX_PERMITTED_DATA_LENGTH: usize = 10 * 1024 * 1024; // 10MB
```

## Best Practices

### Account Creation
1. **Always fund with sufficient lamports**: Accounts need at least `MIN_ACCOUNT_LAMPORTS` to be created
2. **Use appropriate space allocation**: Allocate only the space you need to minimize costs
3. **Set correct ownership**: Ensure the owner program can properly manage the account

### UTXO Integration
1. **Verify UTXO existence**: Ensure the referenced Bitcoin UTXO exists and is confirmed
2. **Use proper confirmation counts**: Wait for sufficient Bitcoin confirmations before using anchored accounts
3. **Handle reorgs gracefully**: Account for potential Bitcoin reorganizations

### Security Considerations
1. **Validate signers**: Always verify that required accounts are properly signed
2. **Check ownership**: Verify account ownership before operations
3. **Handle edge cases**: Account for insufficient funds, invalid parameters, etc.

## Integration with Bitcoin

The System Program's UTXO anchoring functionality enables direct integration with Bitcoin:

- **Account-UTXO Mapping**: Accounts can be directly linked to Bitcoin UTXOs
- **Ownership Verification**: Bitcoin signatures can prove account ownership
- **State Synchronization**: Account states can be synchronized with Bitcoin state

This integration provides:
- Native Bitcoin security guarantees
- Direct UTXO management capabilities
- Seamless Bitcoin transaction integration
- Provable ownership and state anchoring

## Related Documentation

- [Account Model](../program/accounts.md) - Understanding Arch's account structure
- [Instructions and Messages](../program/instructions-and-messages.md) - How instructions work
- [Bitcoin Integration](../concepts/bitcoin-integration.md) - Bitcoin-native features
- [UTXO Management](../program/utxo.md) - Working with Bitcoin UTXOs
