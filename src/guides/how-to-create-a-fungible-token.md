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
arch_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_program = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_test_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
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

## Step 2: Create a Token Mint

First, let's create a new token mint. This is the foundation for your token.

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
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    println!("\nWhat this proves:");
    println!("✓ The mint account exists on-chain");
    println!("✓ The mint is initialized and ready to mint tokens");
    println!("✓ The authority can now mint tokens to any account");
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
Token mint authority: [authority_address]
```

## Step 3: Create Token Accounts

Now that you have a mint, you need token accounts to hold tokens. Each user needs their own token account for your mint.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    // Create a token account for the authority
    println!("\n📦 Creating first token account...");
    
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    println!("✅ Token account successfully created!");
    println!("Token account address: {}", token_account_pubkey);
    println!("Token account owner: {}", authority_pubkey);
    
    // Create a second user and their token account
    println!("\n👤 Creating second user and their token account...");
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Second user's token account created!");
    println!("User 2 address: {}", user2_pubkey);
    println!("User 2 token account: {}", user2_token_account);
    
    println!("\n🎉 Complete token setup verified!");
    println!("Summary:");
    println!("- Token mint: {}", token_mint_pubkey);
    println!("- Authority's token account: {}", token_account_pubkey);
    println!("- User 2's token account: {}", user2_token_account);
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
📦 Creating first token account...
✅ Token account successfully created!
Token account address: [account1_address]
👤 Creating second user and their token account...
✅ Second user's token account created!
User 2 address: [user2_address]
User 2 token account: [account2_address]
```

## Step 4: Mint Tokens

Now let's mint some tokens to the accounts we created.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to the authority's account
    println!("\n🪙 Minting tokens to authority's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    // Mint tokens to user2's account
    println!("\n🪙 Minting tokens to user2's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("\n🎉 Token minting completed!");
    println!("Summary:");
    println!("- Authority received: 1.0 tokens");
    println!("- User 2 received: 0.5 tokens");
    println!("- Total supply: 1.5 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
🪙 Minting tokens to authority's account...
🪙 Minting tokens to user2's account...
🎉 Token minting completed!
Summary:
- Authority received: 1.0 tokens
- User 2 received: 0.5 tokens
- Total supply: 1.5 tokens
```

## Step 5: Transfer Tokens

Now let's transfer tokens between accounts.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair.clone(),
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to both accounts
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("✅ Tokens minted to both accounts");
    
    // Transfer tokens from user2 to authority
    println!("\n🔄 Transferring tokens from user2 to authority...");
    transfer_tokens(
        &client,
        &user2_token_account,
        &authority_token_account,
        &user2_pubkey,
        user2_keypair,
        200_000_000, // 0.2 tokens
    );
    
    println!("\n🎉 Token transfer completed!");
    println!("Summary:");
    println!("- User2 transferred 0.2 tokens to authority");
    println!("- Authority now has: 1.2 tokens");
    println!("- User2 now has: 0.3 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}

// Function to transfer tokens between accounts
fn transfer_tokens(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::{
        sanitized::ArchMessage,
        system_instruction::create_account,
    };
    use arch_sdk::build_and_sign_transaction;
    
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        source_account,
        destination_account,
        owner_pubkey,
        &[], // No additional signers
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

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
✅ Tokens minted to both accounts
🔄 Transferring tokens from user2 to authority...
Transferred 200000000 tokens
🎉 Token transfer completed!
Summary:
- User2 transferred 0.2 tokens to authority
- Authority now has: 1.2 tokens
- User2 now has: 0.3 tokens
```

## Step 6: Advanced Operations

### 6.1 Approve Delegations

Allow another account to spend tokens on your behalf:

```rust
fn approve_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    delegate_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let approve_instruction = apl_token::instruction::approve(
        &apl_token::id(),
        source_account,
        delegate_account,
        owner_pubkey,
        &[],
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

### 6.2 Burn Tokens

Remove tokens from circulation:

```rust
fn burn_tokens(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let burn_instruction = apl_token::instruction::burn(
        &apl_token::id(),
        account_pubkey,
        mint_pubkey,
        owner_pubkey,
        &[],
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

## Running the Examples

```bash
# First, ensure your validator is running
arch-cli orchestrate validator-status

# Then run each step
cargo run
```

## Next Steps

- Explore **Associated Token Accounts** for simplified account management
- Implement **Multisig authorities** for enhanced security
- Study the complete examples in `e2e-tests/token-tests/src/lib.rs`
- Review the **APL Token Program documentation** for advanced features

The APL Token Program provides a robust, battle-tested foundation for tokenization on Arch Network, leveraging the security and transparency of Bitcoin while maintaining compatibility with proven SPL token patterns.
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
arch_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_program = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_test_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
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

## Step 2: Create a Token Mint

First, let's create a new token mint. This is the foundation for your token.

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
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    println!("\nWhat this proves:");
    println!("✓ The mint account exists on-chain");
    println!("✓ The mint is initialized and ready to mint tokens");
    println!("✓ The authority can now mint tokens to any account");
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
Token mint authority: [authority_address]
```

## Step 3: Create Token Accounts

Now that you have a mint, you need token accounts to hold tokens. Each user needs their own token account for your mint.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    // Create a token account for the authority
    println!("\n📦 Creating first token account...");
    
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    println!("✅ Token account successfully created!");
    println!("Token account address: {}", token_account_pubkey);
    println!("Token account owner: {}", authority_pubkey);
    
    // Create a second user and their token account
    println!("\n👤 Creating second user and their token account...");
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Second user's token account created!");
    println!("User 2 address: {}", user2_pubkey);
    println!("User 2 token account: {}", user2_token_account);
    
    println!("\n🎉 Complete token setup verified!");
    println!("Summary:");
    println!("- Token mint: {}", token_mint_pubkey);
    println!("- Authority's token account: {}", token_account_pubkey);
    println!("- User 2's token account: {}", user2_token_account);
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
📦 Creating first token account...
✅ Token account successfully created!
Token account address: [account1_address]
👤 Creating second user and their token account...
✅ Second user's token account created!
User 2 address: [user2_address]
User 2 token account: [account2_address]
```

## Step 4: Mint Tokens

Now let's mint some tokens to the accounts we created.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to the authority's account
    println!("\n🪙 Minting tokens to authority's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    // Mint tokens to user2's account
    println!("\n🪙 Minting tokens to user2's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("\n🎉 Token minting completed!");
    println!("Summary:");
    println!("- Authority received: 1.0 tokens");
    println!("- User 2 received: 0.5 tokens");
    println!("- Total supply: 1.5 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
🪙 Minting tokens to authority's account...
🪙 Minting tokens to user2's account...
🎉 Token minting completed!
Summary:
- Authority received: 1.0 tokens
- User 2 received: 0.5 tokens
- Total supply: 1.5 tokens
```

## Step 5: Transfer Tokens

Now let's transfer tokens between accounts.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair.clone(),
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to both accounts
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("✅ Tokens minted to both accounts");
    
    // Transfer tokens from user2 to authority
    println!("\n🔄 Transferring tokens from user2 to authority...");
    transfer_tokens(
        &client,
        &user2_token_account,
        &authority_token_account,
        &user2_pubkey,
        user2_keypair,
        200_000_000, // 0.2 tokens
    );
    
    println!("\n🎉 Token transfer completed!");
    println!("Summary:");
    println!("- User2 transferred 0.2 tokens to authority");
    println!("- Authority now has: 1.2 tokens");
    println!("- User2 now has: 0.3 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}

// Function to transfer tokens between accounts
fn transfer_tokens(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::{
        sanitized::ArchMessage,
        system_instruction::create_account,
    };
    use arch_sdk::build_and_sign_transaction;
    
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        source_account,
        destination_account,
        owner_pubkey,
        &[], // No additional signers
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

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
✅ Tokens minted to both accounts
🔄 Transferring tokens from user2 to authority...
Transferred 200000000 tokens
🎉 Token transfer completed!
Summary:
- User2 transferred 0.2 tokens to authority
- Authority now has: 1.2 tokens
- User2 now has: 0.3 tokens
```

## Step 6: Advanced Operations

### 6.1 Approve Delegations

Allow another account to spend tokens on your behalf:

```rust
fn approve_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    delegate_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let approve_instruction = apl_token::instruction::approve(
        &apl_token::id(),
        source_account,
        delegate_account,
        owner_pubkey,
        &[],
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

### 6.2 Burn Tokens

Remove tokens from circulation:

```rust
fn burn_tokens(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let burn_instruction = apl_token::instruction::burn(
        &apl_token::id(),
        account_pubkey,
        mint_pubkey,
        owner_pubkey,
        &[],
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

## Running the Examples

```bas# Using APL Tokens on Arch Network

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
arch_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_program = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_test_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
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

## Step 2: Create a Token Mint

First, let's create a new token mint. This is the foundation for your token.

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
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair,
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    println!("\nWhat this proves:");
    println!("✓ The mint account exists on-chain");
    println!("✓ The mint is initialized and ready to mint tokens");
    println!("✓ The authority can now mint tokens to any account");
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
Token mint authority: [authority_address]
```

## Step 3: Create Token Accounts

Now that you have a mint, you need token accounts to hold tokens. Each user needs their own token account for your mint.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    println!("Token mint authority: {}", authority_pubkey);
    
    // Create a token account for the authority
    println!("\n📦 Creating first token account...");
    
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    println!("✅ Token account successfully created!");
    println!("Token account address: {}", token_account_pubkey);
    println!("Token account owner: {}", authority_pubkey);
    
    // Create a second user and their token account
    println!("\n👤 Creating second user and their token account...");
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Second user's token account created!");
    println!("User 2 address: {}", user2_pubkey);
    println!("User 2 token account: {}", user2_token_account);
    
    println!("\n🎉 Complete token setup verified!");
    println!("Summary:");
    println!("- Token mint: {}", token_mint_pubkey);
    println!("- Authority's token account: {}", token_account_pubkey);
    println!("- User 2's token account: {}", user2_token_account);
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
📦 Creating first token account...
✅ Token account successfully created!
Token account address: [account1_address]
👤 Creating second user and their token account...
✅ Second user's token account created!
User 2 address: [user2_address]
User 2 token account: [account2_address]
```

## Step 4: Mint Tokens

Now let's mint some tokens to the accounts we created.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair,
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to the authority's account
    println!("\n🪙 Minting tokens to authority's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    // Mint tokens to user2's account
    println!("\n🪙 Minting tokens to user2's account...");
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("\n🎉 Token minting completed!");
    println!("Summary:");
    println!("- Authority received: 1.0 tokens");
    println!("- User 2 received: 0.5 tokens");
    println!("- Total supply: 1.5 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}
```

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
🪙 Minting tokens to authority's account...
🪙 Minting tokens to user2's account...
🎉 Token minting completed!
Summary:
- Authority received: 1.0 tokens
- User 2 received: 0.5 tokens
- Total supply: 1.5 tokens
```

## Step 5: Transfer Tokens

Now let's transfer tokens between accounts.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair.clone(),
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    
    // Mint tokens to both accounts
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &authority_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair,
        500_000_000, // 0.5 tokens with 9 decimals
    );
    
    println!("✅ Tokens minted to both accounts");
    
    // Transfer tokens from user2 to authority
    println!("\n🔄 Transferring tokens from user2 to authority...");
    transfer_tokens(
        &client,
        &user2_token_account,
        &authority_token_account,
        &user2_pubkey,
        user2_keypair,
        200_000_000, // 0.2 tokens
    );
    
    println!("\n🎉 Token transfer completed!");
    println!("Summary:");
    println!("- User2 transferred 0.2 tokens to authority");
    println!("- Authority now has: 1.2 tokens");
    println!("- User2 now has: 0.3 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}

// Function to transfer tokens between accounts
fn transfer_tokens(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::{
        sanitized::ArchMessage,
        system_instruction::create_account,
    };
    use arch_sdk::build_and_sign_transaction;
    
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        source_account,
        destination_account,
        owner_pubkey,
        &[], // No additional signers
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

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
✅ Tokens minted to both accounts
🔄 Transferring tokens from user2 to authority...
Transferred 200000000 tokens
🎉 Token transfer completed!
Summary:
- User2 transferred 0.2 tokens to authority
- Authority now has: 1.2 tokens
- User2 now has: 0.3 tokens
```

## Step 6: Advanced Operations

Now let's explore some advanced token operations like delegation and burning.

**src/main.rs**
```rust
use apl_token::state::Mint;
use arch_program::{
    program_pack::Pack,
    pubkey::Pubkey,
};
use arch_sdk::{generate_new_keypair, ArchRpcClient};
use arch_test_sdk::{
    constants::{BITCOIN_NETWORK, NODE1_ADDRESS},
    helper::create_and_fund_account_with_faucet,
    instructions::{initialize_mint_token, initialize_token_account, mint_tokens},
};
use bitcoin::key::Keypair;

fn main() {
    let client = ArchRpcClient::new(NODE1_ADDRESS);

    // Create authority keypair (this will be the mint authority)
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&authority_keypair, BITCOIN_NETWORK);

    println!("Authority account created and funded: {}", authority_pubkey);

    // Create mint using the helper function
    let (_token_mint_keypair, token_mint_pubkey) = initialize_mint_token(
        &client,
        authority_pubkey,
        authority_keypair.clone(),
        None, // No freeze authority
        Mint::LEN as u64,
        &apl_token::id(),
    );

    println!("\n✅ Token mint successfully created!");
    println!("Token mint address: {}", token_mint_pubkey);
    
    // Create token accounts for multiple users
    let (_token_account_keypair, authority_token_account) = initialize_token_account(
        &client,
        token_mint_pubkey,
        authority_keypair.clone(),
    );
    
    let (user2_keypair, user2_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&user2_keypair, BITCOIN_NETWORK);
    
    let user2_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        user2_keypair.clone(),
    );
    
    let (delegate_keypair, delegate_pubkey, _) = generate_new_keypair(BITCOIN_NETWORK);
    create_and_fund_account_with_faucet(&delegate_keypair, BITCOIN_NETWORK);
    
    let delegate_token_account = create_token_account(
        &client,
        token_mint_pubkey,
        delegate_keypair.clone(),
    );
    
    println!("✅ Token accounts created!");
    println!("Authority's token account: {}", authority_token_account);
    println!("User 2's token account: {}", user2_token_account);
    println!("Delegate's token account: {}", delegate_token_account);
    
    // Mint tokens to user2's account
    mint_tokens(
        &client,
        &token_mint_pubkey,
        &user2_token_account,
        &authority_pubkey,
        authority_keypair.clone(),
        1_000_000_000, // 1 token with 9 decimals
    );
    
    println!("✅ Tokens minted to user2's account");
    
    // Step 1: Approve delegation - User2 allows delegate to spend 0.3 tokens
    println!("\n🔐 Approving delegation...");
    approve_delegate(
        &client,
        &user2_token_account,
        &delegate_pubkey,
        &user2_pubkey,
        user2_keypair.clone(),
        300_000_000, // 0.3 tokens
    );
    
    // Step 2: Delegate transfers tokens on behalf of user2
    println!("\n🔄 Delegate transferring tokens on behalf of user2...");
    transfer_tokens_as_delegate(
        &client,
        &user2_token_account,
        &delegate_token_account,
        &delegate_pubkey,
        delegate_keypair.clone(),
        200_000_000, // 0.2 tokens
    );
    
    // Step 3: Burn some tokens from user2's account
    println!("\n🔥 Burning tokens from user2's account...");
    burn_tokens(
        &client,
        &user2_token_account,
        &token_mint_pubkey,
        &user2_pubkey,
        user2_keypair,
        100_000_000, // 0.1 tokens
    );
    
    println!("\n🎉 Advanced operations completed!");
    println!("Summary:");
    println!("- User2 approved delegate to spend 0.3 tokens");
    println!("- Delegate transferred 0.2 tokens to their own account");
    println!("- User2 burned 0.1 tokens");
    println!("- User2 remaining balance: 0.7 tokens");
    println!("- Delegate balance: 0.2 tokens");
}

// Standalone function to create token accounts
fn create_token_account(
    client: &ArchRpcClient,
    token_mint_pubkey: Pubkey,
    owner_keypair: Keypair,
) -> Pubkey {
    let (_token_account_keypair, token_account_pubkey) = initialize_token_account(
        client,
        token_mint_pubkey,
        owner_keypair,
    );
    
    token_account_pubkey
}

// Function to approve a delegate to spend tokens
fn approve_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    delegate_account: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let approve_instruction = apl_token::instruction::approve(
        &apl_token::id(),
        source_account,
        delegate_account,
        owner_pubkey,
        &[],
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

// Function to transfer tokens as a delegate
fn transfer_tokens_as_delegate(
    client: &ArchRpcClient,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    delegate_pubkey: &Pubkey,
    delegate_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let transfer_instruction = apl_token::instruction::transfer(
        &apl_token::id(),
        source_account,
        destination_account,
        delegate_pubkey,
        &[],
        amount,
    ).unwrap();

    let transaction = build_and_sign_transaction(
        ArchMessage::new(
            &[transfer_instruction],
            Some(*delegate_pubkey),
            client.get_best_block_hash().unwrap(),
        ),
        vec![delegate_keypair],
        BITCOIN_NETWORK,
    ).expect("Failed to build and sign transaction");

    let tx_id = client.send_transaction(transaction)
        .expect("Failed to send transaction");
    
    let processed_tx = client.wait_for_processed_transaction(&tx_id)
        .expect("Failed to process transaction");
    
    assert_eq!(processed_tx.status, arch_sdk::Status::Processed);
    println!("Delegate transferred {} tokens", amount);
}

// Function to burn tokens
fn burn_tokens(
    client: &ArchRpcClient,
    account_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    owner_pubkey: &Pubkey,
    owner_keypair: Keypair,
    amount: u64,
) {
    use arch_program::sanitized::ArchMessage;
    use arch_sdk::build_and_sign_transaction;
    
    let burn_instruction = apl_token::instruction::burn(
        &apl_token::id(),
        account_pubkey,
        mint_pubkey,
        owner_pubkey,
        &[],
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

**Run this step:**
```bash
cargo run
```

**Expected output:**
```
Authority account created and funded: [authority_address]
✅ Token mint successfully created!
Token mint address: [mint_address]
✅ Token accounts created!
Authority's token account: [account1_address]
User 2's token account: [account2_address]
Delegate's token account: [delegate_account_address]
✅ Tokens minted to user2's account
🔐 Approving delegation...
Approved 300000000 tokens for delegation
🔄 Delegate transferring tokens on behalf of user2...
Delegate transferred 200000000 tokens
🔥 Burning tokens from user2's account...
Burned 100000000 tokens
🎉 Advanced operations completed!
Summary:
- User2 approved delegate to spend 0.3 tokens
- Delegate transferred 0.2 tokens to their own account
- User2 burned 0.1 tokens
- User2 remaining balance: 0.7 tokens
- Delegate balance: 0.2 tokens
```

### What This Demonstrates:

1. **Delegation**: User2 approves a delegate to spend tokens on their behalf
2. **Delegate Transfers**: The delegate can transfer tokens from User2's account to their own
3. **Token Burning**: User2 can burn tokens to reduce the total supply
4. **Complex Workflows**: Shows how multiple parties can interact with tokens

### Key Concepts:

- **Delegation**: Allows one account to spend tokens on behalf of another
- **Burning**: Permanently removes tokens from circulation
- **Multi-party Operations**: Demonstrates how tokens can be used in complex scenarios

This completes the full token lifecycle from creation to advanced operations!
h
# First, ensure your validator is running
arch-cli orchestrate validator-status

# Then run each step
cargo run
```

## Next Steps

- Explore **Associated Token Accounts** for simplified account management
- Implement **Multisig authorities** for enhanced security
- Study the complete examples in `e2e-tests/token-tests/src/lib.rs`
- Review the **APL Token Program documentation** for advanced features

The APL Token Program provides a robust, battle-tested foundation for tokenization on Arch Network, leveraging the security and transparency of Bitcoin while maintaining compatibility with proven SPL token patterns.
