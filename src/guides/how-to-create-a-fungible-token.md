# How to create a fungible token

This guide walks through how to implement the Fungible Token Standard program, part of the Arch Program Library, or APL.

Table of Contents:
- [Description]
- [Logic]
- [Implementation]
---

### Description
The Fungible Token Standard program provides a consistent interface for implementing fungible tokens on Arch. As with all programs within the APL, this program is predeployed and is tested against the Arch runtime.

The source code can be found within the [arch-examples] repo.

### Logic
If you haven't already read [How to write an Arch program], we recommend starting there to get a basic understanding of the program anatomy before going further.

In this guide, we'll be walking through the Fungible Token Standard [tests] which provide implementation examples.

### Implementation

- [Deploy]
- [Mint]
- [Transfer]
- [Balance check]

#### Deploy

Although the Fungible Token Standard program is predeployed, we can deploy it ourselves for local testing. Move to [Mint] if you'd like to skip this step.

To demonstrate a deploy, we'll reference: [deploy.rs]

We make use of [`try_deploy_program`], a helper function from the [ebpf-counter] example to deploy our program.

```rust,ignore
pub const ELF_PATH: &str = "./program/target/sbf-solana-solana/release/fungible-token-standard-program.so";

fn deploy_standard_program() {
    let program_pubkey =
        try_deploy_program(ELF_PATH, PROGRAM_FILE_PATH, "Fungible-Token-Standard").unwrap();

    println!(
        "Deployed Fungible token standard program account id {:?}!",
        program_pubkey.serialize()
    );
...
}
```

#### Mint
To mint tokens, we must supply a few pieces of information:
- Owner
- Supply
- Ticker
- Decimals

This data gets stored in the `InitializeMintInput` struct, which will be used to generate a new instance of the Fungible Token Standard.

```rust,ignore
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct InitializeMintInput {
    owner: [u8; 32],
    supply: u64, // in lowest denomination
    ticker: String,
    decimals: u8,
}
```

To demonstrate a mint, we'll reference: [tests_mint.rs]

We initialize a new instance of `InitializeMintInput` and pass in the necessary data. In the below case, our owner account will create the token "SPONK," with a total supply of 1,000,000, which will have only a single decimal, meaning it is divisible by 1.

```rust,ignore
// deploy.rs
let mint_input = InitializeMintInput::new(
    mint_account_pubkey.serialize(),
    1000000,
    "SPONK".to_string(),
    1,
);
```

We then serialize `mint_input` so that we can pass it as `instruction_data` within an [Instruction] which then gets submitted to the deployed Fungible Token Standard program.

```rust,ignore
let mut instruction_data = vec![0u8];

mint_input
    .serialize(&mut instruction_data)
    .expect("Couldnt serialize mint input");

let initialize_mint_instruction = Instruction {
    program_id: program_pubkey.clone(),
    accounts: vec![AccountMeta {
        pubkey: mint_account_pubkey,
        is_signer: true,
        is_writable: true,
    }],
    data: instruction_data,
};
```

Next, we build a transaction using [`build_transaction`] and then submit the transaction with [`build_and_send_block`], both helper function from the [ebpf-counter] example.

```rust,ignore
let transaction = build_transaction(
    vec![mint_account_keypair],
    vec![initialize_mint_instruction],
);

let block_transactions = build_and_send_block(vec![transaction]);
```

We fetch the result of the transaction with [`fetch_processed_transactions`] helper function ([ebpf-counter]) and then obtain the mint details by passing the [Pubkey] of the token owner.

```rust,ignore
let processed_transactions = fetch_processed_transactions(block_transactions).unwrap();

assert!(matches!(
    processed_transactions[0].status,
    Status::Processed
));

let mint_details = get_mint_info(&mint_account_pubkey).expect("Couldnt deserialize mint info");

println!("Mint account {:?}", mint_account_pubkey.serialize());
```

#### Transfer

To demonstrate a transfer, we'll reference: [tests_transfer.rs]

We obtain a `mint_account_pubkey`, made possible by using the [`try_create_mint_account`] helper function. We pass `true` as this is a one-time mint event and this will generate a new keypair and [Pubkey].

This step will actually create a new token with the following details:
- Supply: 1,000,000
- Ticker: "ARCH"
- Decimals: 2
- Mint Price: 1000 sats

```rust,ignore
let mint_account_pubkey = try_create_mint_account(true).unwrap();
```

We then fetch the token mint details with [`get_mint_info`].

```rust,ignore
let previous_mint_details = get_mint_info(&mint_account_pubkey).unwrap();
```

Now, let's provision our two accounts: the sender and the receiver.

```rust,ignore
// sending account
let (first_account_owner_key_pair, first_account_owner_pubkey, _first_account_owner_address) =
        generate_new_keypair();

let first_balance_account_pubkey = create_balance_account(
        &first_account_owner_pubkey,
        first_account_owner_key_pair,
        &mint_account_pubkey,
        &program_pubkey,
)
.unwrap();

// receiving account
let (second_account_owner_key_pair, second_account_owner_pubkey, _second_account_owner_address) =
    generate_new_keypair();

let second_balance_account_pubkey = create_balance_account(
    &second_account_owner_pubkey,
    second_account_owner_key_pair,
    &mint_account_pubkey,
    &program_pubkey,
)
.unwrap();
```

We then procure funds for the sending account. In this case, we'll mint 10 tokens.

```rust,ignore
let mint_amount = 10u64;

let mint_instruction = mint_request_instruction(
    &mint_account_pubkey,
    &program_pubkey,
    &first_balance_account_pubkey,
    &first_account_owner_pubkey,
    mint_amount,
)
.unwrap();
```

We utilize the [`transfer_request_instruction`] helper function to generate a transfer [Instruction].

```rust,ignore
let transfer_instruction = transfer_request_instruction(
    &mint_account_pubkey,
    &program_pubkey,
    &first_balance_account_pubkey,
    &first_account_owner_pubkey,
    &second_balance_account_pubkey,
    mint_amount,
)
.unwrap();
```

We build the transaction by passing in the newly created transfer [Instruction] as well as the keypair of the sending account, necessary for authorizing the fund transfer.

```rust,ignore
let transfer_transaction = build_transaction(
    vec![first_account_owner_key_pair],
    vec![transfer_instruction],
);
```

Next, we then submit the transaction with [`build_and_send_block`] and then fetch the processed transaction to get the result.

```rust,ignore
let block_transactions = build_and_send_block(vec![transfer_transaction]);

let processed_transactions = fetch_processed_transactions(block_transactions).unwrap();

assert!(matches!(
    processed_transactions[0].status,
    Status::Processed
));
```
#### Balance check

In order to check the token balance of an account, we'll make use of the `get_balance_account` function and pass in the account we are looking to query the balance of; in the below example, we'll fetch the balances of both the sending and receiving accounts.

```rust,ignore
let resulting_sender_balance = get_balance_account(&first_balance_account_pubkey).unwrap();

let resulting_receiver_balance = get_balance_account(&second_balance_account_pubkey).unwrap();

assert_eq!(resulting_receiver_balance.current_balance, mint_amount);

assert_eq!(resulting_sender_balance.current_balance, 0);
```

<!-- Internal -->
[Description]: #description
[Logic]: #logic
[Implementation]: #implementation
[Deploy]: #deploy
[Mint]: #mint
[Transfer]: #transfer
[Balance Check]: #balance-check
[Instruction]: ../program/instructions-and-messages.md#instructions
[Pubkey]: ../program/pubkey.md
[How to write an Arch program]: ./how-to-write-arch-program.md

<!-- External -->
[arch-examples]: https://github.com/Arch-Network/arch-examples/tree/main/examples/fungible-token-standard
[`try_deploy_program`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/ebpf-counter/src/counter_deployment.rs#L1
[ebpf-counter]: https://github.com/Arch-Network/arch-examples/blob/main/examples/ebpf-counter
[deploy.rs]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/deploy.rs
[tests_mint.rs]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/tests_mint.rs
[`build_transaction`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/ebpf-counter/src/counter_instructions.rs#L163
[`build_and_send_block`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/ebpf-counter/src/counter_instructions.rs#L196
[`try_create_mint_account`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/helpers.rs#L38
[`fetch_processed_transactions`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/ebpf-counter/src/counter_instructions.rs#L207
[`get_mint_info`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/helpers.rs#L173
[`transfer_request_instruction`]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/instruction.rs#L116
[tests_transfer.rs]: https://github.com/Arch-Network/arch-examples/blob/main/examples/fungible-token-standard/src/tests_transfer.rs
