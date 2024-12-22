# System Functions

> **Navigation**: [Reference](../SUMMARY.md#reference) → [Program](./program.md) → System Functions

Core system functions that enable program interactions, account management, and state transitions in Arch Network.

## Overview

These functions form the foundation for program-to-program communication, account management, and state transitions in Arch Network:

1. `invoke` - Cross-program invocation
2. `new_create_account_instruction` - Account creation
3. `add_state_transition` - State management
4. `set_transaction_to_sign` - Transaction preparation

## Detailed Function Documentation

### 1. `invoke`
```rust,ignore
pub fn invoke(instruction: &Instruction, account_infos: &[AccountInfo]) -> ProgramResult
```

The `invoke` function enables cross-program communication and execution:

- **Purpose**: Allows one program to call another program securely
- **Key Features**:
  - Validates account permissions
  - Manages account borrowing
  - Handles cross-program context
  - Provides error handling

**Example Usage**:
```rust,ignore
// Invoke system program to create account
invoke(
    &SystemInstruction::new_create_account_instruction(
        txid.try_into().unwrap(),
        vout,
        account_pubkey
    ),
    &[account_info.clone()]
)?;
```

### 2. `new_create_account_instruction`
```rust,ignore
pub fn new_create_account_instruction(
    txid: [u8; 32],
    vout: u32,
    pubkey: Pubkey,
) -> Instruction
```

Creates instructions for new account initialization:

- **Purpose**: Creates new accounts with UTXO backing
- **Key Features**:
  - Sets up UTXO metadata
  - Configures permissions
  - Associates with system program
  - Prepares initialization

**Example Usage**:
```rust,ignore
let instruction = SystemInstruction::new_create_account_instruction(
    txid.try_into().unwrap(),
    0,  // vout index
    account_pubkey,
);
```

### 3. `add_state_transition`
```rust,ignore
pub fn add_state_transition(transaction: &mut Transaction, account: &AccountInfo)
```

Manages state transitions for accounts:

- **Purpose**: Updates Bitcoin transactions with account changes
- **Key Features**:
  - Adds UTXO inputs
  - Sets up script signatures
  - Configures outputs
  - Manages state

**Example Usage**:
```rust,ignore
let mut tx = Transaction {
    version: Version::TWO,
    lock_time: LockTime::ZERO,
    input: vec![],
    output: vec![],
};
add_state_transition(&mut tx, account);
```

### 4. `set_transaction_to_sign`
```rust,ignore
pub fn set_transaction_to_sign(
    accounts: &[AccountInfo],
    transaction_to_sign: TransactionToSign,
) -> ProgramResult
```

Prepares transactions for signing:

- **Purpose**: Sets up transaction metadata and permissions
- **Key Features**:
  - Validates size limits
  - Checks signer permissions
  - Sets up metadata
  - Manages requirements

**Example Usage**:
```rust,ignore
let transaction_to_sign = TransactionToSign {
    tx_bytes: serialized_tx,
    inputs_to_sign: vec![
        InputToSign {
            signer: account.key,
            ..Default::default()
        }
    ],
};
set_transaction_to_sign(accounts, transaction_to_sign)?;
```

```mermaid
graph LR
    A[Program Request] ==> B[new_create_account_instruction]
    B ==> C[invoke]
    C ==> D[add_state_transition]
    D ==> E[set_transaction_to_sign]
    E ==> F[Bitcoin Transaction]

    style A fill:#4a9eff,stroke:#3182ce,stroke-width:2px,color:#fff
    style B fill:#ffffff,stroke:#ccd7e0,stroke-width:2px
    style C fill:#ffffff,stroke:#ccd7e0,stroke-width:2px
    style D fill:#ffffff,stroke:#ccd7e0,stroke-width:2px
    style E fill:#ffffff,stroke:#ccd7e0,stroke-width:2px
    style F fill:#f687b3,stroke:#d53f8c,stroke-width:2px,color:#fff
```

## Best Practices

1. **Validation**
   - Always check account permissions
   - Verify transaction limits
   - Validate UTXO states
   - Handle errors properly

2. **State Management**
   - Use atomic operations
   - Maintain state consistency
   - Handle failures gracefully
   - Implement rollbacks

3. **Security**
   - Validate all signatures
   - Check account ownership
   - Verify transaction data
   - Handle edge cases

## Related Topics
- [Accounts](./accounts.md)
- [UTXOs](./utxo.md)
- [Programs](./program.md)
- [Instructions](./instructions-and-messages.md) 