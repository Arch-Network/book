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
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::initialize_mint_token,
};

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    // This function handles:
    // 1. Creating the mint account
    // 2. Initializing the mint with the specified parameters
    // 3. Sending and waiting for transaction confirmation
    let (token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    // The fact that initialize_mint_token returns successfully means:
    // 1. The mint account was created on-chain
    // 2. The mint was initialized with the correct parameters
    // 3. The transaction was processed and confirmed
    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    println!("\nWhat this proves:");
    println!("✓ The mint account exists on-chain");
    println!("✓ The mint is initialized and ready to mint tokens");
    println!("✓ The authority can now mint tokens to any account");
    
    println!("\nThe initialize_mint_token helper function internally:");
    println!("1. Created a new account for the mint");
    println!("2. Initialized it as a token mint");
    println!("3. Sent the transaction to the network");
    println!("4. Waited for confirmation");
    println!("5. Only returned after successful on-chain confirmation");
}}
```

### 2.2 Create Token Accounts

Token accounts hold tokens for specific owners:

```rust
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: bitcoin::key::Keypair,
) -> Pubkey {
    let owner_pubkey = Pubkey::from_slice(
        &owner_keypair.x_only_public_key().0.serialize()
    );

    let (token_account_keypair, token_account_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);

    // Create the account
    let create_account_instruction = create_account(
        &owner_pubkey,
        &token_account_pubkey,
        MIN_ACCOUNT_LAMPORTS,
        apl_token::state::Account::LEN as u64,
        &apl_token::id(),
    );

    // Initialize the token account
    let initialize_account_instruction = apl_token::instruction::initialize_account(
        &apl_token::id(),
        &token_account_pubkey,
        &token_mint_pubkey,
        &owner_pubkey,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[create_account_instruction, initialize_account_instruction],
            Some(owner_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![owner_keypair, token_account_keypair],
        BITCOIN_NETWORK,
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
    println!("Token account created: {}", token_account_pubkey);
    
    token_account_pubkey
}
```

### 2.3 Mint Tokens

Mint new tokens to a token account:

```rust
fn mint_tokens(
    client: &ArchRpcClient,
    mint_pubkey: &Pubkey,
    account_pubkey: &Pubkey,
    authority_pubkey: &Pubkey,
    authority_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    let mint_instruction = apl_token::instruction::mint_to(
        &apl_token::id(),
        mint_pubkey,
        account_pubkey,
        authority_pubkey,
        &[], // No additional signers for single authority
        amount,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[mint_instruction],
            Some(*authority_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![authority_keypair],
        BITCOIN_NETWORK,
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
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
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
    println!("Transferred {} tokens", amount);
}
```

## Step 3: Advanced Token Operations

### 3.1 Approve Delegations

Allow another account to spend tokens on your behalf:

```rust
fn approve_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    delegate_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: bitcoin::key::Keypair,
    amount: u64,
) {
    let approve_instruction = apl_token::instruction::approve(
        &apl_token::id(),
        source_account,
        delegate_account,
        owner_pubkey,
        &[owner_pubkey],
        amount,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[approve_instruction],
            Some(*owner_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![owner_keypair],
        BITCOIN_NETWORK,
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
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
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
    println!("Burned {} tokens", amount);
}
```

### 3.3 Freeze and Thaw Accounts

If you set a freeze authority when creating the mint, you can freeze/thaw accounts:

```rust
fn freeze_account(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    freeze_authority_pubkey: &Pubkey,
    freeze_authority_keypair: bitcoin::key::Keypair,
) {
    let freeze_instruction = apl_token::instruction::freeze_account(
        &apl_token::id(),
        account_pubkey,
        mint_pubkey,
        freeze_authority_pubkey,
        &[freeze_authority_pubkey],
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[freeze_instruction],
            Some(*freeze_authority_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![freeze_authority_keypair],
        BITCOIN_NETWORK,
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
    println!("Account frozen");
}
```

## Step 4: Complete Example

Here's a complete example that demonstrates the full token lifecycle:

```rust
use apl_token::state::{Mint, Account};
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
    sanitized::ArchMessage,
    account::MIN_ACCOUNT_LAMPORTS,
    system_instruction::create_account,
};
use arch_sdk::{build_and_sign_transaction, generate_new_keypair, ArchRpcClient};
use bitcoin::Network;

const BITCOIN_NETWORK: Network = Network::Regtest;
const NODE_URL: &str = "http://localhost:9002";

fn main() {
    env_logger::init();
    
    let client = ArchRpcClient::new(NODE_URL);

    // 1. Create authority and mint
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    client.create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK)
        .expect("Failed to fund authority account");

    let (mint_keypair, mint_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    
    // Create and initialize mint
    let create_mint_ix = create_account(
        &authority_pubkey,
        &mint_pubkey,
        MIN_ACCOUNT_LAMPORTS,
        Mint::LEN as u64,
        &apl_token::id(),
    );
    
    let init_mint_ix = apl_token::instruction::initialize_mint(
        &apl_token::id(),
        &mint_pubkey,
        &authority_pubkey,
        None,
        9, // 9 decimals
    ).unwrap();
    
    let tx = build_and_sign_transaction(
        ArchMessage::new(
            &[create_mint_ix, init_mint_ix],
            Some(authority_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![authority_keypair, mint_keypair],
        BITCOIN_NETWORK,
    ).unwrap();
    
    let tx_id = client.send_transaction(tx).unwrap();
    client.wait_for_processed_transaction(&tx_id).unwrap();
    
    println!("Token mint created: {}", mint_pubkey);
    
    // 2. Create token accounts for two users
    let (user1_keypair, user1_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    client.create_and_fund_account_with_faucet(&user1_keypair, BITCOIN_NETWORK)
        .expect("Failed to fund user1 account");
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    client.create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK)
        .expect("Failed to fund user2 account");

    let user1_token_account = create_token_account(&client, mint_pubkey, user1_keypair);
    let user2_token_account = create_token_account(&client, mint_pubkey, user2_keypair);

    // 3. Mint tokens to user1
    mint_tokens(&client, &mint_pubkey, &user1_token_account, &authority_pubkey, authority_keypair, 1_000_000_000); // 1 token with 9 decimals

    // 4. Check balance
    let account_info = client.read_account_info(user1_token_account).unwrap();
    let account_data = Account::unpack(&account_info.data).unwrap();
    println!("User1 balance: {}", account_data.amount);

    // 5. Transfer tokens from user1 to user2
    transfer_tokens(&client, &user1_token_account, &user2_token_account, &user1_pubkey, user1_keypair, 500_000_000); // 0.5 tokens

    // 6. Check both balances
    let user1_info = client.read_account_info(user1_token_account).unwrap();
    let user1_data = Account::unpack(&user1_info.data).unwrap();
    println!("User1 balance after transfer: {}", user1_data.amount);

    let user2_info = client.read_account_info(user2_token_account).unwrap();
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

## Handling Errors

When working with tokens, always handle potential errors:

```rust
match client.send_transaction(transaction) {
    Ok(tx_id) => {
        match client.wait_for_processed_transaction(&tx_id) {
            Ok(processed_tx) => {
                if processed_tx.status == arch_sdk::Status::Processed {
                    println!("Transaction successful");
                } else {
                    eprintln!("Transaction failed: {:?}", processed_tx.status);
                }
            }
            Err(e) => eprintln!("Failed to wait for transaction: {}", e),
        }
    }
    Err(e) => eprintln!("Failed to send transaction: {}", e),
}
```

## Next Steps

- Explore **Associated Token Accounts** for simplified account management
- Implement **Multisig authorities** for enhanced security
- Study the complete examples in `e2e-tests/token-tests/src/lib.rs`
- Review the **APL Token Program documentation** for advanced features

The APL Token Program provides a robust, battle-tested foundation for tokenization on Arch Network, leveraging the security and transparency of Bitcoin while maintaining compatibility with proven SPL token patterns.
