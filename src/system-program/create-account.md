# `CreateAccount`

Create a new account.

Below, we sign and submit the results of a `SystemInstruction` call to [`new_create_account_instruction`] which creates an account and associates the account with the calling program as the owner.

```rust,ignore
let (txid, _) = sign_and_send_instruction(
    SystemInstruction::new_create_account_instruction(
        hex::decode(txid).unwrap().try_into().unwrap(),
        vout,
        program_pubkey,
    ),
    vec![program_keypair],
)
.expect("signing and sending a transaction should not fail");
```

[`new_create_account_instruction`]: https://github.com/Arch-Network/arch-cli/blob/main/templates/demo/program/src/system_instruction.rs#L40
