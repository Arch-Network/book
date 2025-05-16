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
```rust,ignore
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
```rust,ignore
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

## Creating a Counter Account

Before we can use our counter, we need to create an account to store its state:

```bash
cli create-account <PROGRAM_ID> 8
```

Save the account address - you'll need it to interact with your counter.

## Testing Your Program

You can now interact with your program using the CLI:

1. Increment the counter:
```bash
cli invoke <PROGRAM_ID> <ACCOUNT_ADDRESS> --data 00
```

2. Decrement the counter:
```bash
cli invoke <PROGRAM_ID> <ACCOUNT_ADDRESS> --data 01
```

3. Reset the counter:
```bash
cli invoke <PROGRAM_ID> <ACCOUNT_ADDRESS> --data 02
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

```bash
# Start the Arch Network validator
cli validator-start
```
