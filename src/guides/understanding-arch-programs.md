# Understanding Arch Programs

This guide analyzes a simple Hello World program to introduce the core concepts of Arch program development. We'll break down each component of the program to understand how Arch programs work.

## Program Overview

The Hello World program is a simple smart contract that stores a greeting message for a given name. While simple, it demonstrates the key concepts of Arch program development including:

- Program structure and entrypoints
- Account management
- State updates
- Bitcoin transaction handling
- Fee management

Let's break down each part of the program.

## 1. Program Dependencies

```rust,ignore
use arch_program::{
    account::AccountInfo,
    bitcoin::{self, absolute::LockTime, transaction::Version, Transaction},
    entrypoint,
    helper::add_state_transition,
    input_to_sign::InputToSign,
    msg,
    program::{
        get_account_script_pubkey, get_bitcoin_block_height, next_account_info,
        set_transaction_to_sign,
    },
    program_error::ProgramError,
    pubkey::Pubkey,
    transaction_to_sign::TransactionToSign,
};
use borsh::{BorshDeserialize, BorshSerialize};
```

The program starts by importing necessary dependencies:

- `AccountInfo`: Provides access to account data and metadata
- `bitcoin`: Core Bitcoin types and functionality for transaction handling
- `entrypoint`: Macro for registering the program's entry point
- `msg`: Logging functionality for debugging
- `borsh`: Serialization/deserialization for program data

## 2. Program Entry Point

```rust,ignore
entrypoint!(process_instruction);
```

Every Arch program needs a single entry point that the runtime will call. The `entrypoint!` macro registers our `process_instruction` function as this entry point. This tells the Arch runtime which function to call when our program is invoked.

## 3. Program Parameters

```rust,ignore
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError>
```

The entry point function takes three key parameters:
- `program_id`: The public key of our program (unused in this example)
- `accounts`: Array of accounts the instruction will operate on
- `instruction_data`: Serialized instruction parameters

These parameters provide everything our program needs to execute: the context (program_id), the accounts it can read/write, and the instruction-specific data.

## 4. Program State

```rust,ignore
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct HelloWorldParams {
    /// The name to say hello to
    pub name: String,
    /// Raw Bitcoin transaction for fees
    pub tx_hex: Vec<u8>,
}
```

This structure defines the data format our program expects. It includes:
- `name`: The name to include in the greeting
- `tx_hex`: A serialized Bitcoin transaction for paying fees

The `BorshSerialize` and `BorshDeserialize` traits allow us to convert this structure to and from bytes for storage and transmission.

## 5. Program Logic

Let's break down the main program logic into steps:

### Account Validation

```rust,ignore
if accounts.len() != 1 {
    return Err(ProgramError::Custom(501));
}

let account_iter = &mut accounts.iter();
let account = next_account_info(account_iter)?;

assert!(account.is_writable);
assert!(account.is_signer);
```

The program first performs several important validations:
- Checks that exactly one account is provided
- Ensures the account is writable (can be modified)
- Verifies the account is a signer (authorized to make changes)

These checks are crucial for security and proper program execution.

### State Management

```rust,ignore
let params: HelloWorldParams = borsh::from_slice(instruction_data).unwrap();
let new_data = format!("Hello {}", params.name);

let data_len = account.data.try_borrow().unwrap().len();
if new_data.as_bytes().len() > data_len {
    account.realloc(new_data.len(), true)?;
}

account.data.try_borrow_mut().unwrap().copy_from_slice(new_data.as_bytes());
```

The state management section:
1. Deserializes the instruction parameters into our `HelloWorldParams` structure
2. Creates the greeting message
3. Checks if the account has enough space for our data
4. Reallocates space if needed
5. Stores the greeting in the account's data

### Bitcoin Transaction Handling

```rust,ignore
let fees_tx: Transaction = bitcoin::consensus::deserialize(&params.tx_hex).unwrap();

let mut tx = Transaction {
    version: Version::TWO,
    lock_time: LockTime::ZERO,
    input: vec![],
    output: vec![],
};

add_state_transition(&mut tx, account);
tx.input.push(fees_tx.input[0].clone());
```

This section handles the Bitcoin transaction aspects:
1. Deserializes the fee transaction provided by the user
2. Creates a new Bitcoin transaction for our state update
3. Adds the state transition to the transaction
4. Includes the fee input to pay for the transaction

### Transaction Signing

```rust,ignore
let tx_to_sign = TransactionToSign {
    tx_bytes: &bitcoin::consensus::serialize(&tx),
    inputs_to_sign: &[InputToSign {
        index: 0,
        signer: account.key.clone(),
    }],
};

set_transaction_to_sign(accounts, tx_to_sign)
```

Finally, the program prepares the transaction for signing:
1. Serializes the Bitcoin transaction
2. Creates a signing request specifying which inputs need to be signed
3. Submits the transaction to be signed by the Arch runtime

## Next Steps

Now that you understand the basic structure of an Arch program, you can:
- Learn about more complex account management in the [Program] documentation
- Explore cross-program invocation for program composition
- Study the Bitcoin transaction lifecycle in our [docs]
- Build more complex programs using these fundamentals

For practical examples, check out our other guides:
- [How to create a fungible token](./how-to-create-a-fungible-token.md)
- [How to build a Runes swap](./how-to-build-runes-swap.md)

<!-- Internal -->
[Program]: ../program/program.md

<!-- External -->
[docs]: https://docs.arch.network
[arch-cli]: https://github.com/Arch-Network/arch-cli
[helloworld]: https://github.com/Arch-Network/arch-examples/blob/main/examples/helloworld/program/src/lib.rs
