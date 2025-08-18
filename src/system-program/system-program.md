# System Program

The Arch System Program is the core program that manages fundamental account operations on the Arch Network. This program provides essential functionality for account creation, ownership management, UTXO anchoring, and lamport transfers.

## Overview

The System Program handles:
- **Account Creation**: Creating new accounts with specified ownership and data allocation
- **UTXO Integration**: Anchoring accounts to Bitcoin UTXOs for native Bitcoin integration
- **Ownership Management**: Transferring account ownership between programs
- **Lamport Transfers**: Moving lamports (the base unit of value) between accounts
- **Space Allocation**: Allocating data storage space for accounts

## Built-in Programs

Arch Network includes several built-in programs that provide essential functionality:

### System Program
The core system program for account management and basic operations.

### APL Token Program
Comprehensive token management with SPL token compatibility.

### Associated Token Account (ATA) Program
Automatic token account creation and management.

### Compute Budget Program
Transaction compute unit management and fee optimization.

### Stake Program
Validator staking and delegation management.

### Vote Program
Governance and voting mechanisms.

### Loader Program
Program deployment and upgrade management.

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

**Example:**
```rust
let instruction = system_instruction::anchor(
    &account_pubkey,
    txid,       // Bitcoin transaction ID
    vout,       // Bitcoin output index
);
```

### Transfer

Transfers lamports between accounts.

**Parameters:**
- `lamports: u64` - Number of lamports to transfer

**Account References:**
1. `[WRITE, SIGNER]` Source account
2. `[WRITE]` Destination account

**Example:**
```rust
let instruction = system_instruction::transfer(
    &from_pubkey,
    &to_pubkey,
    1_000_000,  // lamports
);
```

## Program Interaction

### Using Built-in Programs

```rust
use arch_program::{
    system_instruction,
    system_program,
    pubkey::Pubkey,
};

// Create a new account
let create_account_ix = system_instruction::create_account(
    &payer_pubkey,
    &new_account_pubkey,
    rent_exemption_amount,
    space,
    &owner_program_pubkey,
);

// Transfer lamports
let transfer_ix = system_instruction::transfer(
    &source_pubkey,
    &destination_pubkey,
    amount,
);

// Assign new owner
let assign_ix = system_instruction::assign(
    &account_pubkey,
    &new_owner_pubkey,
);
```

### Program Addresses

| Program | Address | Description |
|---------|---------|-------------|
| System | `11111111111111111111111111111111` | Core system operations |
| APL Token | `apl-token00000000000000000000000` | Token management |
| ATA | `ATokenGPvbdGVxr1b2hvUbsQ8U5V9kCA` | Associated token accounts |
| Compute Budget | `ComputeBudget111111111111111111111111111111` | Compute unit management |
| Stake | `Stake1111111111111111111111111111111111111111` | Staking operations |
| Vote | `Vote111111111111111111111111111111111111111111` | Voting operations |
| Loader | `BPFLoader1111111111111111111111111111111111` | Program deployment |

## Best Practices

### Account Management
1. **Proper Sizing**: Allocate appropriate space for account data
2. **Rent Exemption**: Ensure accounts have sufficient lamports for rent exemption
3. **Ownership**: Carefully manage account ownership transfers
4. **UTXO Anchoring**: Use UTXO anchoring for Bitcoin integration

### Security Considerations
1. **Authority Validation**: Always verify account authorities
2. **Input Validation**: Validate all input parameters
3. **Error Handling**: Implement proper error handling for failed operations
4. **Access Control**: Restrict access to sensitive operations

### Performance Optimization
1. **Batch Operations**: Group related operations when possible
2. **Space Efficiency**: Minimize account space allocation
3. **Compute Budget**: Use compute budget program for optimization
4. **Caching**: Cache frequently accessed account data

## Error Handling

### Common Errors

| Error | Description | Resolution |
|-------|-------------|------------|
| `InsufficientFunds` | Account has insufficient lamports | Fund the account or reduce amount |
| `InvalidAccountData` | Account data is invalid | Reinitialize the account |
| `InvalidOwner` | Invalid account owner | Check ownership requirements |
| `AccountInUse` | Account is already in use | Use a different account or wait |

### Error Recovery

```rust
use arch_program::system_instruction;

match system_instruction::create_account(/* params */) {
    Ok(instruction) => {
        // Process instruction
    }
    Err(SystemError::InsufficientFunds) => {
        // Handle insufficient funds
    }
    Err(SystemError::InvalidAccountData) => {
        // Handle invalid account data
    }
    Err(e) => {
        // Handle other errors
    }
}
```

## Integration Examples

### Creating a Token Mint

```rust
// Create mint account
let create_mint_ix = system_instruction::create_account(
    &payer_pubkey,
    &mint_pubkey,
    rent_exemption_amount,
    Mint::LEN as u64,
    &apl_token::id(),
);

// Initialize mint (using APL token program)
let init_mint_ix = apl_token::instruction::initialize_mint(
    &apl_token::id(),
    &mint_pubkey,
    &mint_authority_pubkey,
    None,
    decimals,
)?;
```

### Setting Up Associated Token Account

```rust
// Create ATA account
let create_ata_ix = associated_token_account::instruction::create(
    &payer_pubkey,
    &owner_pubkey,
    &mint_pubkey,
    &token_program_id,
);

// Fund ATA account
let fund_ata_ix = system_instruction::transfer(
    &payer_pubkey,
    &ata_pubkey,
    rent_exemption_amount,
);
```

## Next Steps

- **Token Operations**: Learn about [APL Token Management](../guides/how-to-create-a-fungible-token.md)
- **Program Development**: Explore [Writing Your First Program](../guides/writing-your-first-program.md)
- **Advanced Features**: Discover [Core Programs](../concepts/architecture.md#core-programs)
- **Integration**: Understand [Bitcoin Integration](../concepts/bitcoin-integration.md)
