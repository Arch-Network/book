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
First, we'll need to create a new project using the [arch-cli] to hold our oracle logic.

```bash
arch-cli project create --name oracle
```

Example output:
```bash
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

We can then proceed to replace the logic in `oracle/app/program/lib.rs` with our example oracle code as well as update the dependencies (`oracle/app/program/Cargo.toml`), both found within the [arch-examples] repo.

#### Deploy program

After the project is created, the program is written and the `Cargo.toml` is set with the proper dependencies, we can use the [arch-cli] to deploy the program.

```bash
arch-cli deploy 
```

Example output:
```bash
Welcome to the Arch Network CLI
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
Deploying your Arch Network app...
Available folders to deploy:
  1. demo
  2. helloworld
  3. oracle
  4. my_app
Enter the number of the folder you want to deploy (or 'q' to quit): 3
Deploying from folder: "/Users/jr/Documents/ArchNetwork/oracle"
  ℹ Building program...
  ℹ Cargo.toml found at: /Users/jr/Documents/ArchNetwork/oracle
  ℹ Current working directory: /Users/jr/Documents/ArchNetwork/oracle
  ✓ Program built successfully
Select a key to use as the program key: oracle
  ℹ Program ID: e46ed1e7441ac5d583961122bc1b63a46a84ec5d33a1d8967d2a827e65297531
Wallet RPC URI: http://bitcoin-node.dev.aws.archnetwork.xyz:18443/wallet/testwallet
Client connected: 03a06383512c806931d88f55013670454cd95c73611c54ce917552ce9843b50e
  ✓ Wallet 'testwallet' loaded successfully.
  ✓ Transaction sent: f3695398563199274125d69e04769c303167f1de599158c3627e83f7493c448d
  ✓ Transaction confirmed with 1 confirmations
    Creating program account...
    Program account created successfully
    Deploying program transactions...
 [00:00:01] Successfully Processed Deployment Transactions : [####################################################################################################] 10/10 (0s)    Program transactions deployed successfully
    Making program executable...
    Transaction sent: 11488915c4535479023ec264e2c65519748c655531ddf4b6f0516d36c4740a41
    Program made executable successfully
  ✓ Program deployed successfully
  ✓ Wallet 'testwallet' unloaded successfully.
Your app has been deployed successfully!
  ℹ Program ID: e46ed1e7441ac5d583961122bc1b63a46a84ec5d33a1d8967d2a827e65297531
```

During the deployment step, the [arch-cli] creates an account for the deployed program logic and sets the account to be executable, making the distinction that the account is to be considered a [Program] rather than a data [Account].

#### Create state account

From the above output, we should obtain the `program_id`. We can use this `program_id` in order to create a state account that is owned and updated by the program.

The oracle state account can then be read from by any program in order to retrieve the associated oracle data.

```bash
arch-cli account create --name oracle-state-account --program-id e46ed1e7441ac5d583961122bc1b63a46a84ec5d33a1d8967d2a827e65297531
```

Example output:
```bash
Welcome to the Arch Network CLI
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
Creating account for dApp...
  ℹ Account address: bcrt1pz853jlekzq2c9rvx5lz644qc9c3qx6n28g48jv3hyyknzvhm93rsg7r04f
Wallet RPC URI: http://bitcoin-node.dev.aws.archnetwork.xyz:18443/wallet/testwallet
Client connected: 79d37c5aa2b9216b1f4d66cfdfd1e125f9b241536de3ca81ab1a6887881e3e53
  ✓ Wallet 'testwallet' loaded successfully.
Please send funds to the following address:
  → Bitcoin address: bcrt1pz853jlekzq2c9rvx5lz644qc9c3qx6n28g48jv3hyyknzvhm93rsg7r04f
  ℹ Minimum required: 3000 satoshis
  ⏳ Waiting for funds...
  ✓ Transaction sent: fb4f176a0f1a6ed355987c4bfa24491a1e01484b624ffaa00e62d9554e411db1
  ✓ Transaction confirmed with 1 confirmations
  ✓ Account created with Arch Network transaction ID: c6033bc2acfb12f9f330a7b79c25287e1126dcb1ee42f64d2ebf206dd3fc55cb
  ℹ Account public key: "50130456b1bae1cb7ec5b8d2c4afaf08301e899423d1c5908995bc198b6a3326"
Account created and ownership transferred successfully!
IMPORTANT: Please save your private key securely. It will not be displayed again.
  🔑 Private Key: ...
  🔑 Public Key: 50130456b1bae1cb7ec5b8d2c4afaf08301e899423d1c5908995bc198b6a3326
  ✓ Wallet 'testwallet' unloaded successfully.
```

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
[Logic]: #logic
[Implementation]: #implementation
[Create oracle project]: #create-oracle-project
[Deploy program]: #deploy-program
[Create a state account]: #create-state-account
[Update the state account]: #update-the-state-account
[Read from the state account]: #read-from-the-state-account
[Pubkey]: ../program/pubkey.md
[How to write an Arch program]: ./how-to-write-arch-program.md
[handler]: ./how-to-write-arch-program.md#handler

<!-- External -->
[arch-examples]: https://github.com/Arch-Network/arch-examples/tree/main/examples/oracle
[arch-cli]: https://github.com/arch-network/arch-cli
[mempool.space]: https://mempool.space
