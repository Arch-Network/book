# How to write an oracle program

This guide walks through the innerworkings of an oracle program as well as details how oracle data can be utilized by other programs on Arch Network.

Table of Contents:
- [Description]
- [Flow]
- [Logic]
- [Implementation]
---

### Description
Two important aspects of understanding how this oracle example is implemented within Arch:
1. The oracle is a program that updates an account which holds the data
2. No cross-program invocation occurs since only the account is updated and read from versus this being another program that gets interacted with from another program

The source code can be found within the [arch-examples] repo.

### Flow
- Project deploys oracle program
- Project creates state account that the oracle program will control in order to write state to it
- Projects submit data to the oracle state account by submitting instructions to the oracle program
- Programs include oracle state account alongside their program instructions in order to use this referenced data stored in the oracle state account within their program
- Projects submit instructions to oracle program periodically to update oracle state account with fresh data

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
- [Create a state account]
- [Update the state account]
- [Read from the state account]

#### Create oracle project
First, we'll need to create a new project to hold our oracle logic.

```bash
# Create a new directory for your oracle project
mkdir oracle
cd oracle

# Initialize a Rust project
cargo init --lib
```

> Note: The new CLI does not currently have a project creation command. We'll manually set up our project structure.

You'll need to create and edit the following files:
- `Cargo.toml` - Add dependencies for your oracle program
- `src/lib.rs` - Implement the oracle program logic

Example program files can be found in the [arch-examples] repo.

#### Deploy program

After the project is created, the program is written and the `Cargo.toml` is set with the proper dependencies, we can deploy the program.

```bash
# Build the program
cargo build-sbf

# Deploy the program
cli deploy target/deploy/oracle.so
```

During the deployment, a new account is created for the deployed program logic and set to be executable, marking it as a [Program] rather than a data [Account].

#### Create state account

From the deployment output, you should obtain the `program_id`. We can use this `program_id` to create a state account that is owned and updated by the program.

The oracle state account can then be read from by any program in order to retrieve the associated oracle data.

```bash
# The new CLI may not have direct account creation functionality
# You'll need to use an RPC call to create the account

# For example, using curl:
curl -X POST http://localhost:9002 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"sendTransaction",
    "params":[{
      "signature":"your_signature",
      "message":{
        "accountKeys":["your_pubkey", "your_program_id"],
        "instructions":[{
          "programId":"system_program_id",
          "accounts":["your_pubkey", "new_account_pubkey"],
          "data":"encoded_create_account_data"
        }]
      }
    }]
  }'
```

> Note: The above is a simplified example. You'll need to properly construct, sign, and encode your transaction according to the Arch Network protocol.

In this step, the account is created and ownership is transferred to the program. This allows the program to update the account's data field which holds state for the program.

#### Update the state account

Now that we have created an account and the oracle program has authority to update it, we now want to update the data that the account holds.

In order to update the data stored in the account, we simply need to make a transaction that includes the data that we wish to update the oracle state account to hold, and submit this within the context of an instruction.

As an example, below we have a sample rust program that we'll use to fetch the Bitcoin fees from the [mempool.space] API and store this fee data in our oracle state account that was created during deployment.

> Note: The below is a rust program and is not an Arch program. 
> 
> The call to update the oracle state account can be written in any programming language as it is simply an RPC call. For sake of continuity, we're using rust along with methods from both the `program` and `sdk` crates.

```rust,ignore
use bitcoincore_rpc::{Auth, Client};

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

<!-- Internal -->
[Description]: #description
[Flow]: #flow
[Logic]: #logic
[Implementation]: #implementation
[Create oracle project]: #create-oracle-project
[Deploy program]: #deploy-program
[Create a state account]: #create-a-state-account
[Update the state account]: #update-the-state-account
[Read from the state account]: #read-from-the-state-account
[handler]: #logic

<!-- External -->
[arch-examples]: https://github.com/arch-network/arch-examples
[How to write an Arch program]: ./how-to-write-arch-program.md
[Program]: ../program/program.md
[Account]: ../program/account.md
[mempool.space]: https://mempool.space
