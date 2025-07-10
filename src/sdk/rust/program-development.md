# Program Development Guide

This guide covers developing on-chain programs (smart contracts) for the Arch Network using the Rust SDK.

## Overview

Arch Network programs are compiled Rust code that runs on the network's runtime. Programs can:
- Manage account state
- Process transactions
- Interact with other programs
- Interface with Bitcoin UTXOs

## Setting Up Your Development Environment

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Arch CLI tools
cargo install arch-cli

# Install BPF tools
arch install
```

### Project Structure

```bash
my-program/
├── Cargo.toml
├── src/
│   ├── lib.rs         # Program entrypoint
│   ├── instruction.rs # Instruction definitions
│   ├── processor.rs   # Processing logic
│   ├── state.rs      # State structures
│   └── error.rs      # Custom errors
├── tests/
│   └── integration.rs # Integration tests
└── deploy/
    └── deploy.ts      # Deployment scripts
```

## Your First Program

### Basic Program Structure

```rust
// src/lib.rs
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
    msg!("Program entrypoint");
    
    // Your program logic here
    Ok(())
}
```

### Cargo.toml Configuration

```toml
[package]
name = "my_program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[features]
no-entrypoint = []
test-bpf = []

[dependencies]
arch_program = "0.5.4"
borsh = "1.5.1"
thiserror = "1.0"

[dev-dependencies]
arch_sdk = "0.5.4"
tokio = { version = "1", features = ["full"] }
```

## Instruction Processing

### Define Instructions

```rust
// src/instruction.rs
use borsh::{BorshDeserialize, BorshSerialize};
use arch_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_program,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum MyInstruction {
    /// Initialize a new account
    /// Accounts:
    /// 0. `[writable]` The account to initialize
    /// 1. `[signer]` The account's authority
    Initialize {
        seed: u64,
    },
    
    /// Update account data
    /// Accounts:
    /// 0. `[writable]` The account to update
    /// 1. `[signer]` The account's authority
    Update {
        data: Vec<u8>,
    },
    
    /// Transfer ownership
    /// Accounts:
    /// 0. `[writable]` The account to transfer
    /// 1. `[signer]` Current authority
    /// 2. `[]` New authority
    Transfer,
}

impl MyInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        MyInstruction::try_from_slice(input)
            .map_err(|_| ProgramError::InvalidInstructionData)
    }
}
```

### Process Instructions

```rust
// src/processor.rs
use arch_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use crate::{instruction::MyInstruction, state::MyState};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = MyInstruction::unpack(instruction_data)?;
        
        match instruction {
            MyInstruction::Initialize { seed } => {
                msg!("Instruction: Initialize");
                Self::process_initialize(accounts, seed, program_id)
            }
            MyInstruction::Update { data } => {
                msg!("Instruction: Update");
                Self::process_update(accounts, data, program_id)
            }
            MyInstruction::Transfer => {
                msg!("Instruction: Transfer");
                Self::process_transfer(accounts, program_id)
            }
        }
    }
    
    fn process_initialize(
        accounts: &[AccountInfo],
        seed: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let account = next_account_info(account_info_iter)?;
        let authority = next_account_info(account_info_iter)?;
        
        // Verify account ownership
        if account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        // Verify authority is signer
        if !authority.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Initialize state
        let state = MyState {
            is_initialized: true,
            authority: *authority.key,
            seed,
            data: vec![],
        };
        
        state.serialize(&mut &mut account.data.borrow_mut()[..])?;
        msg!("Account initialized successfully");
        
        Ok(())
    }
}
```

## State Management

### Define State Structures

```rust
// src/state.rs
use borsh::{BorshDeserialize, BorshSerialize};
use arch_program::{
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct MyState {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub seed: u64,
    pub data: Vec<u8>,
}

impl MyState {
    pub const LEN: usize = 1 + 32 + 8 + 4; // Base size without dynamic data
    
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        MyState::try_from_slice(input)
            .map_err(|_| ProgramError::InvalidAccountData)
    }
    
    pub fn pack(&self, dst: &mut [u8]) -> Result<(), ProgramError> {
        self.serialize(&mut &mut dst[..])
            .map_err(|_| ProgramError::InvalidAccountData)
    }
}

// Account size calculation helper
impl MyState {
    pub fn get_packed_len(data_len: usize) -> usize {
        Self::LEN + data_len
    }
}
```

### Program-Derived Addresses (PDAs)

```rust
use arch_program::{
    pubkey::Pubkey,
    program_error::ProgramError,
};

pub fn find_program_address(
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(seeds, program_id)
}

// Example: Creating a PDA for user data
pub fn get_user_pda(
    user: &Pubkey,
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    find_program_address(
        &[b"user", user.as_ref()],
        program_id,
    )
}

// Using PDAs in instructions
fn process_create_pda(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    
    let (pda, bump) = get_user_pda(user.key, program_id);
    
    if pda != *pda_account.key {
        return Err(ProgramError::InvalidSeeds);
    }
    
    // Create PDA account
    let rent = Rent::get()?;
    let space = MyState::LEN;
    let lamports = rent.minimum_balance(space);
    
    invoke_signed(
        &system_instruction::create_account(
            user.key,
            &pda,
            lamports,
            space as u64,
            program_id,
        ),
        &[user.clone(), pda_account.clone(), system_program.clone()],
        &[&[b"user", user.key.as_ref(), &[bump]]],
    )?;
    
    Ok(())
}
```

## Cross-Program Invocation (CPI)

### Making CPI Calls

```rust
use arch_program::{
    account_info::AccountInfo,
    instruction::{AccountMeta, Instruction},
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
};

// Simple CPI
pub fn transfer_tokens_cpi(
    token_program_id: &Pubkey,
    source: &AccountInfo,
    destination: &AccountInfo,
    authority: &AccountInfo,
    amount: u64,
) -> ProgramResult {
    let accounts = vec![
        AccountMeta::new(*source.key, false),
        AccountMeta::new(*destination.key, false),
        AccountMeta::new_readonly(*authority.key, true),
    ];
    
    let instruction = Instruction::new_with_bytes(
        *token_program_id,
        &[3, amount.to_le_bytes()].concat(), // Transfer instruction
        accounts,
    );
    
    invoke(
        &instruction,
        &[source.clone(), destination.clone(), authority.clone()],
    )
}

// CPI with PDA signer
pub fn transfer_from_pda(
    source_pda: &AccountInfo,
    destination: &AccountInfo,
    amount: u64,
    pda_seeds: &[&[u8]],
    program_id: &Pubkey,
) -> ProgramResult {
    let instruction = system_instruction::transfer(
        source_pda.key,
        destination.key,
        amount,
    );
    
    invoke_signed(
        &instruction,
        &[source_pda.clone(), destination.clone()],
        &[pda_seeds],
    )
}
```

## Error Handling

### Custom Errors

```rust
// src/error.rs
use thiserror::Error;
use arch_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum MyError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    
    #[error("Account not initialized")]
    NotInitialized,
    
    #[error("Unauthorized")]
    Unauthorized,
    
    #[error("Arithmetic overflow")]
    Overflow,
    
    #[error("Invalid seed value")]
    InvalidSeed,
}

impl From<MyError> for ProgramError {
    fn from(e: MyError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

## Security Best Practices

### Account Validation

```rust
pub fn check_account_owner(
    account: &AccountInfo,
    expected_owner: &Pubkey,
) -> ProgramResult {
    if account.owner != expected_owner {
        msg!("Account owner mismatch");
        return Err(ProgramError::IncorrectProgramId);
    }
    Ok(())
}

pub fn check_signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature);
    }
    Ok(())
}

pub fn check_writable(account: &AccountInfo) -> ProgramResult {
    if !account.is_writable {
        msg!("Account is not writable");
        return Err(ProgramError::InvalidAccountData);
    }
    Ok(())
}
```

### Arithmetic Safety

```rust
pub fn safe_add(a: u64, b: u64) -> Result<u64, ProgramError> {
    a.checked_add(b)
        .ok_or_else(|| MyError::Overflow.into())
}

pub fn safe_sub(a: u64, b: u64) -> Result<u64, ProgramError> {
    a.checked_sub(b)
        .ok_or_else(|| MyError::Overflow.into())
}

pub fn safe_mul(a: u64, b: u64) -> Result<u64, ProgramError> {
    a.checked_mul(b)
        .ok_or_else(|| MyError::Overflow.into())
}
```

## Testing Your Program

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use arch_program::clock::Epoch;
    
    #[test]
    fn test_state_packing() {
        let state = MyState {
            is_initialized: true,
            authority: Pubkey::new_unique(),
            seed: 42,
            data: vec![1, 2, 3, 4],
        };
        
        let mut packed = vec![0; state.get_packed_len(4)];
        state.pack(&mut packed).unwrap();
        
        let unpacked = MyState::unpack(&packed).unwrap();
        assert_eq!(state.is_initialized, unpacked.is_initialized);
        assert_eq!(state.authority, unpacked.authority);
        assert_eq!(state.seed, unpacked.seed);
        assert_eq!(state.data, unpacked.data);
    }
}
```

### Integration Tests

```rust
// tests/integration.rs
use arch_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use arch_program_test::*;

#[tokio::test]
async fn test_initialize() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "my_program",
        program_id,
        processor!(process_instruction),
    );
    
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    let account = Keypair::new();
    let authority = Keypair::new();
    
    let mut transaction = Transaction::new_with_payer(
        &[
            // Create account
            system_instruction::create_account(
                &payer.pubkey(),
                &account.pubkey(),
                1_000_000,
                MyState::LEN as u64,
                &program_id,
            ),
            // Initialize
            Instruction::new_with_borsh(
                program_id,
                &MyInstruction::Initialize { seed: 42 },
                vec![
                    AccountMeta::new(account.pubkey(), false),
                    AccountMeta::new_readonly(authority.pubkey(), true),
                ],
            ),
        ],
        Some(&payer.pubkey()),
    );
    
    transaction.sign(&[&payer, &account, &authority], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();
}
```

## Building and Deploying

### Build Your Program

```bash
# Build for BPF target
cargo build-bpf

# Output will be in target/deploy/my_program.so
```

### Deploy to Network

```bash
# Deploy using Arch CLI
arch program deploy target/deploy/my_program.so

# Or using custom deployment script
arch program deploy \
    --program target/deploy/my_program.so \
    --keypair ~/.config/arch/id.json \
    --url http://localhost:9002
```

## Advanced Topics

### Upgradeable Programs

Programs can be made upgradeable by using a proxy pattern:

```rust
// Proxy program that delegates to implementation
pub fn process_proxy(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let program_data = next_account_info(account_info_iter)?;
    
    // Load implementation address from program data
    let impl_program_id = get_implementation_id(program_data)?;
    
    // Forward call to implementation
    invoke(
        &Instruction::new_with_bytes(
            impl_program_id,
            instruction_data,
            accounts[1..].iter()
                .map(|acc| AccountMeta {
                    pubkey: *acc.key,
                    is_signer: acc.is_signer,
                    is_writable: acc.is_writable,
                })
                .collect(),
        ),
        accounts,
    )
}
```

## Resources

- [Program Examples](../../program/program.md)
- [Arch Program Crate Docs](https://docs.rs/arch_program)
- [Example Programs](https://github.com/arch-network/arch-network/tree/main/examples)
- [Testing Guide](../../guides/testing-guide.md) 