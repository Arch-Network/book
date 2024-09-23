# How to write an Arch program

Table of Contents:
- [Program]
- [Imports]
- [Entrypoint]
- [Handler]
---

[The Arch Book] can serve as a reference for concepts introduced here as well as our [docs] for high-level architecture diagrams and comparisons to other similar projects building on Bitcoin.

For this guide, we will be walking through the [helloworld] example program located within the [arch-local] repository.

## Program

A smart contract on Arch is known as a [program].

```rust,ignore
use arch_program::{
    account::{AccountInfo},
    entrypoint,
    msg,
    program::{
        next_account_info,
        get_account_script_pubkey,
        get_state_transition_tx,
    },
    transaction_to_sign::TransactionToSign,
    program_error::ProgramError,
    input_to_sign::InputToSign,
    pubkey::Pubkey,
};
use borsh::{BorshSerialize, BorshDeserialize};
use bitcoin::{Transaction};

entrypoint!(process_instruction);
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if accounts.len() != 1 {
        return Err(ProgramError::Custom(501));
    }

    let account_iter = &mut accounts.iter();
    let account = next_account_info(account_iter)?;

    let params: HelloWorldParams = borsh::from_slice(instruction_data).unwrap();
    let fees_tx: Transaction = bitcoin::consensus::deserialize(&params.tx_hex).unwrap();

    let new_data = format!("Hello {}", params.name);

    let data_len = account.data.try_borrow().unwrap().len();
    if new_data.as_bytes().len() > data_len {
        account.realloc(new_data.len(), true)?;
    }

    let script_pubkey = get_account_script_pubkey(account.key);
    msg!("script_pubkey {:?}", script_pubkey);

    account.data.try_borrow_mut().unwrap().copy_from_slice(new_data.as_bytes());

    let mut tx = get_state_transition_tx(accounts);
    tx.input.push(fees_tx.input[0].clone());

    let tx_to_sign = TransactionToSign {
        tx_bytes: &bitcoin::consensus::serialize(&tx),
        inputs_to_sign: &[InputToSign {
            index: 0,
            signer: account.key.clone()
        }]
    };

    msg!("tx_to_sign{:?}", tx_to_sign);

    set_transaction_to_sign(accounts, tx_to_sign);

    Ok(())
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct HelloWorldParams {
    pub name: String,
    pub tx_hex: Vec<u8>,
}
```

## Imports

First, let's bring our `arch_program`, `borsh` and `bitcoin` crates into local namespace.

```rust,ignore
use arch_program::{
    account::{AccountInfo},
    entrypoint,
    msg,
    program::{
        next_account_info,
        get_account_script_pubkey,
        get_state_transition_tx,
    },
    transaction_to_sign::TransactionToSign,
    program_error::ProgramError,
    input_to_sign::InputToSign,
    pubkey::Pubkey,
};
use borsh::{BorshSerialize, BorshDeserialize};
use bitcoin::{Transaction};
```

Before we continue, let's quickly introduce some helpful resources that we are importing:
- `entrypoint`: a macro used for invoking our program.
- `msg`: a macro use for logging messages to the console.
- `borsh`: a crate for serialization/deserialization of data passed to/from our program.
- `bitcoin`: a crate for working with the Bitcoin blockchain.

## Entrypoint
Every Arch program includes a single entrypoint used to invoke the program.

This tells Arch that the entrypoint to this program is the the `process_instruction` function, our [handler].

```rust,ignore
entrypoint!(process_instruction);
```

## Handler

The handler (`process_instruction`) parameters must match what is required for a transaction [instruction].

- `program_id` - Unique identifier of the currently executing program.
- `accounts` - Slice reference containing accounts needed to execute an instruction.
- `instruction_data` - Serialized data containing program instructions.

```rust,ignore
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    ...
}
```

Now that we're inside the function scope, first, we check that there are a sufficient number of accounts are passed into our program. 

We then iterate over the accounts passed in to the program and retrieve the first one.
```rust,ignore
if accounts.len() != 1 {
    return Err(ProgramError::Custom(501));
}

let account_iter = &mut accounts.iter();
let account = next_account_info(account_iter)?;
```

Next, we deserialize our `instruction_data` into a newly initialized instance of `HelloWorldParams` to hold our program state and more easily manage it within our program logic.
```rust,ignore
let params: HelloWorldParams = borsh::from_slice(instruction_data).unwrap();
```

Now that our `instruction_data` has been deserialized, we can access the fields, such as `params.tx_hex`. 

In this step, we will use the [Bitcoin crate] to further deserialize a reference to the `tx_hex` field into an instance of a [Bitcoin transaction]; this represents the fees that need to be paid to execute the program instruction.

```rust,ignore
let fees_tx: Transaction = bitcoin::consensus::deserialize(&params.tx_hex).unwrap();
```

>NOTE: `tx_hex` represents a serialized Bitcoin UTXO that is used to pay the fee for updating state/executing a transaction; it is a full-signed Bitcoin UTXO but is sent directly to Arch first then the leader submits it alongside the other state/asset UTXOs as a result of the program execution.
>
> Including `tx_hex` is a convention, not a requirement.
> 
> Program invocation can be paid for by another source, although in the majority of cases it is most practical to have caller be prepared to pay this.

Next, we'll access the `data` field of the [account] and attempt to borrow it in order to determine the length of the value stored within it.

We then check whether the length of the new data that we wish to pass to the program exceeds the length that is stored within the existing account's data (ie, the program state) by comparing byte lengths. 

If the new data exceeds the length of what was currently stored in the account's data field, then we re-allocate the account's data as well as zero-initialize the new memory. This is done to ensure that no stale data remains.

[Read more about `.realloc` zero-initialization](https://github.com/Arch-Network/arch-local/blob/main/program/src/account.rs#L131-L148).

```rust,ignore
let data_len = account.data.try_borrow().unwrap().len();
if new_data.as_bytes().len() > data_len {
    account.realloc(new_data.len(), true)?;
}
```

Next, we retrieve the `script_pubkey` from the `key` field of the [account]. This tells us how the Bitcoin can be spent; we log this out for debugging.
```rust,ignore
let script_pubkey = get_account_script_pubkey(account.key);
msg!("script_pubkey {:?}", script_pubkey);
```

Next, we attempt a mutated borrow of the account data in order to copy contents in from the data passed into our program.
```rust,ignore
account.data.try_borrow_mut().unwrap().copy_from_slice(new_data.as_bytes());
```

Here, we construct our state transition transaction inside of a mutable variable called `tx`. We then copy over the [Bitcoin transaction] input to our mutatable state transition transaction: `tx`.
```rust,ignore
let mut tx = get_state_transition_tx(accounts);
tx.input.push(fees_tx.input[0].clone());
```

Now, we're ready to sign and submit the transaction to Bitcoin which will cement our state alteration.

Here, we construct a new Arch transaction that includes our serialized [Bitcoin transaction] alongside our program's key serving as the signer.
```rust,ignore
let tx_to_sign = TransactionToSign {
    tx_bytes: &bitcoin::consensus::serialize(&tx),
    inputs_to_sign: &[InputToSign {
        index: 0,
        signer: account.key.clone()
    }]
};
```

Finally, we pass in the list of accounts our program received initially alongside the previously constructed transaction (`tx_to_sign`) into a helper function that will serialize it and set the UTXOs to the account.
```rust,ignore
set_transaction_to_sign(accounts, tx_to_sign);
```

🎉🎉🎉

Congratulations, you've walked through constructing the [helloworld] program. In the next guide, we'll walk you through how to test the logic of your program.


<!-- Internal -->
[Program]: #program
[Imports]: #imports
[Entrypoint]: #entrypoint
[Handler]: #handler

<!-- External -->
[docs]: https://docs.arch.network
[UTXO]: ../program/utxo.md
[account]: ../program/account.md
[program]: ../program/program.md
[instruction]: ../program/instructions-and-messages.html#instructions
[arch-local]: https://github.com/Arch-Network/arch-local
[helloworld]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/
[Bitcoin crate]: https://docs.rs/bitcoin/latest/bitcoin/index.html
[Bitcoin transaction]: https://docs.rs/bitcoin/0.32.0/bitcoin/struct.Transaction.html
[The Arch Book]: ../introduction.md

