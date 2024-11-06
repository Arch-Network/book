# How to write an oracle program

This guide walks through the innerworkings of an oracle program as well as details how oracle data can be utilized by other programs on Arch Network.

Table of Contents:
- [Description]
- [Flow]
- [Example Program]
- [Logic]
- [Implementation]
---

### Description
Two important aspects of understanding how this oracle example is implemented within Arch:
1. The oracle is a program that updates an account which holds the data
2. No cross-program invocation occurs since only the account is updated and read from versus this being another program that gets interacted with from another program

### Flow
- Project deploys oracle program
- Project creates state account that the oracle program will control in order to write state to it
- Projects submit data to the oracle state account by submitting instructions to the oracle program
- Programs include oracle state account alongside their program instructions in order to use this referenced data stored in the oracle state account within their program
- Projects submit instructions to oracle program periodically to update oracle state account with fresh data

### Example Program
An example oracle program is found below:
```rust,ignore
use arch_program::{
    account::AccountInfo,
    entrypoint,
    helper::get_state_transition_tx,
    input_to_sign::InputToSign,
    instruction::Instruction,
    msg,
    program::{
        get_account_script_pubkey, get_bitcoin_tx, get_network_xonly_pubkey, invoke,
        next_account_info, set_return_data, set_transaction_to_sign, validate_utxo_ownership,
    },
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction::SystemInstruction,
    transaction_to_sign::TransactionToSign,
    utxo::UtxoMeta,
};
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(update_data);
pub fn update_data(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let oracle_account = next_account_info(account_iter)?;

    assert!(oracle_account.is_signer);
    assert_eq!(instruction_data.len(), 8);

    let data_len = oracle_account.data.try_borrow().unwrap().len();
    if instruction_data.len() > data_len {
        oracle_account.realloc(instruction_data.len(), true)?;
    }

    oracle_account
        .data
        .try_borrow_mut()
        .unwrap()
        .copy_from_slice(instruction_data);

    msg!("updated");

    Ok(())
}
```

And here is the example `Cargo.toml` that can be used alongside this program.

```toml
[workspace]
[package]
name = "oracleprogram"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
arch_program = { path = "../../program" }
borsh = { version = "1.5.1", features = ["derive"] }

[lib]
crate-type = ["cdylib", "lib"] 
```

### Logic
If you haven't already read [How to write an Arch program], we recommend starting there to get a basic understanding of the program anatomy before going further.

We'll look closely at the logic block contained within the `update_data` [handler].

```rust,ignore
pub fn update_data(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let oracle_account = next_account_info(account_iter)?;

    assert!(oracle_account.is_signer);
    assert_eq!(instruction_data.len(), 8);

    ...
}
```

First, we'll iterate over the accounts that get passed into the function, which includes the newly created state account that will be responsible for managing the oracle's data.

We then assert that the oracle state account has the appropriate authority to be written to and update what it stores within its data field. Additionally, we assert that the data we wish to update the account with is at least a certain number of bytes.

```rust,ignore
let data_len = oracle_account.data.try_borrow().unwrap().len();
if instruction_data.len() > data_len {
    oracle_account.realloc(instruction_data.len(), true)?;
}
```

Next, we calculate the length of the new data that we are looking to store in the account and reallocate memory to the account if the new data is larger than the data currently existing within the account. This step is important for ensuring that there is no remaining, stale data stored in the account before adding new data to it.

```rust,ignore
oracle_account
    .data
    .try_borrow_mut()
    .unwrap()
    .copy_from_slice(instruction_data);

msg!("updated");

Ok(())
```

Lastly, we store the new data that is passed into the program via the instruction to the state account for management, thus marking the end of the oracle update process.

### Implementation
Let's look at an example implementation of this oracle program. This includes: 
- [Create oracle project]
- [Deploy program]
- [Update the state account]
- [Read from the state account]

#### Create oracle project
First, we'll need to create a new project using the [arch-cli] to hold our oracle logic.

```bash
arch-cli project create --name oracle
```

Example output:
```bash
jr@waymobetta arch-cli % arch-cli project create --name oracle
Welcome to the Arch Network CLI
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
Creating a new project...
  ✓ Updated configuration with project directory
  ✓ Created project directory at "/Users/jr/Documents/ArchNetwork/oracle"
Creating Vite application...
  ✓ Created Vite application
  ✓ Installed base dependencies
  ✓ Installed additional packages
New project created successfully! 🎉
  ℹ Project location: "/Users/jr/Documents/ArchNetwork/oracle"

Next steps:
  1. Navigate to /Users/jr/Documents/ArchNetwork/oracle/app/program to find the Rust program template
  2. Edit the source code to implement your program logic
  3. When ready, run arch-cli deploy to compile and deploy your program to the network

Need help? Check out our documentation at https://arch-network.github.io/docs/
```

We can then proceed to replace the logic in `oracle/app/program/lib.rs` with our example oracle code from above as well as update the dependencies.

#### Deploy program

After the project is created, the program is written and `Cargo.toml` is set with the proper dependencies, we can use the [arch-cli] to deploy the program.

```bash
arch-cli deploy 
```

During the deployment step, the [arch-cli] will create an accompanying account for the deployed program; this account is used to hold the state of the program, in our case, the data passed in by the oracle.

That oracle state account can then be read from by any program in order to retrieve the associated oracle data.

#### Update the state account

In order to update the data stored in the account, we simply need to make a transaction, post the data that we wish to update the oracle state account with, and submit this within the context of an instruction.

As an example, we'll fetch Bitcoin fees from the mempool.space API and store this fee data in our state account.

> Note: The below is a rust program and is not an Arch program. This call to update the oracle state account can be written in any programming language as it is simply an RPC call. For sake of continuity, we're using rust along with methods from the `common` crate.

```rust,ignore
let mut old_feerate = 0;

let body: Value = reqwest::blocking::get("https://mempool.space/api/v1/fees/recommended").unwrap().json().unwrap();
let feerate = body.get("fastestFee").unwrap().as_u64().unwrap();

if old_feerate != feerate {
    let (txid, instruction_hash) = sign_and_send_instruction(
        Instruction {
            program_id: program_pubkey.clone(),
            accounts: vec![AccountMeta {
                pubkey: caller_pubkey.clone(),
                is_signer: true,
                is_writable: true
            }],
            data: feerate.to_le_bytes().to_vec()
        },
        vec![caller_keypair],
    ).expect("signing and sending a transaction should not fail");

    let processed_tx = get_processed_transaction(NODE1_ADDRESS, txid.clone()).expect("get processed transaction should not fail");
    println!("processed_tx {:?}", processed_tx);

    println!("{:?}", read_account_info(NODE1_ADDRESS, caller_pubkey.clone()));

    old_feerate = feerate;
}
```

#### Read from the state account

Below is an example of a different program (we'll call this app-program) that would like to access the oracle data.

Essentially, what happens here is that when we pass an instruction into our app-program, we must also include the oracle state account alongside any other account that we need for the app-program. In this way, the oracle state account is now in-scope and its data can be read from.

```rust,ignore
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();

    // our app-program's state account
    let app_program_account = next_account_info(account_iter)?;

    // our oracle data account
    let oracle_account = next_account_info(account_iter)?; 

    // our oracle data that can now be used within the context of
    // app-program's business logic
    let oracle_data = oracle_account.data.try_borrow().unwrap();

    let msg_str = format!("Oracle data: {}", oracle_data);

    msg!(msg_str);
    ...
}
```

<!-- Internal -->
[Description]: #description
[Flow]: #flow
[Example Program]: #example-program
[Logic]: #logic
[Implementation]: #implementation
[Create oracle project]: #create-oracle-project
[Deploy program]: #deploy-program
[Update the state account]: #update-the-state-account
[Read from the state account]: #read-from-the-state-account

<!-- External -->
[How to write an Arch program]: https://docs.arch.network/book/guides/how-to-write-arch-program.html
[handler]: https://docs.arch.network/book/guides/how-to-write-arch-program.html#handler
[arch-cli]: https://github.com/arch-network/arch-cli
