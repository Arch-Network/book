# Writing Your First Arch Program

This comprehensive guide walks you through creating your first Arch program from scratch. We'll build a feature-rich counter program that demonstrates the complete development workflow and all essential concepts you need for building production-ready Arch Network applications.

## What You'll Build

By the end of this guide, you'll have created a complete counter program that:
- Manages state in program accounts  
- Handles multiple instruction types
- Integrates with Bitcoin transactions
- Includes comprehensive error handling
- Provides extensive testing coverage
- Follows security best practices

## Prerequisites

Before starting, ensure you have:
- **Rust 1.70+** and Cargo installed ([Install Rust](https://rustup.rs/))
- **Solana CLI 2.0+** - [Install Guide](https://docs.solana.com/cli/install-solana-cli-tools)
- **Arch Network CLI** - [Download Latest](https://github.com/Arch-Network/arch-node/releases/latest)
- **Running validator** (see [Validator Setup Guide](../getting-started/bitcoin-and-titan-setup.md))
- **Basic Rust knowledge** and understanding of [Arch concepts](../concepts/architecture.md)

## Step 1: Project Setup

### 1.1 Create Project Structure

```bash
# Create project directory
mkdir my-counter-program
cd my-counter-program

# Create program directory
mkdir program
cd program

# Initialize Rust library
cargo init --lib
```

### 1.2 Configure Dependencies

Create a proper `Cargo.toml`:

**program/Cargo.toml**
```toml
[package]
name = "my_counter_program"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_program = "0.5.4"
borsh = { version = "1.5.1", features = ["derive"] }

[lib]
crate-type = ["cdylib", "lib"]

[workspace]
```

### 1.3 Project Structure

Your project should look like this:
```
my-counter-program/
├── program/
│   ├── src/
│   │   └── lib.rs
│   └── Cargo.toml
├── client/          # We'll add this later
└── tests/           # We'll add this later
```

## Step 2: Define Program Data Structures

Create comprehensive data structures for your program:

**program/src/lib.rs**
```rust
use arch_program::{
    account::AccountInfo,
    bitcoin::{self, absolute::LockTime, transaction::Version, Transaction},
    entrypoint,
    helper::add_state_transition,
    input_to_sign::InputToSign,
    msg,
    program::{next_account_info, set_transaction_to_sign},
    program_error::ProgramError,
    pubkey::Pubkey,
    transaction_to_sign::TransactionToSign,
};
use borsh::{BorshDeserialize, BorshSerialize};

/// Counter program state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct CounterAccount {
    /// Current counter value
    pub count: i64,
    /// Who created this counter
    pub authority: Pubkey,
    /// When this counter was created (block height)
    pub created_at: u64,
    /// When this counter was last updated
    pub updated_at: u64,
    /// Total number of operations performed
    pub operation_count: u64,
    /// Whether the counter is frozen
    pub is_frozen: bool,
}

impl CounterAccount {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 8 + 1; // i64 + Pubkey + u64 + u64 + u64 + bool
    
    pub fn new(authority: Pubkey, block_height: u64) -> Self {
        Self {
            count: 0,
            authority,
            created_at: block_height,
            updated_at: block_height,
            operation_count: 0,
            is_frozen: false,
        }
    }
}

/// Instructions that can be performed on the counter
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum CounterInstruction {
    /// Initialize a new counter
    /// Accounts:
    /// 0. [writable, signer] Counter account to initialize
    Initialize,
    
    /// Increment the counter by a specified amount
    /// Accounts:
    /// 0. [writable] Counter account to increment
    /// 1. [signer] Authority or allowed user
    Increment { amount: u32 },
    
    /// Decrement the counter by a specified amount
    /// Accounts:
    /// 0. [writable] Counter account to decrement
    /// 1. [signer] Authority or allowed user
    Decrement { amount: u32 },
    
    /// Reset the counter to zero
    /// Accounts:
    /// 0. [writable] Counter account to reset
    /// 1. [signer] Authority only
    Reset,
    
    /// Freeze the counter to prevent modifications
    /// Accounts:
    /// 0. [writable] Counter account to freeze
    /// 1. [signer] Authority only
    Freeze,
    
    /// Unfreeze the counter to allow modifications
    /// Accounts:
    /// 0. [writable] Counter account to unfreeze
    /// 1. [signer] Authority only
    Unfreeze,
}

/// Parameters for counter operations that require Bitcoin transactions
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CounterParams {
    /// The instruction to execute
    pub instruction: CounterInstruction,
    /// Bitcoin transaction for fees
    pub tx_hex: Vec<u8>,
}

/// Custom errors for the counter program
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CounterError {
    /// Counter is frozen and cannot be modified
    CounterFrozen,
    /// Only the authority can perform this operation
    UnauthorizedAccess,
    /// Counter overflow occurred
    Overflow,
    /// Counter underflow occurred
    Underflow,
    /// Invalid instruction data
    InvalidInstruction,
    /// Counter account not initialized
    UninitializedAccount,
    /// Invalid account provided
    InvalidAccount,
    /// Insufficient fees provided
    InsufficientFees,
}

impl From<CounterError> for ProgramError {
    fn from(e: CounterError) -> Self {
        ProgramError::Custom(match e {
            CounterError::CounterFrozen => 1001,
            CounterError::UnauthorizedAccess => 1002,
            CounterError::Overflow => 1003,
            CounterError::Underflow => 1004,
            CounterError::InvalidInstruction => 1005,
            CounterError::UninitializedAccount => 1006,
            CounterError::InvalidAccount => 1007,
            CounterError::InsufficientFees => 1008,
        })
    }
}
```

## Step 3: Implement Program Logic

Add the complete program implementation:

```rust
// Register program entrypoint
entrypoint!(process_instruction);

/// Main program entrypoint
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    msg!("Counter program invoked");

    // Parse instruction data
    let params: CounterParams = borsh::from_slice(instruction_data)
        .map_err(|_| CounterError::InvalidInstruction)?;

    msg!("Processing instruction: {:?}", params.instruction);

    // Dispatch to appropriate handler
    match params.instruction {
        CounterInstruction::Initialize => {
            process_initialize(accounts, &params.tx_hex)
        }
        CounterInstruction::Increment { amount } => {
            process_increment(accounts, amount, &params.tx_hex)
        }
        CounterInstruction::Decrement { amount } => {
            process_decrement(accounts, amount, &params.tx_hex)
        }
        CounterInstruction::Reset => {
            process_reset(accounts, &params.tx_hex)
        }
        CounterInstruction::Freeze => {
            process_freeze(accounts, &params.tx_hex)
        }
        CounterInstruction::Unfreeze => {
            process_unfreeze(accounts, &params.tx_hex)
        }
    }
}

/// Initialize a new counter account
fn process_initialize(
    accounts: &[AccountInfo],
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !counter_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Check if account is already initialized
    if counter_account.data.borrow().len() >= CounterAccount::SIZE {
        let existing_data = CounterAccount::try_from_slice(&counter_account.data.borrow());
        if existing_data.is_ok() {
            msg!("Counter account already initialized");
            return Err(CounterError::InvalidAccount.into());
        }
    }

    // Initialize counter account
    let counter_data = CounterAccount::new(*counter_account.key, 0); // TODO: Get actual block height
    
    // Ensure account has enough space
    if counter_account.data.borrow().len() < CounterAccount::SIZE {
        counter_account.realloc(CounterAccount::SIZE, true)?;
    }

    // Serialize and store data
    let serialized_data = borsh::to_vec(&counter_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;
    
    counter_account.data.borrow_mut()[..serialized_data.len()]
        .copy_from_slice(&serialized_data);

    msg!("Counter initialized with authority: {}", counter_account.key);

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Increment the counter
fn process_increment(
    accounts: &[AccountInfo],
    amount: u32,
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;
    let authority_account = next_account_info(account_iter).unwrap_or(counter_account);

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !authority_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Load and validate counter data
    let mut counter_data = CounterAccount::try_from_slice(&counter_account.data.borrow())
        .map_err(|_| CounterError::UninitializedAccount)?;

    // Check if counter is frozen
    if counter_data.is_frozen {
        return Err(CounterError::CounterFrozen.into());
    }

    // Perform increment with overflow protection
    let new_count = counter_data.count
        .checked_add(amount as i64)
        .ok_or(CounterError::Overflow)?;

    // Update counter data
    counter_data.count = new_count;
    counter_data.updated_at = 0; // TODO: Get actual block height
    counter_data.operation_count += 1;

    // Save updated data
    save_counter_data(counter_account, &counter_data)?;

    msg!("Counter incremented by {} to {}", amount, new_count);

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Decrement the counter
fn process_decrement(
    accounts: &[AccountInfo],
    amount: u32,
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;
    let authority_account = next_account_info(account_iter).unwrap_or(counter_account);

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !authority_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Load and validate counter data
    let mut counter_data = CounterAccount::try_from_slice(&counter_account.data.borrow())
        .map_err(|_| CounterError::UninitializedAccount)?;

    // Check if counter is frozen
    if counter_data.is_frozen {
        return Err(CounterError::CounterFrozen.into());
    }

    // Perform decrement with underflow protection
    let new_count = counter_data.count
        .checked_sub(amount as i64)
        .ok_or(CounterError::Underflow)?;

    // Update counter data
    counter_data.count = new_count;
    counter_data.updated_at = 0; // TODO: Get actual block height
    counter_data.operation_count += 1;

    // Save updated data
    save_counter_data(counter_account, &counter_data)?;

    msg!("Counter decremented by {} to {}", amount, new_count);

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Reset the counter to zero
fn process_reset(
    accounts: &[AccountInfo],
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;
    let authority_account = next_account_info(account_iter)?;

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !authority_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Load and validate counter data
    let mut counter_data = CounterAccount::try_from_slice(&counter_account.data.borrow())
        .map_err(|_| CounterError::UninitializedAccount)?;

    // Check authority
    if counter_data.authority != *authority_account.key {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Check if counter is frozen
    if counter_data.is_frozen {
        return Err(CounterError::CounterFrozen.into());
    }

    // Reset counter
    counter_data.count = 0;
    counter_data.updated_at = 0; // TODO: Get actual block height
    counter_data.operation_count += 1;

    // Save updated data
    save_counter_data(counter_account, &counter_data)?;

    msg!("Counter reset to 0");

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Freeze the counter
fn process_freeze(
    accounts: &[AccountInfo],
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;
    let authority_account = next_account_info(account_iter)?;

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !authority_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Load and validate counter data
    let mut counter_data = CounterAccount::try_from_slice(&counter_account.data.borrow())
        .map_err(|_| CounterError::UninitializedAccount)?;

    // Check authority
    if counter_data.authority != *authority_account.key {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Freeze counter
    counter_data.is_frozen = true;
    counter_data.updated_at = 0; // TODO: Get actual block height
    counter_data.operation_count += 1;

    // Save updated data
    save_counter_data(counter_account, &counter_data)?;

    msg!("Counter frozen");

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Unfreeze the counter
fn process_unfreeze(
    accounts: &[AccountInfo],
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;
    let authority_account = next_account_info(account_iter)?;

    // Verify account permissions
    if !counter_account.is_writable {
        return Err(CounterError::InvalidAccount.into());
    }

    if !authority_account.is_signer {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Load and validate counter data
    let mut counter_data = CounterAccount::try_from_slice(&counter_account.data.borrow())
        .map_err(|_| CounterError::UninitializedAccount)?;

    // Check authority
    if counter_data.authority != *authority_account.key {
        return Err(CounterError::UnauthorizedAccess.into());
    }

    // Unfreeze counter
    counter_data.is_frozen = false;
    counter_data.updated_at = 0; // TODO: Get actual block height
    counter_data.operation_count += 1;

    // Save updated data
    save_counter_data(counter_account, &counter_data)?;

    msg!("Counter unfrozen");

    // Handle Bitcoin transaction
    handle_bitcoin_transaction(counter_account, tx_hex)?;

    Ok(())
}

/// Helper function to save counter data
fn save_counter_data(
    counter_account: &AccountInfo,
    counter_data: &CounterAccount,
) -> Result<(), ProgramError> {
    let serialized_data = borsh::to_vec(counter_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;
    
    counter_account.data.borrow_mut()[..serialized_data.len()]
        .copy_from_slice(&serialized_data);
    
    Ok(())
}

/// Handle Bitcoin transaction for state changes
fn handle_bitcoin_transaction(
    account: &AccountInfo,
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    if tx_hex.is_empty() {
        return Err(CounterError::InsufficientFees.into());
    }

    // Deserialize the fee transaction
    let fees_tx: Transaction = bitcoin::consensus::deserialize(tx_hex)
        .map_err(|_| CounterError::InsufficientFees)?;

    msg!("Processing Bitcoin transaction with {} inputs", fees_tx.input.len());

    // Create state transition transaction
    let mut tx = Transaction {
        version: Version::TWO,
        lock_time: LockTime::ZERO,
        input: vec![],
        output: vec![],
    };

    // Add state transition for our account
    add_state_transition(&mut tx, account);
    
    // Add fee input
    if !fees_tx.input.is_empty() {
        tx.input.push(fees_tx.input[0].clone());
    }

    // Prepare transaction for signing
    let tx_to_sign = TransactionToSign {
        tx_bytes: &bitcoin::consensus::serialize(&tx),
        inputs_to_sign: &[InputToSign {
            index: 0,
            signer: account.key.clone(),
        }],
    };

    msg!("Submitting transaction for signing");
    set_transaction_to_sign(&[account.clone()], tx_to_sign)?;

    Ok(())
}
```

## Step 4: Build Your Program

Build your program using the Solana toolchain:

```bash
cd program

# Build the program
cargo build-sbf

# Verify the build output
ls target/deploy/
```

You should see `my_counter_program.so` in the `target/deploy/` directory.

## Step 5: Deploy Your Program

Deploy your program to the Arch Network:

```bash
# Deploy to testnet (recommended for testing)
arch-cli deploy ./target/deploy/ --network-mode testnet

# Or deploy to local network for development
arch-cli deploy ./target/deploy/ --network-mode regtest
```

**Save the Program ID** from the output - you'll need it for testing!

## Step 6: Create a Client for Testing

Create a client to interact with your program:

**client/Cargo.toml**
```toml
[package]
name = "counter_client"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_sdk = "0.5.4"
my_counter_program = { path = "../program" }
borsh = "1.5.1"
tokio = { version = "1.0", features = ["full"] }
```

**client/src/main.rs**
```rust
use arch_sdk::{
    instruction::Instruction,
    message::ArchMessage,
    pubkey::Pubkey,
    signer::{create_account, Keypair},
    transaction::Transaction,
};
use my_counter_program::{CounterInstruction, CounterParams, CounterAccount};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Your program ID (replace with actual deployed program ID)
    let program_id = Pubkey::from_str("YOUR_PROGRAM_ID_HERE")?;
    
    // Create a new account for the counter
    let counter_keypair = Keypair::new();
    
    // Create fee transaction (simplified)
    let fee_tx = create_fee_transaction();
    
    // Test initialize instruction
    test_initialize(&program_id, &counter_keypair, &fee_tx)?;
    
    // Test increment instruction
    test_increment(&program_id, &counter_keypair, &fee_tx, 5)?;
    
    // Test decrement instruction
    test_decrement(&program_id, &counter_keypair, &fee_tx, 2)?;
    
    // Test reset instruction
    test_reset(&program_id, &counter_keypair, &fee_tx)?;
    
    println!("All tests completed successfully!");
    Ok(())
}

fn test_initialize(
    program_id: &Pubkey,
    counter_keypair: &Keypair,
    fee_tx: &[u8],
) -> Result<(), Box<dyn std::error::Error>> {
    let params = CounterParams {
        instruction: CounterInstruction::Initialize,
        tx_hex: fee_tx.to_vec(),
    };
    
    let instruction = Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(counter_keypair.pubkey(), true),
        ],
        data: borsh::to_vec(&params)?,
    };
    
    // Send transaction (implementation depends on your client setup)
    send_transaction(&instruction, &[counter_keypair])?;
    
    println!("Counter initialized successfully");
    Ok(())
}

// Add similar functions for other operations...
```

## Step 7: Comprehensive Testing

Create extensive tests for your program:

**tests/integration_tests.rs**
```rust
use my_counter_program::*;
use arch_test_sdk::*;

#[tokio::test]
async fn test_counter_full_workflow() {
    let (client, _boot_info) = initialize_client();
    
    // Deploy program
    let program_id = deploy_counter_program(&client).await;
    
    // Create test account
    let user_keypair = Keypair::new();
    fund_account(&client, &user_keypair.pubkey(), 1000).await;
    
    // Test initialization
    let counter_account = test_initialize(&client, &program_id, &user_keypair).await;
    verify_counter_state(&client, &counter_account, 0, false).await;
    
    // Test increment
    test_increment(&client, &program_id, &counter_account, &user_keypair, 10).await;
    verify_counter_state(&client, &counter_account, 10, false).await;
    
    // Test decrement
    test_decrement(&client, &program_id, &counter_account, &user_keypair, 3).await;
    verify_counter_state(&client, &counter_account, 7, false).await;
    
    // Test freeze
    test_freeze(&client, &program_id, &counter_account, &user_keypair).await;
    verify_counter_state(&client, &counter_account, 7, true).await;
    
    // Test operations while frozen (should fail)
    let result = test_increment(&client, &program_id, &counter_account, &user_keypair, 1).await;
    assert!(result.is_err(), "Increment should fail when counter is frozen");
    
    // Test unfreeze
    test_unfreeze(&client, &program_id, &counter_account, &user_keypair).await;
    verify_counter_state(&client, &counter_account, 7, false).await;
    
    // Test reset
    test_reset(&client, &program_id, &counter_account, &user_keypair).await;
    verify_counter_state(&client, &counter_account, 0, false).await;
}

#[tokio::test]
async fn test_error_conditions() {
    // Test overflow protection
    // Test underflow protection
    // Test unauthorized access
    // Test invalid instructions
    // TODO: Implement comprehensive error testing
}
```

## Step 8: Best Practices Implementation

### Security Considerations

1. **Input Validation**: Always validate all inputs
2. **Overflow Protection**: Use checked arithmetic operations
3. **Access Control**: Verify account ownership and permissions
4. **State Validation**: Ensure account state is valid before operations

### Performance Optimization

1. **Efficient Serialization**: Use Borsh for optimal performance
2. **Minimal Account Size**: Keep state structures compact
3. **Transaction Batching**: Group related operations when possible

### Error Handling

1. **Custom Error Types**: Define specific errors for better debugging
2. **Comprehensive Logging**: Use `msg!` for important state changes
3. **Graceful Failures**: Handle edge cases appropriately

## Next Steps

Now that you've built your first program:

1. **Enhance the Counter**: Add features like access control lists, multiple counters per account, or counter metadata
2. **Explore Advanced Patterns**: Learn about [Program Derived Addresses](../program/accounts.md) and [Cross-Program Invocation](../program/instructions-and-messages.md)
3. **Build Complex Programs**: Try the [Token Program](./how-to-create-a-fungible-token.md) or [Oracle Program](./how-to-write-oracle-program.md) guides
4. **Deploy to Mainnet**: When ready, deploy your programs to mainnet (when available)

## Additional Resources

- [Understanding Arch Programs](./understanding-arch-programs.md) - Deep dive into program architecture
- [Testing Guide](./testing-guide.md) - Comprehensive testing strategies
- [Program Examples](https://github.com/Arch-Network/arch-examples) - More example programs
- [API Reference](../rpc/http-methods.md) - Complete RPC documentation

**Congratulations!** You've successfully built, deployed, and tested your first Arch Network program. You now have the foundation to build more complex applications on the Arch Network.

```bash
# Start the Arch Network validator
arch-cli validator-start
```
