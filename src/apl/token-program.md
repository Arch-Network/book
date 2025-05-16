# Token Program

The APL Token Program is the foundation for creating and managing fungible tokens on the Arch Network. This documentation provides a comprehensive guide for developers implementing token functionality in their applications.

## Overview

The Token Program enables:
- Creation and management of fungible tokens (mints)
- Token account management
- Token transfers and delegations
- Multisignature authorities
- Account freezing and thawing

## Program ID

```text
apl-token00000000000000000000000
```

## Account Types

### Mint Account
The central record for a token type, containing:

| Field | Type | Description |
|-------|------|-------------|
| `mint_authority` | `COption<Pubkey>` | Optional authority to mint new tokens |
| `supply` | `u64` | Total number of tokens in circulation |
| `decimals` | `u8` | Number of decimal places |
| `is_initialized` | `bool` | Has this mint been initialized |
| `freeze_authority` | `COption<Pubkey>` | Optional authority to freeze token accounts |

### Token Account
Holds token balances for a specific mint:

| Field | Type | Description |
|-------|------|-------------|
| `mint` | `Pubkey` | The token mint this account holds |
| `owner` | `Pubkey` | Owner of this account |
| `amount` | `u64` | Number of tokens held |
| `delegate` | `COption<Pubkey>` | Optional delegate authority |
| `state` | `AccountState` | Account state (Uninitialized/Initialized/Frozen) |
| `delegated_amount` | `u64` | Amount delegated |
| `close_authority` | `COption<Pubkey>` | Optional authority to close the account |

### Multisig Account
Enables shared authority over token operations:

| Field | Type | Description |
|-------|------|-------------|
| `m` | `u8` | Number of required signers |
| `n` | `u8` | Number of valid signers |
| `is_initialized` | `bool` | Has this multisig been initialized |
| `signers` | `[Pubkey; MAX_SIGNERS]` | Array of valid signer addresses |

## Instructions

### Token Creation and Initialization

#### InitializeMint
Creates a new token type.

```rust,ignore
pub struct InitializeMint {
    pub decimals: u8,
    pub mint_authority: Pubkey,
    pub freeze_authority: COption<Pubkey>,
}
```

Required accounts:
- `[writable]` The mint to initialize

Example:
```rust,ignore
let mint = Keypair::new();
let mint_authority = Keypair::new();
let decimals = 9;

let instruction = initialize_mint(
    &mint.pubkey(),
    &mint_authority.pubkey(),
    None, // No freeze authority
    decimals,
)?;
```

#### InitializeAccount
Creates a new account to hold tokens.

Required accounts:
- `[writable]` The account to initialize
- `[]` The mint this account is for
- `[]` The owner of the new account

Example:
```rust,ignore
let account = Keypair::new();
let owner = Keypair::new();

let instruction = initialize_account(
    &account.pubkey(),
    &mint.pubkey(),
    &owner.pubkey(),
)?;
```

#### InitializeMultisig
Creates a new multisignature authority.

```rust
pub struct InitializeMultisig {
    pub m: u8, // Number of required signers
}
```

Required accounts:
- `[writable]` The multisig to initialize
- `[]` The signer accounts (1 to 11)

Example:
```rust,ignore
let multisig = Keypair::new();
let signers = vec![signer1.pubkey(), signer2.pubkey(), signer3.pubkey()];
let min_signers = 2;

let instruction = initialize_multisig(
    &multisig.pubkey(),
    &signers,
    min_signers,
)?;
```

### Token Operations

#### MintTo
Creates new tokens in an account.

```rust
pub struct MintTo {
    pub amount: u64,
}
```

Required accounts:
- `[writable]` The mint
- `[writable]` The account to mint to
- `[signer]` The mint authority

Example:
```rust,ignore
let amount = 1_000_000_000; // 1 token with 9 decimals

let instruction = mint_to(
    &mint.pubkey(),
    &destination.pubkey(),
    &mint_authority.pubkey(),
    amount,
)?;
```

#### Transfer
Moves tokens between accounts.

```rust
pub struct Transfer {
    pub amount: u64,
}
```

Required accounts:
- `[writable]` Source account
- `[writable]` Destination account
- `[signer]` Owner/delegate authority

Example:
```rust,ignore
let amount = 50_000_000; // 0.05 tokens with 9 decimals

let instruction = transfer(
    &source.pubkey(),
    &destination.pubkey(),
    &owner.pubkey(),
    amount,
)?;
```

#### Burn
Removes tokens from circulation.

```rust
pub struct Burn {
    pub amount: u64,
}
```

Required accounts:
- `[writable]` The account to burn from
- `[writable]` The token mint
- `[signer]` The owner/delegate

Example:
```rust,ignore
let amount = 1_000_000_000; // 1 token with 9 decimals

let instruction = burn(
    &account.pubkey(),
    &mint.pubkey(),
    &owner.pubkey(),
    amount,
)?;
```

### Delegation

#### Approve
Delegates authority over tokens.

```rust
pub struct Approve {
    pub amount: u64,
}
```

Required accounts:
- `[writable]` Source account
- `[]` Delegate
- `[signer]` Source account owner

Example:
```rust,ignore
let amount = 5_000_000_000; // 5 tokens with 9 decimals

let instruction = approve(
    &source.pubkey(),
    &delegate.pubkey(),
    &owner.pubkey(),
    amount,
)?;
```

#### Revoke
Removes delegated authority.

Required accounts:
- `[writable]` Source account
- `[signer]` Source account owner

Example:
```rust,ignore
let instruction = revoke(
    &source.pubkey(),
    &owner.pubkey(),
)?;
```

### Account Management

#### SetAuthority
Changes an authority on a mint or account.

```rust,ignore
pub struct SetAuthority {
    pub authority_type: AuthorityType,
    pub new_authority: COption<Pubkey>,
}
```

Required accounts:
- `[writable]` Mint/account to change
- `[signer]` Current authority

Example:
```rust,ignore
let instruction = set_authority(
    &mint.pubkey(),
    &current_authority.pubkey(),
    Some(&new_authority.pubkey()),
    AuthorityType::MintTokens,
)?;
```

#### CloseAccount
Closes a token account with zero balance.

Required accounts:
- `[writable]` Account to close
- `[writable]` Destination for rent funds
- `[signer]` Account owner

Example:
```rust,ignore
let instruction = close_account(
    &account.pubkey(),
    &destination.pubkey(),
    &owner.pubkey(),
)?;
```

## Error Handling

The program defines specific error types for common failure cases:

```rust
pub enum TokenError {
    NotRentExempt,           // Account balance too low
    InsufficientFunds,       // Not enough tokens
    InvalidMint,             // Invalid mint account
    MintMismatch,           // Mint doesn't match
    OwnerMismatch,          // Wrong account owner
    FixedSupply,            // Mint authority disabled
    AlreadyInUse,           // Account already initialized
    InvalidNumberOfProvidedSigners,
    InvalidNumberOfRequiredSigners,
    UninitializedState,     // Account not initialized
    NativeNotSupported,     // Instruction not for native tokens
    NonNativeHasBalance,    // Non-native account with balance
    InvalidInstruction,     // Invalid instruction data
    InvalidState,           // Account in invalid state
    Overflow,               // Operation overflowed
    AuthorityTypeNotSupported,
    MintCannotFreeze,       // Mint has no freeze authority
    AccountFrozen,          // Account is frozen
    // ... other errors
}
```

## Best Practices

### Security
1. **Account Validation**
   - Always verify account ownership
   - Check account states before operations
   - Validate mint associations

2. **Authority Management**
   - Use multisig for sensitive operations
   - Carefully manage mint/freeze authorities
   - Have clear authority transfer procedures

3. **Operation Safety**
   - Use checked math operations
   - Handle frozen accounts appropriately
   - Implement proper error handling

### Performance
1. **Transaction Optimization**
   - Combine related operations in one transaction
   - Minimize account lookups
   - Pre-allocate accounts when possible

2. **Account Management**
   - Close unused accounts
   - Maintain rent-exempt balances
   - Use Associated Token Accounts when appropriate

## Common Scenarios

### Creating a New Token

```rust,ignore
// 1. Create mint account
let mint = Keypair::new();
let mint_rent = get_minimum_balance_for_rent_exemption(Mint::LEN)?;

let create_mint_account = system_instruction::create_account(
    &payer.pubkey(),
    &mint.pubkey(),
    mint_rent,
    Mint::LEN as u64,
    &token_program_id,
);

// 2. Initialize mint
let init_mint = initialize_mint(
    &mint.pubkey(),
    &mint_authority.pubkey(),
    Some(&freeze_authority.pubkey()),
    9, // decimals
)?;

// 3. Create token account
let account = Keypair::new();
let account_rent = get_minimum_balance_for_rent_exemption(Account::LEN)?;

let create_account = system_instruction::create_account(
    &payer.pubkey(),
    &account.pubkey(),
    account_rent,
    Account::LEN as u64,
    &token_program_id,
);

// 4. Initialize token account
let init_account = initialize_account(
    &account.pubkey(),
    &mint.pubkey(),
    &owner.pubkey(),
)?;

// 5. Combine into a single transaction
let transaction = Transaction::new_signed_with_payer(
    &[
        create_mint_account,
        init_mint,
        create_account,
        init_account,
    ],
    Some(&payer.pubkey()),
    &[&payer, &mint, &account],
    recent_blockhash,
);
```

### Implementing a Token Transfer

```rust,ignore
// 1. Get token accounts
let source = get_associated_token_address(&source_owner, &mint);
let destination = get_associated_token_address(&destination_owner, &mint);

// 2. Create transfer instruction
let transfer = transfer(
    &source,
    &destination,
    &source_owner,
    amount,
)?;

// 3. Send transaction
let transaction = Transaction::new_signed_with_payer(
    &[transfer],
    Some(&payer.pubkey()),
    &[&payer, &source_owner],
    recent_blockhash,
);
```

## Testing

The Token Program includes comprehensive tests. When implementing token functionality, you should test:

1. **Basic Operations**
   - Mint initialization
   - Account creation
   - Token transfers
   - Balance checks

2. **Authority Controls**
   - Authority validation
   - Multisig operations
   - Authority transfers

3. **Error Cases**
   - Insufficient funds
   - Invalid authorities
   - Account state violations

Example test:
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_transfer() {
        let program_id = token_program_id();
        let mint = Keypair::new();
        let source = Keypair::new();
        let destination = Keypair::new();
        let owner = Keypair::new();

        // Initialize mint and accounts
        // ... setup code ...

        // Test transfer
        let amount = 100;
        let result = transfer(
            &source.pubkey(),
            &destination.pubkey(),
            &owner.pubkey(),
            amount,
        );

        assert!(result.is_ok());
        // Verify balances
        // ... verification code ...
    }
}
```
