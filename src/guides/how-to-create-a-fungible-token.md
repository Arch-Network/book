# Using APL Tokens on Arch Network

This guide shows you how to work with fungible tokens on Arch Network using the built-in **APL (Arch Program Library) Token Program**. APL tokens are based on Solana's SPL token standard and provide a robust foundation for creating and managing tokens on Arch Network.

## What You'll Learn

By the end of this guide, you'll understand how to:
- **Create token mints** using the APL token program
- **Initialize token accounts** for holding tokens
- **Mint tokens** to accounts
- **Transfer tokens** between accounts
- **Approve delegations** for spending tokens
- **Burn tokens** and manage token lifecycle

## Overview

The APL Token Program is Arch Network's native token standard, providing:
- **SPL Token Compatibility**: Based on Solana's proven token standard
- **Bitcoin Integration**: All operations are recorded on Bitcoin
- **Comprehensive Features**: Minting, transferring, burning, delegation, freezing
- **Multisig Support**: Multiple signature authorities for enhanced security

## Prerequisites

Before starting, ensure you have:
- **Rust 1.70+** and Cargo installed ([Install Rust](https://rustup.rs/))
- **Arch Network CLI** - [Download Latest](https://github.com/Arch-Network/arch-network/releases/latest)
- **Running validator** (see [Validator Setup Guide](./how-to-configure-local-validator-bitcoin-testnet4.md))
- **Basic familiarity** with Arch Network program development

## APL Token Program ID

The APL Token Program has a fixed program ID:
```text
apl-token00000000000000000000000
```

## Step 1: Project Setup

### 1.1 Create Project Structure

```bash
# Create project directory
mkdir arch-token-example
cd arch-token-example

# Initialize Rust project
cargo init --bin
```

### 1.2 Configure Dependencies

**Cargo.toml**
```toml
[package]
name = "arch_token_example"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_sdk = "0.5.4"
arch_program = "0.5.4"
arch_test_sdk = "0.5.4"
apl-token = { git = "https://github.com/Arch-Network/arch-network", branch = "dev", features = ["no-entrypoint"] }
apl-associated-token-account = { git = "https://github.com/Arch-Network/arch-network", branch = "dev", features = ["no-entrypoint"] }
borsh = { version = "1.5.1", features = ["derive"] }
bitcoincore-rpc = "0.19.0"
bitcoin = { version = "0.32.3", features = ["serde", "rand"] }
hex = "0.4.3"
log = "0.4"
env_logger = "0.10"

[dev-dependencies]
serial_test = "3.1.1"
```

## Step 2: Basic Token Operations

### 2.1 Initialize a Token Mint

First, let's create a new token mint:

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
    sanitized::ArchMessage,
    account::MIN_ACCOUNT_LAMPORTS,
    system_instruction::create_account,
};
use arch_sdk::{build_and_sign_transaction, generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::{create_and_fund_account_with_faucet, send_transactions_and_wait},
    instructions::initialize_mint_token,
};

fn main() {
    env_logger::init();
    
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    // Create mint using the helper function
    let (_, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("Token mint created: {}", token_mint_pubkey);
}
```

### 2.2 Create Token Accounts

Token accounts hold tokens for specific owners:

```rust
use arch_test_sdk::instructions::initialize_token_account;

fn create_user_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    user_keypair: bitcoin::key::Keypair,
) -> Pubkey {
    // The helper function creates and initializes a token account in one step
    let (_, token_account_pubkey) = initialize_token_account(
        &client,
        token_mint_pubkey,
        user_keypair,
    );
    
    println!("Token account created: {}", token_account_pubkey);
    token_account_pubkey
}
```

### 2.3 Mint Tokens

Mint new tokens to a token account:

```rust
use arch_test_sdk::instructions::mint_tokens;

fn mint_tokens_to_account(
    client: &ArchRpcClient,
    mint_pubkey: &Pubkey,
    account_pubkey: &Pubkey,
    authority_pubkey: &Pubkey,
    authority_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    mint_tokens(
        &client,
        mint_pubkey,
        account_pubkey,
        authority_pubkey,
        authority_keypair,
        amount,
    );
    
    println!("Minted {} tokens", amount);
}
```

### 2.4 Transfer Tokens

Transfer tokens between accounts:

```rust
fn transfer_tokens(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        source_account,
        destination_account,
        owner_pubkey,
        &[owner_pubkey], // Owner must sign
        amount,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[transfer_instruction],
            Some(*owner_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![owner_keypair],
        BITCOIN_NETWORK,
    );

    let processed_transactions = send_transactions_and_wait(vec![transaction]);
    assert_eq!(processed_transactions[0].status, arch_sdk::Status::Processed);
    
    println!("Transferred {} tokens", amount);
}
```

## Step 3: Advanced Token Operations

### 3.1 Approve Delegations

Allow another account to spend tokens on your behalf:

```rust
use arch_test_sdk::instructions::approve;

fn approve_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    delegate_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    approve(
        &client,
        source_account,
        delegate_account,
        owner_pubkey,
        owner_keypair,
        amount,
    );
    
    println!("Approved {} tokens for delegation", amount);
}
```

### 3.2 Burn Tokens

Remove tokens from circulation:

```rust
fn burn_tokens(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    let burn_instruction = apl_token::instruction::burn(
        &apl_token::id(),
        account_pubkey,
        mint_pubkey,
        owner_pubkey,
        &[owner_pubkey],
        amount,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[burn_instruction],
            Some(*owner_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![owner_keypair],
        BITCOIN_NETWORK,
    );

    let processed_transactions = send_transactions_and_wait(vec![transaction]);
    assert_eq!(processed_transactions[0].status, arch_sdk::Status::Processed);
    
    println!("Burned {} tokens", amount);
}
```

### 3.3 Freeze and Thaw Accounts

If you set a freeze authority when creating the mint, you can freeze/thaw accounts:

```rust
use arch_test_sdk::instructions::freeze_account;

fn freeze_token_account(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    freeze_authority_pubkey: &Pubkey,
    freeze_authority_keypair: bitcoin::key::Keypair,
) {
    freeze_account(
        &client,
        account_pubkey,
        mint_pubkey,
        freeze_authority_pubkey,
        freeze_authority_keypair,
    );
    
    println!("Account frozen");
}
```

## Step 4: Complete Example

Here's a complete example that demonstrates the full token lifecycle:

```rust
use apl_token::state::{Mint, Account};
use arch_program::{program_pack::Pack, sanitized::ArchMessage};
use arch_sdk::{build_and_sign_transaction, generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::{create_and_fund_account_with_faucet, read_account_info, send_transactions_and_wait},
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};

fn main() {
    env_logger::init();
    
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // 1. Create authority and mint
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    let (_, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );
    
    // 2. Create token accounts for two users
    let (user1_keypair, user1_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user1_keypair, BITCOIN_NETWORK);
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);

    let (_, user1_token_account) = initialize_token_account(&client, token_mint_pubkey, user1_keypair);
    let (_, user2_token_account) = initialize_token_account(&client, token_mint_pubkey, user2_keypair);

    // 3. Mint tokens to user1
    mint_tokens(&client, &token_mint_pubkey, &user1_token_account, &authority_pubkey, authority_keypair, 1_000_000_000); // 1 token with 9 decimals

    // 4. Check balance
    let account_info = read_account_info(user1_token_account);
    let account_data = Account::unpack(&account_info.data).unwrap();
    println!("User1 balance: {}", account_data.amount);

    // 5. Transfer tokens from user1 to user2
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        &user1_token_account,
        &user2_token_account,
        &user1_pubkey,
        &[&user1_pubkey],
        500_000_000, // 0.5 tokens
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[transfer_instruction],
            Some(user1_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![user1_keypair],
        BITCOIN_NETWORK,
    );

    let processed_transactions = send_transactions_and_wait(vec![transaction]);
    assert_eq!(processed_transactions[0].status, arch_sdk::Status::Processed);

    // 6. Check both balances
    let user1_info = read_account_info(user1_token_account);
    let user1_data = Account::unpack(&user1_info.data).unwrap();
    println!("User1 balance after transfer: {}", user1_data.amount);

    let user2_info = read_account_info(user2_token_account);
    let user2_data = Account::unpack(&user2_info.data).unwrap();
    println!("User2 balance after transfer: {}", user2_data.amount);

    println!("Token operations completed successfully!");
}
```

## Running the Example

```bash
# First, ensure your validator is running
arch-cli orchestrate validator-status

# Then run the example code
cargo run
```

## Key Concepts

### Account Types

1. **Mint Account**: Stores token metadata and authorities
2. **Token Account**: Holds token balances for specific owners  
3. **Multisig Account**: Enables shared authority over operations

### Authority Types

- **Mint Authority**: Can mint new tokens
- **Freeze Authority**: Can freeze/thaw token accounts
- **Owner**: Controls token account operations
- **Delegate**: Can spend approved amounts on behalf of owner

### State Management

All token operations are recorded on Bitcoin, providing:
- **Immutable History**: All transfers are permanently recorded
- **Transparency**: Public verification of all operations
- **Security**: Bitcoin's security model protects token state

## Testing

Create comprehensive tests for your token operations:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use serial_test::serial;

    #[test]
    #[serial]
    fn test_complete_token_lifecycle() {
        // Test mint creation, token accounts, minting, transfers, etc.
        // See e2e-tests/token-tests/src/lib.rs for comprehensive test examples
    }
}
```

## Associated Token Accounts

For simplified account management, you can use Associated Token Accounts:

```rust
use apl_associated_token_account::get_associated_token_address_and_bump_seed;

fn get_associated_token_account(
    wallet: &Pubkey,
    mint: &Pubkey,
) -> Pubkey {
    let (ata_address, _bump_seed) = get_associated_token_address_and_bump_seed(
        wallet,
        mint,
        &apl_associated_token_account::id(),
    );
    
    ata_address
}
```

## Next Steps

- Explore **Associated Token Accounts** for simplified account management
- Implement **Multisig authorities** for enhanced security
- Study the complete examples in `e2e-tests/token-tests/src/lib.rs`
- Review the **APL Token Program documentation** for advanced features

The APL Token Program provides a robust, battle-tested foundation for tokenization on Arch Network, leveraging the security and transparency of Bitcoin while maintaining compatibility with proven SPL token patterns.
