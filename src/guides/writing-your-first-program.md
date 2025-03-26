# Writing Your First Arch Program

This guide will walk you through creating your first Arch program from scratch. We'll build a simple counter program that demonstrates the core concepts of Arch development while providing hands-on experience with the development workflow.

## Prerequisites

Before starting, ensure you have:
- Rust and Cargo installed
- [CLI] installed and configured (see [Quick Start Guide])
- A running validator node
- Basic understanding of [Arch concepts]

## Project Setup

1. Create a new project directory:
```bash
mkdir my-counter-program
cd my-counter-program
```

2. Initialize a new Rust project:
```bash
cargo init --lib
```

3. Add necessary dependencies to `Cargo.toml`:
```toml
[package]
name = "my-counter-program"
version = "0.1.0"
edition = "2021"

[dependencies]
arch-program = { git = "https://github.com/Arch-Network/arch-program" }
arch-sdk = { git = "https://github.com/Arch-Network/arch-sdk" }
borsh = "0.10.3"

[lib]
crate-type = ["cdylib"]
```

## Writing the Program

Let's create a simple program that:
- Stores a counter in an account
- Can increment the counter
- Can decrement the counter
- Can reset the counter

1. Define our program's state structure in `src/lib.rs`:
```rust
use arch_program::{
    account::AccountInfo,
    entrypoint,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub count: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    Increment,
    Decrement,
    Reset,
}
```

2. Implement the program logic:
```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    // Get the account to store counter data
    let account_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_iter)?;

    // Verify account is writable
    if !counter_account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    // Deserialize the instruction
    let instruction = CounterInstruction::try_from_slice(instruction_data)?;
    
    // Get current counter value
    let mut counter = match CounterAccount::try_from_slice(&counter_account.data.borrow()) {
        Ok(data) => data,
        Err(_) => CounterAccount { count: 0 },
    };

    // Process the instruction
    match instruction {
        CounterInstruction::Increment => {
            counter.count = counter.count.checked_add(1).ok_or(ProgramError::Custom(1))?;
            msg!("Counter incremented to {}", counter.count);
        }
        CounterInstruction::Decrement => {
            counter.count = counter.count.checked_sub(1).ok_or(ProgramError::Custom(2))?;
            msg!("Counter decremented to {}", counter.count);
        }
        CounterInstruction::Reset => {
            counter.count = 0;
            msg!("Counter reset to 0");
        }
    }

    // Serialize and save the counter
    counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
    
    Ok(())
}
```

## Building the Program

1. Build your program:
```bash
cargo build-sbf
```

This will create a compiled program at `target/deploy/my_counter_program.so`

## Deploying the Program

1. Deploy your program using the CLI:
```bash
cli deploy target/deploy/my_counter_program.so
```

Save the Program ID output - you'll need it to interact with your program.

2. Verify the deployment:
```bash
cli show <PROGRAM_ID>
```

## Interacting with Your Program

To interact with your program, you'll need to create a client that:
1. Creates an account for storing the counter state
2. Sends instructions to increment/decrement/reset the counter
3. Reads the counter value

Here's a basic example using the Arch SDK:

```rust
use arch_sdk::{
    arch_program::{pubkey::Pubkey, system_instruction},
    build_and_sign_transaction, ArchRpcClient,
};

// Create a client
let client = ArchRpcClient::new("http://localhost:9002");

// Create an account (you'll need to implement this using system_instruction)
let create_account_ix = system_instruction::create_account(
    &payer.pubkey(),
    &counter_account.pubkey(),
    rent_lamports,
    size,
    &program_id,
);

// Build and send transaction
let tx = build_and_sign_transaction(vec![create_account_ix], &[&payer, &counter_account])?;
let signature = client.send_transaction(&tx)?;

// Wait for confirmation
client.confirm_transaction(&signature)?;

// Now you can send instructions to your program
// Implementation left as an exercise
```

For a complete example of program interaction, check out our [example repository](https://github.com/Arch-Network/arch-examples).

## Monitoring Your Program

You can monitor your program's execution using the CLI:

1. View transaction logs:
```bash
cli log-program-messages <TX_ID>
```

2. Check transaction status:
```bash
cli confirm <TX_ID>
```

## Next Steps

Now that you've created your first program, you can:
- Add more features to the counter program
- Learn about [cross-program invocation]
- Explore more complex [Program Examples]
- Study the [Understanding Arch Programs] guide for deeper insights

<!-- Internal -->
[CLI]: ../getting-started/quick-start.md
[Quick Start Guide]: ../getting-started/quick-start.md
[Arch concepts]: ../concepts/architecture.md
[cross-program invocation]: ../program/program.md
[Program Examples]: ./guides.md
[Understanding Arch Programs]: ./understanding-arch-programs.md
