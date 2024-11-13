# `CreateAccount`

**Index:** `0`

Create a new account.

Below, within the [Instruction] `data` field, we find local variable `instruction_data` that contains `vec![0]`, the correct index for making a call to `SystemProgram::CreateAccount`. 

```rust,ignore
let instruction_data = vec![0];

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
[Instruction]: ../program/instructions-and-messages.md#instructions
