# `WriteBytes`

Writes bytes to an array.

Below, within the instruction's `data` field, we find `vec![1]` which is the correct index for making a call to `SystemProgram::WriteBytes` which will initialize the account with a zero balance.

```rust,ignore
let initialize_balance_account_instruction = Instruction {
    program_id: token_program_pubkey.clone(),
    accounts: vec![
        AccountMeta {
            pubkey: account_pubkey.clone(),
            is_signer: true,
            is_writable: true,
        },
        AccountMeta {
            pubkey: mint_pubkey.clone(),
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: balance_account_pubkey.clone(),
            is_signer: false,
            is_writable: true,
        },
    ],
    data: vec![1],
};
```

We can then submit this instruction within a `sign_and_send_instruction ` call.

```rust,ignore
let (txid, _) = sign_and_send_instruction(
    initialize_balance_account_instruction, 
    vec![program_keypair],
)
.expect("signing and sending a transaction should not fail");
```
