# Comprehensive Testing Guide for Arch Network Programs

This guide provides complete coverage of testing strategies, tools, and best practices for building robust and reliable Arch Network programs. Proper testing is essential for ensuring your programs work correctly and securely before deployment.

## Overview

Testing Arch programs involves multiple layers:
- **Unit Tests**: Individual function and logic testing
- **Integration Tests**: Cross-component functionality testing
- **End-to-End Tests**: Full program workflow testing
- **Security Tests**: Vulnerability and attack vector testing
- **Performance Tests**: Load and efficiency testing

## Project Setup for Testing

### Test Directory Structure

```text
my-program/
├── program/
│   ├── src/
│   │   └── lib.rs
│   └── Cargo.toml
├── tests/
│   ├── integration.rs
│   ├── security.rs
│   └── common/
│       └── mod.rs
└── Cargo.toml (workspace)
```

### Test Dependencies Configuration

**Cargo.toml (workspace root)**
```toml
[workspace]
members = ["program", "tests"]

[workspace.dependencies]
arch_program = "0.5.4"
arch_sdk = "0.5.4"
borsh = { version = "1.5.1", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }
```

**tests/Cargo.toml**
```toml
[package]
name = "program-tests"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_program = { workspace = true }
arch_sdk = { workspace = true }
borsh = { workspace = true }
tokio = { workspace = true }

# Test utilities
proptest = "1.0"
rstest = "0.18"
serial_test = "3.0"

# Your program dependency
my_program = { path = "../program" }

[[bin]]
name = "test-runner"
path = "src/main.rs"
```

## Unit Testing

### Basic Unit Tests

Unit tests go directly in your program's `src/lib.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use arch_program::{
        account::AccountInfo,
        program_error::ProgramError,
        pubkey::Pubkey,
    };

    #[test]
    fn test_counter_account_serialization() {
        let counter = CounterAccount::new(Pubkey::new_unique(), 100);
        
        // Test serialization
        let serialized = borsh::to_vec(&counter).unwrap();
        let deserialized: CounterAccount = borsh::from_slice(&serialized).unwrap();
        
        assert_eq!(counter, deserialized);
    }

    #[test]
    fn test_instruction_parsing() {
        let instruction = CounterInstruction::Increment { amount: 5 };
        let params = CounterParams {
            instruction,
            tx_hex: vec![0x01, 0x02, 0x03],
        };
        
        let serialized = borsh::to_vec(&params).unwrap();
        let parsed: CounterParams = borsh::from_slice(&serialized).unwrap();
        
        match parsed.instruction {
            CounterInstruction::Increment { amount } => assert_eq!(amount, 5),
            _ => panic!("Wrong instruction type"),
        }
    }

    #[test]
    fn test_error_codes() {
        let error: ProgramError = CounterError::CounterFrozen.into();
        assert_eq!(error, ProgramError::Custom(1001));
    }

    #[test]
    fn test_overflow_protection() {
        let mut counter = CounterAccount::new(Pubkey::new_unique(), 100);
        counter.count = i64::MAX;
        
        // This should detect overflow
        let result = counter.count.checked_add(1);
        assert!(result.is_none());
    }
}
```

### Advanced Unit Testing

```rust
#[cfg(test)]
mod advanced_tests {
    use super::*;
    use proptest::prelude::*;

    // Property-based testing
    proptest! {
        #[test]
        fn test_counter_operations_never_panic(
            initial_value in i32::MIN..i32::MAX,
            operation_value in 1u32..1000u32
        ) {
            let mut counter = CounterAccount::new(Pubkey::new_unique(), 100);
            counter.count = initial_value as i64;

            // These operations should never panic
            let _ = counter.count.checked_add(operation_value as i64);
            let _ = counter.count.checked_sub(operation_value as i64);
        }
    }

    // Parameterized tests
    use rstest::rstest;

    #[rstest]
    #[case(CounterInstruction::Increment { amount: 1 })]
    #[case(CounterInstruction::Decrement { amount: 1 })]
    #[case(CounterInstruction::Reset)]
    #[case(CounterInstruction::Freeze)]
    #[case(CounterInstruction::Unfreeze)]
    fn test_instruction_serialization(#[case] instruction: CounterInstruction) {
        let params = CounterParams {
            instruction: instruction.clone(),
            tx_hex: vec![],
        };
        
        let serialized = borsh::to_vec(&params).unwrap();
        let deserialized: CounterParams = borsh::from_slice(&serialized).unwrap();
        
        assert_eq!(params.instruction, deserialized.instruction);
    }
}
```

## Integration Testing

### Test Environment Setup

**tests/common/mod.rs**
```rust
use arch_sdk::{
    client::ArchClient,
    instruction::Instruction,
    pubkey::Pubkey,
    signer::Keypair,
    transaction::Transaction,
};
use std::sync::Once;

static INIT: Once = Once::new();

pub struct TestEnvironment {
    pub client: ArchClient,
    pub payer: Keypair,
    pub program_id: Pubkey,
}

impl TestEnvironment {
    pub async fn new() -> Self {
        INIT.call_once(|| {
            env_logger::init();
        });

        let client = ArchClient::new("http://localhost:9001").unwrap();
        let payer = Keypair::new();
        
        // Fund the payer
        let airdrop_signature = client
            .request_airdrop(&payer.pubkey(), 10_000_000)
            .await
            .unwrap();
        
        client.confirm_transaction(&airdrop_signature).await.unwrap();

        // Deploy program
        let program_id = deploy_test_program(&client, &payer).await;

        TestEnvironment {
            client,
            payer,
            program_id,
        }
    }

    pub async fn create_funded_account(&self) -> Keypair {
        let account = Keypair::new();
        let signature = self.client
            .request_airdrop(&account.pubkey(), 1_000_000)
            .await
            .unwrap();
        
        self.client.confirm_transaction(&signature).await.unwrap();
        account
    }
}

async fn deploy_test_program(client: &ArchClient, payer: &Keypair) -> Pubkey {
    let program_data = include_bytes!("../../program/target/deploy/my_counter_program.so");
    
    let program_id = client
        .deploy_program(payer, program_data)
        .await
        .unwrap();
    
    program_id
}

// Helper functions for test data
pub fn create_counter_initialize_instruction(
    program_id: &Pubkey,
    counter_account: &Pubkey,
    authority: &Pubkey,
) -> Instruction {
    use my_program::{CounterInstruction, CounterParams};
    
    let params = CounterParams {
        instruction: CounterInstruction::Initialize,
        tx_hex: create_test_fee_transaction(),
    };
    
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*counter_account, true),
            AccountMeta::new_readonly(*authority, true),
        ],
        data: borsh::to_vec(&params).unwrap(),
    }
}

pub fn create_test_fee_transaction() -> Vec<u8> {
    // Return a minimal valid Bitcoin transaction for testing
    vec![
        0x02, 0x00, 0x00, 0x00, // version
        0x01, // input count
        // ... simplified test transaction data
    ]
}
```

### Complete Integration Tests

**tests/integration.rs**
```rust
use arch_sdk::prelude::*;
use my_program::*;
use serial_test::serial;

mod common;
use common::*;

#[tokio::test]
#[serial]
async fn test_complete_counter_workflow() {
    let env = TestEnvironment::new().await;
    
    // Create counter account
    let counter_keypair = Keypair::new();
    let user = env.create_funded_account().await;
    
    // Test 1: Initialize counter
    let init_ix = create_counter_initialize_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &counter_keypair, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_ok(), "Initialize should succeed");
    
    // Verify initial state
    let account_data = env.client
        .get_account(&counter_keypair.pubkey())
        .await
        .unwrap()
        .unwrap();
    
    let counter_state: CounterAccount = borsh::from_slice(&account_data.data).unwrap();
    assert_eq!(counter_state.count, 0);
    assert_eq!(counter_state.authority, user.pubkey());
    assert!(!counter_state.is_frozen);
    
    // Test 2: Increment counter
    let increment_ix = create_counter_increment_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
        10,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[increment_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_ok(), "Increment should succeed");
    
    // Verify incremented state
    let account_data = env.client
        .get_account(&counter_keypair.pubkey())
        .await
        .unwrap()
        .unwrap();
    
    let counter_state: CounterAccount = borsh::from_slice(&account_data.data).unwrap();
    assert_eq!(counter_state.count, 10);
    assert_eq!(counter_state.operation_count, 1);
    
    // Test 3: Freeze counter
    let freeze_ix = create_counter_freeze_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[freeze_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_ok(), "Freeze should succeed");
    
    // Test 4: Try to increment frozen counter (should fail)
    let increment_ix = create_counter_increment_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
        5,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[increment_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_err(), "Increment should fail when frozen");
    
    // Test 5: Unfreeze and increment
    let unfreeze_ix = create_counter_unfreeze_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
    );
    
    let increment_ix = create_counter_increment_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
        5,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[unfreeze_ix, increment_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_ok(), "Unfreeze and increment should succeed");
    
    // Final verification
    let account_data = env.client
        .get_account(&counter_keypair.pubkey())
        .await
        .unwrap()
        .unwrap();
    
    let counter_state: CounterAccount = borsh::from_slice(&account_data.data).unwrap();
    assert_eq!(counter_state.count, 15);
    assert!(!counter_state.is_frozen);
}
```

## Security Testing

**tests/security.rs**
```rust
use arch_sdk::prelude::*;
use my_program::*;
use serial_test::serial;

mod common;
use common::*;

#[tokio::test]
#[serial]
async fn test_unauthorized_access() {
    let env = TestEnvironment::new().await;
    
    // Create counter with user1 as authority
    let counter_keypair = Keypair::new();
    let user1 = env.create_funded_account().await;
    let user2 = env.create_funded_account().await;
    
    // Initialize counter with user1 as authority
    let init_ix = create_counter_initialize_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user1.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &counter_keypair, &user1],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    env.client.send_and_confirm_transaction(&tx).await.unwrap();
    
    // Try to reset counter with user2 (should fail)
    let reset_ix = create_counter_reset_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user2.pubkey(), // Wrong authority
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[reset_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user2],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_err(), "Reset should fail with wrong authority");
}

#[tokio::test]
#[serial]
async fn test_overflow_protection() {
    let env = TestEnvironment::new().await;
    
    let counter_keypair = Keypair::new();
    let user = env.create_funded_account().await;
    
    // Initialize counter
    let init_ix = create_counter_initialize_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &counter_keypair, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    env.client.send_and_confirm_transaction(&tx).await.unwrap();
    
    // Try to increment by maximum value (should fail due to overflow protection)
    let increment_ix = create_counter_increment_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
        u32::MAX, // This should cause overflow
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[increment_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    let result = env.client.send_and_confirm_transaction(&tx).await;
    assert!(result.is_err(), "Large increment should fail due to overflow protection");
}
```

## Performance Testing

**tests/performance.rs**
```rust
use arch_sdk::prelude::*;
use my_program::*;
use std::time::Instant;
use tokio::time::{sleep, Duration};

mod common;
use common::*;

#[tokio::test]
async fn test_transaction_throughput() {
    let env = TestEnvironment::new().await;
    
    let counter_keypair = Keypair::new();
    let user = env.create_funded_account().await;
    
    // Initialize counter
    let init_ix = create_counter_initialize_instruction(
        &env.program_id,
        &counter_keypair.pubkey(),
        &user.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&env.payer.pubkey()),
        &[&env.payer, &counter_keypair, &user],
        env.client.get_latest_blockhash().await.unwrap(),
    );
    
    env.client.send_and_confirm_transaction(&tx).await.unwrap();
    
    // Benchmark multiple increments
    let start_time = Instant::now();
    let num_operations = 100;
    
    for i in 0..num_operations {
        let increment_ix = create_counter_increment_instruction(
            &env.program_id,
            &counter_keypair.pubkey(),
            &user.pubkey(),
            1,
        );
        
        let tx = Transaction::new_signed_with_payer(
            &[increment_ix],
            Some(&env.payer.pubkey()),
            &[&env.payer, &user],
            env.client.get_latest_blockhash().await.unwrap(),
        );
        
        env.client.send_and_confirm_transaction(&tx).await.unwrap();
        
        if i % 10 == 0 {
            println!("Completed {} operations", i + 1);
        }
        
        // Small delay to avoid overwhelming the network
        sleep(Duration::from_millis(10)).await;
    }
    
    let elapsed = start_time.elapsed();
    let ops_per_second = num_operations as f64 / elapsed.as_secs_f64();
    
    println!("Completed {} operations in {:?}", num_operations, elapsed);
    println!("Throughput: {:.2} operations/second", ops_per_second);
    
    // Verify final state
    let account_data = env.client
        .get_account(&counter_keypair.pubkey())
        .await
        .unwrap()
        .unwrap();
    
    let counter_state: CounterAccount = borsh::from_slice(&account_data.data).unwrap();
    assert_eq!(counter_state.count, num_operations);
    assert_eq!(counter_state.operation_count, num_operations as u64);
}
```

## Test Execution

### Running Tests

```bash
# Run all tests
cargo test

# Run specific test categories
cargo test --test integration
cargo test --test security
cargo test --test performance

# Run with logs
RUST_LOG=debug cargo test

# Run tests in sequence (for tests that modify shared state)
cargo test -- --test-threads=1
```

### Continuous Integration

**.github/workflows/test.yml**
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      bitcoind:
        image: ruimarinho/bitcoin-core:22
        options: >-
          --health-cmd "bitcoin-cli -regtest getblockchaininfo"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 18443:18443
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        
    - name: Install Solana CLI
      run: |
        sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
        echo "$HOME/.local/share/solana/install/active_release/bin" >> $GITHUB_PATH
        
    - name: Start local validator
      run: |
        solana-test-validator --detach
        
    - name: Build program
      run: |
        cargo build-sbf
        
    - name: Run tests
      run: |
        cargo test
        
    - name: Run integration tests
      run: |
        cargo test --test integration
```

## Best Practices

### 1. Test Organization
- Separate unit, integration, and security tests
- Use common test utilities to reduce duplication
- Group related tests into modules

### 2. Test Data Management
- Use deterministic test data when possible
- Clean up test accounts and state
- Use property-based testing for edge cases

### 3. Error Testing
- Test all error conditions explicitly
- Verify correct error codes are returned
- Test permission and access control

### 4. Performance Considerations
- Monitor transaction costs in tests
- Test with realistic data sizes
- Benchmark critical operations

### 5. Security Focus
- Test privilege escalation attempts
- Verify input validation
- Test resource exhaustion scenarios

## Debugging Tests

### Logging and Diagnostics

```rust
#[cfg(test)]
mod debug_tests {
    use super::*;
    use arch_program::msg;
    
    #[test]
    fn test_with_logging() {
        env_logger::init();
        
        // Your test code with msg! calls will now show logs
        msg!("Debug: Testing counter initialization");
        
        // ... test code ...
    }
}
```

### Test Helpers for Debugging

```rust
pub fn debug_account_state(client: &ArchClient, account: &Pubkey) -> CounterAccount {
    let account_data = client.get_account(account).unwrap().unwrap();
    let state: CounterAccount = borsh::from_slice(&account_data.data).unwrap();
    
    println!("Account: {}", account);
    println!("Count: {}", state.count);
    println!("Authority: {}", state.authority);
    println!("Frozen: {}", state.is_frozen);
    println!("Operations: {}", state.operation_count);
    
    state
}
```

## Summary

Comprehensive testing is crucial for Arch Network program development. This guide provides:

- **Complete test setup** with proper dependencies and project structure
- **Multi-layer testing strategy** covering unit, integration, security, and performance
- **Real working examples** that you can adapt for your programs
- **Best practices** for maintainable and effective test suites
- **CI/CD integration** for automated testing

Remember to test early, test often, and test thoroughly. Your users depend on your programs being secure and reliable!
