# Understanding Arch Programs

This comprehensive guide walks you through building Arch Network programs by examining a complete, working example. We'll build a "Hello World" program that demonstrates all the essential concepts you need to start developing on Arch Network.

## What You'll Learn

By the end of this guide, you'll understand:
- Program structure and architecture
- Account management and state handling  
- Bitcoin transaction integration
- Error handling best practices
- Testing and deployment patterns

## Complete Example: Hello World Program

Let's build a complete program that stores personalized greetings and demonstrates key Arch Network concepts.

### 1. Project Setup

First, create your program with the correct dependencies:

**Cargo.toml**
```toml
[package]
name = "hello_world_program"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_program = { path = "../../program" }
borsh = { version = "1.5.1", features = ["derive"] }

[lib]
crate-type = ["cdylib", "lib"]

[workspace]
```

### 2. Program Dependencies and Imports

**src/lib.rs**
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
```

**Key Dependencies Explained:**
- `AccountInfo`: Access to account data and metadata
- `bitcoin`: Bitcoin transaction types and functionality
- `entrypoint`: Macro for registering program entry point
- `helper::add_state_transition`: Manages Bitcoin state transitions
- `msg`: Logging for debugging and monitoring
- `borsh`: Efficient serialization for program data

### 3. Program Data Structures

```rust
/// Parameters sent to our Hello World program
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct HelloWorldParams {
    /// The name to include in the greeting
    pub name: String,
    /// Bitcoin transaction for paying fees
    pub tx_hex: Vec<u8>,
}

/// State stored in the account
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct GreetingAccount {
    /// The greeting message
    pub message: String,
    /// Who was greeted
    pub name: String,
    /// When this greeting was created (block height)
    pub created_at: u64,
    /// How many times this account has been updated
    pub update_count: u32,
}

impl GreetingAccount {
    pub const MAX_SIZE: usize = 4 + 50 + 4 + 50 + 8 + 4; // Borsh overhead + data
    
    pub fn new(name: String, message: String, block_height: u64) -> Self {
        Self {
            message,
            name,
            created_at: block_height,
            update_count: 1,
        }
    }
}
```

### 4. Custom Error Handling

```rust
/// Custom errors for our Hello World program
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HelloWorldError {
    /// The provided name is too long (max 50 chars)
    NameTooLong,
    /// The provided name is empty
    NameEmpty,
    /// The provided name contains invalid characters
    InvalidCharacters,
    /// Account data is corrupted
    InvalidAccountData,
    /// Insufficient fees provided
    InsufficientFees,
}

impl From<HelloWorldError> for ProgramError {
    fn from(e: HelloWorldError) -> Self {
        ProgramError::Custom(match e {
            HelloWorldError::NameTooLong => 1001,
            HelloWorldError::NameEmpty => 1002,
            HelloWorldError::InvalidCharacters => 1003,
            HelloWorldError::InvalidAccountData => 1004,
            HelloWorldError::InsufficientFees => 1005,
        })
    }
}

/// Validates the provided name
fn validate_name(name: &str) -> Result<(), HelloWorldError> {
    if name.is_empty() {
        return Err(HelloWorldError::NameEmpty);
    }
    
    if name.len() > 50 {
        return Err(HelloWorldError::NameTooLong);
    }
    
    if !name.chars().all(|c| c.is_alphanumeric() || c.is_whitespace() || c == '-' || c == '_') {
        return Err(HelloWorldError::InvalidCharacters);
    }
    
    Ok(())
}
```

### 5. Program Entry Point and Logic

```rust
// Register our program's entry point
entrypoint!(process_instruction);

/// Main program entry point
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    msg!("Hello World program invoked");

    // Parse instruction data
    let params: HelloWorldParams = borsh::from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
    // Validate input
    validate_name(&params.name)?;
    
    msg!("Processing greeting for: {}", params.name);

    // Validate accounts
    if accounts.len() != 1 {
        msg!("Expected 1 account, got {}", accounts.len());
        return Err(ProgramError::NotEnoughAccountKeys);
    }

    let account_iter = &mut accounts.iter();
    let greeting_account = next_account_info(account_iter)?;

    // Verify account permissions
    if !greeting_account.is_writable {
        msg!("Account must be writable");
        return Err(ProgramError::InvalidAccountData);
    }

    if !greeting_account.is_signer {
        msg!("Account must be a signer");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Process the greeting
    process_greeting(greeting_account, &params)?;
    
    // Handle Bitcoin transaction
    handle_bitcoin_transaction(greeting_account, &params.tx_hex)?;

    msg!("Hello World program completed successfully");
    Ok(())
}

/// Processes the greeting and updates account state
fn process_greeting(
    account: &AccountInfo,
    params: &HelloWorldParams,
) -> Result<(), ProgramError> {
    let current_data_len = account.data.borrow().len();
    
    // Check if account is initialized
    let mut greeting_data = if current_data_len == 0 {
        msg!("Initializing new greeting account");
        GreetingAccount::new(
            params.name.clone(),
            format!("Hello, {}! Welcome to Arch Network!", params.name),
            0, // We'll get actual block height in a real implementation
        )
    } else {
        // Update existing account
        let existing_data = GreetingAccount::try_from_slice(&account.data.borrow())
            .map_err(|_| HelloWorldError::InvalidAccountData)?;
        
        msg!("Updating greeting for existing account");
        GreetingAccount {
            message: format!("Hello again, {}! Visit count: {}", 
                           params.name, existing_data.update_count + 1),
            name: params.name.clone(),
            created_at: existing_data.created_at,
            update_count: existing_data.update_count + 1,
        }
    };

    // Serialize the new data
    let serialized_data = borsh::to_vec(&greeting_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // Ensure account has enough space
    if serialized_data.len() > current_data_len {
        msg!("Reallocating account space from {} to {} bytes", 
             current_data_len, serialized_data.len());
        account.realloc(serialized_data.len(), true)?;
    }

    // Write the data
    account.data.borrow_mut().copy_from_slice(&serialized_data);
    
    msg!("Greeting stored: {}", greeting_data.message);
    Ok(())
}

/// Handles Bitcoin transaction for state transition
fn handle_bitcoin_transaction(
    account: &AccountInfo,
    tx_hex: &[u8],
) -> Result<(), ProgramError> {
    if tx_hex.is_empty() {
        return Err(HelloWorldError::InsufficientFees.into());
    }

    // Deserialize the fee transaction
    let fees_tx: Transaction = bitcoin::consensus::deserialize(tx_hex)
        .map_err(|_| HelloWorldError::InsufficientFees)?;

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

## Program Architecture Breakdown

### 1. **Entrypoint Pattern**
```rust
entrypoint!(process_instruction);
```
Every Arch program needs exactly one entry point. The `entrypoint!` macro registers your `process_instruction` function as the program's main entry point.

### 2. **Function Signature**
```rust
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError>
```

**Parameters explained:**
- `program_id`: Your program's public key (often unused in simple programs)
- `accounts`: Array of accounts this instruction will read/write
- `instruction_data`: Serialized parameters for your specific instruction

### 3. **Account Validation**
Always validate accounts before use:
```rust
// Check account count
if accounts.len() != expected_count {
    return Err(ProgramError::NotEnoughAccountKeys);
}

// Check permissions
if !account.is_writable {
    return Err(ProgramError::InvalidAccountData);
}

if !account.is_signer {
    return Err(ProgramError::MissingRequiredSignature);
}
```

### 4. **State Management**
```rust
// Read existing state
let data = MyState::try_from_slice(&account.data.borrow())?;

// Modify state
let new_data = MyState { /* updated fields */ };

// Serialize and store
let serialized = borsh::to_vec(&new_data)?;
account.data.borrow_mut().copy_from_slice(&serialized);
```

### 5. **Bitcoin Integration**
Every state change must be committed to Bitcoin:
```rust
// Create Bitcoin transaction
let mut tx = Transaction { /* ... */ };

// Add state transition
add_state_transition(&mut tx, account);

// Submit for signing
set_transaction_to_sign(accounts, TransactionToSign { /* ... */ })?;
```

## Testing Your Program

Create comprehensive tests for your program:

**tests/integration_test.rs**
```rust
use arch_sdk::helper::sign_and_send_instruction;
use arch_test_sdk::{
    get_balance_bitcoin, initialize_client, Account, Balance
};

#[test]
fn test_hello_world_basic() {
    let (client, _boot_info) = initialize_client();
    
    let program_pubkey = deploy_program();
    let user_account = Account::new();
    
    // Test initial greeting
    let params = HelloWorldParams {
        name: "Alice".to_string(),
        tx_hex: create_fee_transaction(),
    };
    
    let result = send_hello_instruction(&client, &program_pubkey, &user_account, params);
    assert!(result.is_ok());
    
    // Verify state was stored correctly
    let account_data = client.read_account_info(user_account.pubkey()).unwrap();
    let greeting = GreetingAccount::try_from_slice(&account_data.data).unwrap();
    
    assert_eq!(greeting.name, "Alice");
    assert!(greeting.message.contains("Hello, Alice"));
    assert_eq!(greeting.update_count, 1);
}

#[test]
fn test_error_handling() {
    // Test name too long
    let params = HelloWorldParams {
        name: "A".repeat(100), // Too long
        tx_hex: create_fee_transaction(),
    };
    
    let result = send_hello_instruction(&client, &program_pubkey, &user_account, params);
    assert!(result.is_err());
    
    // Test empty name
    let params = HelloWorldParams {
        name: "".to_string(),
        tx_hex: create_fee_transaction(),
    };
    
    let result = send_hello_instruction(&client, &program_pubkey, &user_account, params);
    assert!(result.is_err());
}
```

## Best Practices

### 1. **Error Handling**
- Define custom error types for better debugging
- Use descriptive error messages with `msg!`
- Validate all inputs before processing
- Handle both program logic and Bitcoin transaction errors

### 2. **Account Management**
- Always check account permissions (`is_signer`, `is_writable`)
- Validate account ownership when needed
- Use `realloc` when data size changes
- Consider account rent and minimum balances

### 3. **State Design**
- Keep state structures simple and well-defined
- Use Borsh for efficient serialization
- Consider data size limits
- Plan for state evolution

### 4. **Bitcoin Integration**
- Always include fee transactions
- Validate transaction structure
- Use proper input/output management
- Handle signing requirements correctly

### 5. **Security**
- Validate all input parameters
- Check account ownership and permissions
- Prevent reentrancy attacks
- Use safe arithmetic operations

## Common Patterns

### Program-Derived Addresses (PDAs)
```rust
let (pda, bump) = Pubkey::find_program_address(
    &[b"greeting", user.key.as_ref()],
    program_id
);
```

### Cross-Program Invocation (CPI)
```rust
let instruction = system_instruction::create_account(/* ... */);
invoke(&instruction, &[account1, account2, system_program])?;
```

### Multiple Instructions
```rust
match MyInstruction::try_from_slice(instruction_data)? {
    MyInstruction::Initialize { .. } => process_initialize(accounts)?,
    MyInstruction::Update { .. } => process_update(accounts)?,
    MyInstruction::Close => process_close(accounts)?,
}
```

## Next Steps

Now that you understand the fundamentals:

1. **Explore Advanced Examples**: Check out the [token program](../apl/token-program.md) and [oracle implementation](./how-to-write-oracle-program.md)
2. **Learn Testing**: Set up comprehensive test suites for your programs
3. **Understand PDAs**: Master program-derived addresses for complex state management
4. **Study CPI**: Learn cross-program invocation for composable programs
5. **Deploy and Monitor**: Learn deployment and monitoring best practices

## Additional Resources

- [Program Examples Repository](https://github.com/Arch-Network/arch-examples)
- [APL Token Implementation](../apl/token-program.md)
- [Bitcoin Integration Guide](../concepts/bitcoin-integration.md)
- [RPC API Reference](../rpc/http-methods.md)

The complete code for this example is available in the [Hello World example](https://github.com/Arch-Network/arch-examples/tree/main/examples/helloworld).
