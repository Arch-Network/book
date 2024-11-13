# `MakeExecutable`

**Index:** `2`

Writes bytes to an array and serializes them.

Below, within the [Instruction] `data` field, we find local variable `instruction_data` that contains `vec![2]`, the correct index for making a call to `SystemProgram::MakeExecutable`. 

```rust,ignore
let instruction_data = vec![2];

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

We can proceed to confirm that the program is executable with [read_account_info] which returns an [AccountInfoResult] that gets parsed to obtain the `is_executable` value.

```rust,ignore
assert!(
    read_account_info("node_url", program_pubkey)
        .unwrap()
        .is_executable
);
```

<!-- Internal -->
[Instruction]: ../program/instructions-and-messages.md#instructions

<!-- External -->
[read_account_info]: https://github.com/Arch-Network/arch-examples/blob/main/sdk/src/helper.rs#L368
[AccountInfoResult]: https://github.com/Arch-Network/arch-examples/blob/main/sdk/src/helper.rs#L358
