# Testing Your Arch Network Program

This guide covers best practices and approaches for testing your Arch Network programs, ensuring they are reliable and secure before deployment.

## Types of Tests

### Unit Tests

Unit tests verify individual components of your program in isolation. In Rust, you can write unit tests within your program's source files:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initialize() {
        // Test initialization logic
    }
}
```

### Integration Tests

Integration tests verify that different parts of your program work together correctly. Create these in the `tests` directory:

```rust,ignore
use your_program::*;
use arch_sdk::test_utils::*;

#[test]
fn test_full_workflow() {
    let (mut banks_client, payer, recent_blockhash) = setup_test_context();
    // Test your program's workflow
}
```

## Test Environment Setup

### Local Test Validator

```bash
# Start a local test validator
cli validator-start --test

# Deploy your program
cli deploy ./target/deploy/your_program.so
```

### Test Utilities

The Arch SDK provides test utilities to simulate the blockchain environment:

```rust,ignore
use arch_sdk::{
    account::Account,
    pubkey::Pubkey,
    test_utils::{setup_test_context, TestContext},
};
```

## Testing Best Practices

1. **State Validation**
   - Test initial state
   - Verify state transitions
   - Check final state

2. **Error Handling**
   - Test invalid inputs
   - Verify error messages
   - Check permission controls

3. **Edge Cases**
   - Test boundary conditions
   - Verify numeric overflow handling
   - Check resource limits

## Example Test Suite

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use arch_sdk::test_utils::*;

    #[test]
    fn test_create_account() {
        let (mut context, payer, _) = setup_test_context();

        // Create test account
        let account = Account::new();
        let create_ix = create_account(
            &payer.pubkey(),
            &account.pubkey(),
            minimum_balance(),
        );

        // Execute instruction
        let result = process_instruction(&mut context, create_ix);

        // Verify result
        assert!(result.is_ok());
        let account_data = context.get_account(&account.pubkey()).unwrap();
        assert_eq!(account_data.lamports, minimum_balance());
    }

    #[test]
    fn test_invalid_instruction() {
        let (mut context, _, _) = setup_test_context();

        // Test with invalid data
        let invalid_ix = Instruction::new_with_bytes(
            program_id(),
            &[0xFF],
            vec![],
        );

        // Verify error handling
        let result = process_instruction(&mut context, invalid_ix);
        assert_eq!(
            result.unwrap_err(),
            ProgramError::InvalidInstructionData
        );
    }
}
```

## Common Testing Patterns

### 1. Program Test Framework

```rust,ignore
struct ProgramTest {
    context: TestContext,
    admin: Keypair,
    users: Vec<Keypair>,
}

impl ProgramTest {
    fn new() -> Self {
        let (context, admin, _) = setup_test_context();
        ProgramTest {
            context,
            admin,
            users: vec![],
        }
    }

    fn add_user(&mut self) -> Keypair {
        let user = Keypair::new();
        self.users.push(user.clone());
        user
    }
}
```

### 2. Test Data Helpers

```rust,ignore
fn create_test_state() -> State {
    State {
        is_initialized: true,
        owner: Pubkey::new_unique(),
        balance: 1000,
    }
}
```

## Debugging Tests

1. Use the `arch_sdk::msg!` macro for logging:
   ```rust,ignore
   msg!("Processing instruction: {:?}", instruction);
   ```

2. Enable debug output:
   ```bash
   RUST_LOG=debug cargo test-sbf
   ```

## Security Testing

1. **Privilege Escalation Tests**
   - Verify admin-only functions
   - Test unauthorized access

2. **Resource Exhaustion Tests**
   - Test memory limits
   - Verify computation limits

3. **Input Validation Tests**
   - Test buffer overflows
   - Verify numeric boundaries

Remember to run your test suite frequently during development and before deploying any updates to your program.
