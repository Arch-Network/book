# `WriteBytes`

**Index:** `1`

Writes bytes to an array and serializes it.

Below, within the [Instruction] `data` field, we find local variable `instruction_data` that contains `vec![1]`, the correct index for making a call to `SystemProgram::WriteBytes` and clones and appends all elements in offset to the `instruction_data` as well.

```rust,ignore
let offset = 4u32.to_le_bytes();
let mut instruction_data = vec![1];
instruction_data.extend_from_slice(&offset);

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
