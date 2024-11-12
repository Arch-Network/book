# `AssignOwnership`

Sets a [Pubkey] to be the owner of an account.

Below, within the instruction's `data` field, we find `instruction_data` which is a local variable that contains `vec![3]`, the correct index for making a call to `SystemProgram::AssignOwnership`. 

The `instruction_data` also contains the serialized [Pubkey] of the program required to associate ownership.

```rust,ignore
let mut instruction_data = vec![3];
instruction_data.extend(program_pubkey.serialize());

Ok(Instruction {
    program_id: Pubkey::system_program(),
    accounts: vec![AccountMeta {
        pubkey: account_pubkey.clone(),
        is_signer: true,
        is_writable: true,
    }],
    data: instruction_data,
})
```

[Pubkey]: ../program/pubkey.md
