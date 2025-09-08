# Rust SDK Examples

This page provides practical examples of using the native Arch Network Rust SDK for building high-performance applications and on-chain programs.

## Basic Examples

### Account Management

```rust,ignore
use arch_sdk::{Connection, Keypair, Account};
use arch_program::pubkey::Pubkey;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let connection = Connection::new("http://localhost:9002");
    
    // Create new account
    let new_account = Keypair::new();
    println!("New account: {}", new_account.pubkey());
    
    // Check if account exists
    match connection.get_account(&new_account.pubkey()).await? {
        Some(account) => {
            println!("Account exists with {} lamports", account.lamports);
        }
        None => {
            println!("Account does not exist yet");
        }
    }
    
    // Get multiple accounts efficiently
    let pubkeys = vec![
        Pubkey::new_unique(),
        Pubkey::new_unique(),
        new_account.pubkey(),
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

### UTXO Operations

```rust,ignore
use arch_sdk::{Connection, Utxo};
use arch_program::pubkey::Pubkey;
use std::str::FromStr;

async fn utxo_operations() -> Result<()> {
    let connection = Connection::new("http://localhost:9002");
    let address = Pubkey::from_str("YourBitcoinAddress...")?;
    
    // Get UTXOs for an address
    let utxos = connection.get_utxos(&address).await?;
    
    println!("Found {} UTXOs", utxos.len());
    
    // Process UTXOs
    let total_value: u64 = utxos.iter()
        .map(|utxo| utxo.value)
        .sum();
    
    println!("Total value: {} satoshis", total_value);
    
    // Find spendable UTXOs above threshold
    let threshold = 10_000; // satoshis
    let spendable: Vec<&Utxo> = utxos.iter()
        .filter(|utxo| utxo.value >= threshold)
        .collect();
    
    println!("Spendable UTXOs: {}", spendable.len());
    
    Ok(())
}
```

### Transaction Building

```rust,ignore
use arch_sdk::{Connection, Keypair, Transaction};
use arch_program::{
    instruction::Instruction,
    system_instruction,
    pubkey::Pubkey,
    message::Message,
};

async fn build_complex_transaction() -> Result<()> {
    let connection = Connection::new("http://localhost:9002");
    let payer = Keypair::new();
    
    // Create multiple instructions
    let mut instructions = vec![];
    
    // 1. Create a new account
    let new_account = Keypair::new();
    let space = 1024;
    let rent = connection.get_minimum_balance_for_rent_exemption(space).await?;
    
    instructions.push(system_instruction::create_account(
        &payer.pubkey(),
        &new_account.pubkey(),
        rent,
        space,
        &my_program_id(),
    ));
    
    // 2. Initialize the account
    instructions.push(Instruction::new_with_bytes(
        my_program_id(),
        &[0], // Initialize instruction
        vec![
            AccountMeta::new(new_account.pubkey(), true),
            AccountMeta::new_readonly(payer.pubkey(), true),
        ],
    ));
    
    // 3. Transfer some lamports
    instructions.push(system_instruction::transfer(
        &payer.pubkey(),
        &new_account.pubkey(),
        1_000_000,
    ));
    
    // Build and sign transaction
    let message = Message::new(&instructions, Some(&payer.pubkey()));
    let mut transaction = Transaction::new_unsigned(message);
    
    let recent_blockhash = connection.get_latest_blockhash().await?;
    transaction.sign(&[&payer, &new_account], recent_blockhash);
    
    // Send transaction
    let signature = connection.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction successful: {}", signature);
    
    Ok(())
}
```

## On-Chain Program Examples

### State Management Program

```rust,ignore
use arch_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
    pub last_updated: i64,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CounterInstruction::try_from_slice(instruction_data)?;
    
    match instruction {
        CounterInstruction::Initialize { authority } => {
            process_initialize(program_id, accounts, authority)
        }
        CounterInstruction::Increment => {
            process_increment(program_id, accounts)
        }
        CounterInstruction::Reset => {
            process_reset(program_id, accounts)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    authority: Pubkey,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    
    // Verify account ownership
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Initialize counter
    let counter = Counter {
        count: 0,
        authority,
        last_updated: Clock::get()?.unix_timestamp,
    };
    
    counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
    msg!("Counter initialized with authority: {}", authority);
    
    Ok(())
}

fn process_increment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    
    // Deserialize counter
    let mut counter = Counter::try_from_slice(&counter_account.data.borrow())?;
    
    // Verify authority
    if !authority.is_signer || *authority.key != counter.authority {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Increment counter
    counter.count = counter.count
        .checked_add(1)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    counter.last_updated = Clock::get()?.unix_timestamp;
    
    // Save state
    counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
    msg!("Counter incremented to: {}", counter.count);
    
    Ok(())
}
```

### Cross-Program Invocation (CPI)

```rust,ignore
use arch_program::{
    account_info::AccountInfo,
    program::{invoke, invoke_signed},
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
};

pub fn transfer_via_cpi(
    from: &AccountInfo,
    to: &AccountInfo,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> ProgramResult {
    let transfer_instruction = system_instruction::transfer(
        from.key,
        to.key,
        amount,
    );
    
    // If the from account is a PDA, use invoke_signed
    if signer_seeds.is_empty() {
        invoke(
            &transfer_instruction,
            &[from.clone(), to.clone()],
        )
    } else {
        invoke_signed(
            &transfer_instruction,
            &[from.clone(), to.clone()],
            signer_seeds,
        )
    }
}

// Example: Escrow program using CPI
pub fn release_escrow(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let escrow_account = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let escrow_pda = next_account_info(accounts_iter)?;
    
    // Verify PDA
    let (pda, bump) = Pubkey::find_program_address(
        &[b"escrow", escrow_account.key.as_ref()],
        program_id,
    );
    
    if pda != *escrow_pda.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Transfer funds from PDA to recipient
    transfer_via_cpi(
        escrow_pda,
        recipient,
        escrow_pda.lamports(),
        &[&[b"escrow", escrow_account.key.as_ref(), &[bump]]],
    )?;
    
    Ok(())
}
```

## Advanced Patterns

### Concurrent Operations

```rust,ignore
use futures::future::{join_all, try_join_all};
use std::sync::Arc;
use tokio::task::JoinHandle;

async fn concurrent_account_processing(
    connection: Arc<Connection>,
    pubkeys: Vec<Pubkey>,
) -> Result<Vec<Option<Account>>> {
    // Create tasks for concurrent fetching
    let tasks: Vec<JoinHandle<Result<Option<Account>>>> = pubkeys
        .into_iter()
        .map(|pubkey| {
            let conn = connection.clone();
            tokio::spawn(async move {
                conn.get_account(&pubkey).await
            })
        })
        .collect();
    
    // Wait for all tasks to complete
    let results = join_all(tasks).await;
    
    // Handle results
    let mut accounts = Vec::new();
    for result in results {
        match result {
            Ok(Ok(account)) => accounts.push(account),
            Ok(Err(e)) => return Err(e),
            Err(e) => return Err(anyhow::anyhow!("Task failed: {}", e)),
        }
    }
    
    Ok(accounts)
}

// Batch processing with rate limiting
use tokio::time::{sleep, Duration};

async fn batch_process_with_rate_limit<T, F, Fut>(
    items: Vec<T>,
    batch_size: usize,
    delay_ms: u64,
    process_fn: F,
) -> Result<Vec<Result<(), anyhow::Error>>>
where
    F: Fn(T) -> Fut + Clone,
    Fut: std::future::Future<Output = Result<()>>,
    T: Send + 'static,
{
    let mut results = Vec::new();
    
    for chunk in items.chunks(batch_size) {
        let futures: Vec<_> = chunk
            .iter()
            .map(|item| {
                let f = process_fn.clone();
                f(item.clone())
            })
            .collect();
        
        let batch_results = try_join_all(futures).await;
        results.extend(batch_results);
        
        // Rate limit between batches
        sleep(Duration::from_millis(delay_ms)).await;
    }
    
    Ok(results)
}
```

### Custom Error Handling

```rust,ignore
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ArchAppError {
    #[error("Connection error: {0}")]
    Connection(#[from] arch_sdk::ArchError),
    
    #[error("Invalid account: {0}")]
    InvalidAccount(String),
    
    #[error("Insufficient balance: needed {needed}, available {available}")]
    InsufficientBalance { needed: u64, available: u64 },
    
    #[error("Transaction failed: {0}")]
    TransactionFailed(String),
}

// Retry logic with exponential backoff
async fn retry_with_backoff<T, F, Fut>(
    operation: F,
    max_retries: u32,
) -> Result<T, ArchAppError>
where
    F: Fn() -> Fut,
    Fut: std::future::Future<Output = Result<T, ArchAppError>>,
{
    let mut delay = Duration::from_millis(100);
    
    for attempt in 0..max_retries {
        match operation().await {
            Ok(result) => return Ok(result),
            Err(e) => {
                if attempt == max_retries - 1 {
                    return Err(e);
                }
                
                println!("Attempt {} failed: {}. Retrying...", attempt + 1, e);
                sleep(delay).await;
                delay *= 2; // Exponential backoff
            }
        }
    }
    
    unreachable!()
}
```

## Testing Patterns

### Integration Tests

```rust,ignore
#[cfg(test)]
mod tests {
    use super::*;
    use arch_sdk::test_utils::{TestValidator, TestValidatorGenesis};
    
    #[tokio::test]
    async fn test_program_deployment() {
        // Start test validator
        let mut genesis = TestValidatorGenesis::default();
        genesis.add_program("my_program", my_program_id());
        
        let validator = TestValidator::with_genesis(genesis).await;
        let connection = validator.connection();
        
        // Test program functionality
        let payer = validator.payer();
        let account = Keypair::new();
        
        // Create and initialize account
        let ix = create_initialize_instruction(
            &my_program_id(),
            &account.pubkey(),
            &payer.pubkey(),
        );
        
        let mut transaction = Transaction::new_with_payer(
            &[ix],
            Some(&payer.pubkey()),
        );
        
        let recent_blockhash = connection.get_latest_blockhash().await.unwrap();
        transaction.sign(&[&payer, &account], recent_blockhash);
        
        let result = connection.send_and_confirm_transaction(&transaction).await;
        assert!(result.is_ok());
    }
}
```

## Performance Optimization

### Connection Pooling

```rust,ignore
use std::sync::Arc;
use dashmap::DashMap;

pub struct ConnectionPool {
    connections: DashMap<String, Arc<Connection>>,
}

impl ConnectionPool {
    pub fn new() -> Self {
        Self {
            connections: DashMap::new(),
        }
    }
    
    pub fn get_connection(&self, endpoint: &str) -> Arc<Connection> {
        self.connections
            .entry(endpoint.to_string())
            .or_insert_with(|| Arc::new(Connection::new(endpoint)))
            .clone()
    }
}

// Usage
lazy_static::lazy_static! {
    static ref POOL: ConnectionPool = ConnectionPool::new();
}

async fn use_pooled_connection() -> Result<()> {
    let connection = POOL.get_connection("http://localhost:9002");
    let block_count = connection.get_block_count().await?;
    println!("Block count: {}", block_count);
    Ok(())
}
```

## Resources

For more examples and patterns:
- [Arch Network Examples](https://github.com/arch-network/arch-network/tree/main/examples)
- [Rust SDK Documentation](https://docs.rs/arch_sdk)
- [Program Examples](../../program/program.md)
- [Integration Test Examples](https://github.com/arch-network/arch-network/tree/main/tests) 