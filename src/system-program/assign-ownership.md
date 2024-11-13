# `AssignOwnership`

**Index:** `3`

Sets a [Pubkey] to be the owner of an account.

Below, within the [Instruction] `data` field, we find local variable `instruction_data` that contains `vec![3]`, the correct index for making a call to `SystemProgram::AssignOwnership`. 

The `instruction_data` also contains the serialized [Pubkey] of the owner account.

```rust,ignore
let mut instruction_data = vec![3];
instruction_data.extend(program_pubkey.serialize());

let instruction = Instruction {
    program_id: Pubkey::system_program(),
    accounts: vec![AccountMeta {
        pubkey,
        is_signer: true,
        is_writable: true,
    }],
    data: instruction_data,
}
```

<!-- Internal -->
[Pubkey]: ../program/pubkey.md
[Instruction]: ../program/instructions-and-messages.md#instructions
