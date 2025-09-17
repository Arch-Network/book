# Getting Started with the Rust SDK

This guide will walk you through setting up and using the native Arch Network Rust SDK to build high-performance applications and on-chain programs.

## Prerequisites

- **Rust 1.70+** with Cargo
- **Basic understanding** of Rust and blockchain concepts
- **Arch Network node** running locally or access to a remote node
- **Rust development environment** set up

## Installation

### Create a New Rust Project

```bash
# Create a new binary project
cargo new my-arch-app --bin
cd my-arch-app

# Or create a library for on-chain programs
cargo new my-arch-program --lib
cd my-arch-program
```

### Add the SDK Dependency

Edit your `Cargo.toml`:

```toml
[dependencies]
arch_sdk = "0.5.4"
arch_program = "0.5.4"  # For on-chain program development

# Required for async operations
tokio = { version = "1.38", features = ["full"] }

# Optional dependencies commonly used
anyhow = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## Your First Connection

Create `src/main.rs`:

```rust,ignore
use arch_sdk::Connection;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // Connect to local validator
    let connection = Connection::new("http://localhost:9002");
    
    // Check if node is ready
    let is_ready = connection.is_node_ready().await?;
    println!("Node ready: {}", is_ready);
    
    // Get current block count
    let block_count = connection.get_block_count().await?;
    println!("Current block count: {}", block_count);
    
    Ok(())
}
```

Run the program:
```bash
cargo run
```

## Working with Keypairs

### Generate a New Keypair

```rust,ignore
use arch_sdk::Keypair;
use arch_program::pubkey::Pubkey;

fn create_keypair() {
    // Generate a new keypair
    let keypair = Keypair::new();
    
    // Get the public key
    let pubkey: Pubkey = keypair.pubkey();
    println!("Public key: {}", pubkey);
    
    // Get the secret key bytes
    let secret_key_bytes = keypair.secret_key();
    println!("Secret key length: {} bytes", secret_key_bytes.len());
    
    // Save keypair to file (be careful with security!)
    keypair.save_to_file("keypair.json").expect("Failed to save keypair");
    
    // Load keypair from file
    let loaded_keypair = Keypair::load_from_file("keypair.json")
        .expect("Failed to load keypair");
}
```

### Create Keypair from Seed

```rust,ignore
use arch_sdk::Keypair;

fn create_from_seed() {
    // Create from seed phrase or bytes
    let seed_bytes = b"your-seed-phrase-here-32-bytes!!"; // Must be 32 bytes
    let keypair = Keypair::from_seed(seed_bytes);
    
    println!("Pubkey from seed: {}", keypair.pubkey());
}
```

## Reading Account Information

### Get Account Info

```rust,ignore
use arch_sdk::{Connection, Account};
use arch_program::pubkey::Pubkey;
use std::str::FromStr;

async fn read_account(connection: &Connection) -> Result<()> {
    // Parse a public key from string
    let account_pubkey = Pubkey::from_str("YourAccountAddress...")?;
    
    // Get account info
    match connection.get_account(&account_pubkey).await? {
        Some(account) => {
            println!("Owner: {}", account.owner);
            println!("Lamports: {}", account.lamports);
            println!("Data length: {}", account.data.len());
            println!("Executable: {}", account.executable);
        }
        None => {
            println!("Account not found");
        }
    }
    
    Ok(())
}
```

### Get Multiple Accounts

```rust,ignore
async fn read_multiple_accounts(connection: &Connection) -> Result<()> {
    let pubkeys = vec![
        Pubkey::from_str("Address1...")?,
        Pubkey::from_str("Address2...")?,
        Pubkey::from_str("Address3...")?,
    ];
    
    let accounts = connection.get_multiple_accounts(&pubkeys).await?;
    
    for (i, account) in accounts.iter().enumerate() {
        match account {
            Some(acc) => println!("Account {}: {} lamports", i, acc.lamports),
            None => println!("Account {}: Not found", i),
        }
    }
    
    Ok(())
}
```

## Building and Sending Transactions

### Simple Transfer

```rust,ignore
use arch_sdk::{Connection, Keypair, Transaction};
use arch_program::{
    instruction::Instruction,
    system_instruction,
    pubkey::Pubkey,
};

async fn transfer_lamports(connection: &Connection) -> Result<()> {
    // Create or load keypairs
    let sender = Keypair::new();
    let recipient = Keypair::new();
    
    // Create transfer instruction
    let transfer_ix = system_instruction::transfer(
        &sender.pubkey(),
        &recipient.pubkey(),
        1_000_000, // 1 SOL equivalent in lamports
    );
    
    // Build transaction
    let mut transaction = Transaction::new_with_payer(
        &[transfer_ix],
        Some(&sender.pubkey()),
    );
    
    // Get recent blockhash
    let recent_blockhash = connection.get_latest_blockhash().await?;
    transaction.message.recent_blockhash = recent_blockhash;
    
    // Sign transaction
    transaction.sign(&[&sender], recent_blockhash);
    
    // Send and confirm
    let signature = connection.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction signature: {}", signature);
    
    Ok(())
}
```

### Create Account

```rust,ignore
use arch_program::system_instruction;

async fn create_account(
    connection: &Connection,
    payer: &Keypair,
    new_account: &Keypair,
    space: u64,
    owner: &Pubkey,
) -> Result<()> {
    // Calculate rent-exempt amount
    let rent = connection.get_minimum_balance_for_rent_exemption(space).await?;
    
    // Create account instruction
    let create_account_ix = system_instruction::create_account(
        &payer.pubkey(),
        &new_account.pubkey(),
        rent,
        space,
        owner,
    );
    
    // Build and send transaction
    let mut transaction = Transaction::new_with_payer(
        &[create_account_ix],
        Some(&payer.pubkey()),
    );
    
    let recent_blockhash = connection.get_latest_blockhash().await?;
    transaction.sign(&[payer, new_account], recent_blockhash);
    
    let signature = connection.send_and_confirm_transaction(&transaction).await?;
    println!("Account created: {}", new_account.pubkey());
    println!("Transaction: {}", signature);
    
    Ok(())
}
```

## Developing On-Chain Programs

### Basic Program Structure

Create `src/lib.rs` for your on-chain program:

```rust,ignore
use arch_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

// Declare the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello from Arch program!");
    
    // Parse accounts
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // Check account ownership
    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Process instruction data
    match instruction_data.get(0) {
        Some(0) => process_initialize(account, instruction_data),
        Some(1) => process_update(account, instruction_data),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

fn process_initialize(account: &AccountInfo, data: &[u8]) -> ProgramResult {
    msg!("Initializing account");
    // Implementation here
    Ok(())
}

fn process_update(account: &AccountInfo, data: &[u8]) -> ProgramResult {
    msg!("Updating account");
    // Implementation here
    Ok(())
}
```

### Building Programs

Add to `Cargo.toml`:
```toml
[lib]
crate-type = ["cdylib", "lib"]

[features]
no-entrypoint = []

[dependencies]
arch_program = "0.5.4"
```

Build the program:
```bash
cargo build-sbf
```

## Error Handling

### Using Result Types

```rust,ignore
use arch_sdk::ArchError;
use anyhow::{Result, Context};

async fn robust_operation(connection: &Connection) -> Result<()> {
    // Use ? operator for automatic error propagation
    let block_count = connection.get_block_count().await
        .context("Failed to get block count")?;
    
    // Pattern match on specific errors
    match connection.get_account(&some_pubkey).await {
        Ok(Some(account)) => {
            println!("Account found: {} lamports", account.lamports);
        }
        Ok(None) => {
            println!("Account not found");
        }
        Err(e) => {
            eprintln!("Error fetching account: {}", e);
            return Err(e.into());
        }
    }
    
    Ok(())
}
```

### Custom Error Types

```rust,ignore
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MyProgramError {
    #[error("Invalid instruction data")]
    InvalidInstruction,
    
    #[error("Insufficient funds: needed {needed}, available {available}")]
    InsufficientFunds { needed: u64, available: u64 },
    
    #[error("Account not initialized")]
    UninitializedAccount,
}

// Use in your program
fn validate_account(account: &AccountInfo) -> Result<(), MyProgramError> {
    if account.data_is_empty() {
        return Err(MyProgramError::UninitializedAccount);
    }
    Ok(())
}
```

## Advanced Features

### Parallel Account Processing

```rust,ignore
use futures::future::join_all;

async fn process_accounts_parallel(connection: &Connection, pubkeys: Vec<Pubkey>) -> Result<()> {
    // Create futures for all account fetches
    let futures: Vec<_> = pubkeys
        .iter()
        .map(|pubkey| connection.get_account(pubkey))
        .collect();
    
    // Execute all fetches in parallel
    let results = join_all(futures).await;
    
    // Process results
    for (i, result) in results.into_iter().enumerate() {
        match result {
            Ok(Some(account)) => {
                println!("Account {}: {} lamports", i, account.lamports);
            }
            Ok(None) => {
                println!("Account {}: Not found", i);
            }
            Err(e) => {
                eprintln!("Error fetching account {}: {}", i, e);
            }
        }
    }
    
    Ok(())
}
```

### Custom Serialization

```rust,ignore
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MyAccountData {
    pub counter: u64,
    pub owner: Pubkey,
    pub timestamp: i64,
}

impl MyAccountData {
    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        self.serialize(&mut &mut account.data.borrow_mut()[..])?;
        Ok(())
    }
    
    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        Self::try_from_slice(&account.data.borrow())
            .map_err(|_| ProgramError::InvalidAccountData)
    }
}
```

## Testing

### Unit Tests

```rust,ignore      
#[cfg(test)]
mod tests {
    use super::*;
    use arch_program::clock::Epoch;
    
    #[test]
    fn test_keypair_generation() {
        let keypair = Keypair::new();
        assert_eq!(keypair.secret_key().len(), 64);
        
        let pubkey = keypair.pubkey();
        assert_eq!(pubkey.to_bytes().len(), 32);
    }
    
    #[tokio::test]
    async fn test_connection() {
        let connection = Connection::new("http://localhost:9002");
        
        // This will fail if no local node is running
        match connection.is_node_ready().await {
            Ok(ready) => assert!(ready),
            Err(_) => println!("No local node available for testing"),
        }
    }
}
```

### Integration Tests

Create `tests/integration_test.rs`:

```rust,ignore
use arch_sdk::{Connection, Keypair};
use anyhow::Result;

#[tokio::test]
async fn test_full_transaction_flow() -> Result<()> {
    let connection = Connection::new("http://localhost:9002");
    
    // Only run if node is available
    if !connection.is_node_ready().await.unwrap_or(false) {
        println!("Skipping integration test - no node available");
        return Ok(());
    }
    
    // Your integration test logic here
    
    Ok(())
}
```

## Best Practices

### Performance Optimization

```rust,ignore
// 1. Reuse connections
lazy_static::lazy_static! {
    static ref CONNECTION: Connection = Connection::new("http://localhost:9002");
}

// 2. Batch operations when possible
pub async fn get_all_token_accounts(mint: &Pubkey) -> Result<Vec<Account>> {
    CONNECTION.get_program_accounts_with_config(
        &token_program_id(),
        RpcProgramAccountsConfig {
            filters: Some(vec![
                RpcFilterType::Memcmp(Memcmp {
                    offset: 0,
                    bytes: MemcmpEncodedBytes::Base58(mint.to_string()),
                    encoding: None,
                }),
            ]),
            ..Default::default()
        },
    ).await
}

// 3. Use appropriate data structures
use std::collections::HashMap;
use dashmap::DashMap; // For concurrent access

type AccountCache = DashMap<Pubkey, Account>;
```

### Security Considerations

```rust,ignore
// 1. Always validate inputs
pub fn validate_pubkey(input: &str) -> Result<Pubkey> {
    Pubkey::from_str(input)
        .map_err(|e| anyhow::anyhow!("Invalid public key: {}", e))
}

// 2. Check account ownership
pub fn verify_owner(account: &AccountInfo, expected_owner: &Pubkey) -> ProgramResult {
    if account.owner != expected_owner {
        msg!("Account has wrong owner");
        return Err(ProgramError::IncorrectProgramId);
    }
    Ok(())
}

// 3. Prevent arithmetic overflows
pub fn safe_add(a: u64, b: u64) -> Option<u64> {
    a.checked_add(b)
}
```

## Complete Example

Here's a complete example combining multiple concepts:

```rust,ignore
use arch_sdk::{Connection, Keypair, Transaction};
use arch_program::{
    instruction::Instruction,
    pubkey::Pubkey,
    system_instruction,
};
use anyhow::Result;
use std::str::FromStr;

const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

#[tokio::main]
async fn main() -> Result<()> {
    // 1. Setup connection
    let connection = Connection::new("http://localhost:9002");
    println!("Connecting to Arch Network...");
    
    // 2. Create or load keypairs
    let payer = Keypair::new();
    let recipient = Keypair::new();
    
    println!("Payer: {}", payer.pubkey());
    println!("Recipient: {}", recipient.pubkey());
    
    // 3. Check initial balances
    let payer_balance = connection.get_balance(&payer.pubkey()).await?;
    println!("Payer balance: {} SOL", payer_balance as f64 / LAMPORTS_PER_SOL as f64);
    
    // 4. Create transfer instruction
    let transfer_amount = LAMPORTS_PER_SOL / 10; // 0.1 SOL
    let transfer_ix = system_instruction::transfer(
        &payer.pubkey(),
        &recipient.pubkey(),
        transfer_amount,
    );
    
    // 5. Build transaction
    let mut transaction = Transaction::new_with_payer(
        &[transfer_ix],
        Some(&payer.pubkey()),
    );
    
    // 6. Get recent blockhash and sign
    let recent_blockhash = connection.get_latest_blockhash().await?;
    transaction.sign(&[&payer], recent_blockhash);
    
    // 7. Send transaction
    println!("Sending transaction...");
    match connection.send_and_confirm_transaction(&transaction).await {
        Ok(signature) => {
            println!("Transaction successful!");
            println!("Signature: {}", signature);
            
            // 8. Verify the transfer
            let recipient_balance = connection.get_balance(&recipient.pubkey()).await?;
            println!("Recipient balance: {} SOL", 
                recipient_balance as f64 / LAMPORTS_PER_SOL as f64);
        }
        Err(e) => {
            eprintln!("Transaction failed: {}", e);
        }
    }
    
    Ok(())
}
```

## Next Steps

Now that you understand the basics of the Rust SDK:

1. **[Program Development Guide](program-development.md)** - Build on-chain programs
2. **[Rust API Reference](api-reference.md)** - Complete API documentation
3. **[Advanced Examples](examples.md)** - Complex use cases
4. **[Program Development](../../program/program.md)** - General program concepts
5. **[System Calls](../../program/syscall.md)** - System-level operations

## Resources

- **Crate**: [arch_sdk on crates.io](https://crates.io/crates/arch_sdk)
- **Documentation**: [docs.rs/arch_sdk](https://docs.rs/arch_sdk)
- **GitHub**: [arch-network/arch-network](https://github.com/arch-network/arch-network)
- **Examples**: [Arch Network Examples](https://github.com/arch-network/arch-network/tree/main/examples)
- **Discord**: [Arch Network Discord](https://discord.gg/archnetwork) 