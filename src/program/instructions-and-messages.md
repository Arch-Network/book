# Instructions and Messages

## Instructions

An instruction specifies the `program_id`, which is a unique resource identifier for the [program], a collection of [accounts] needed to execute the instruction, as well as a slice of bytes which, once deserialized, includes the actions for the program to take.

```rust,ignore
#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Instruction {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMeta>,
    pub data: Vec<u8>,
}
```
[instruction.rs]

## Messages

A message structure contains a slice of signing keys as well as a slice of [instruction] data.

```rust,ignore
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Message {
    pub signers: Vec<Pubkey>,
    pub instructions: Vec<Instruction>,
}
```
[message.rs]

<!-- Internal -->
[program]: ./program.md
[accounts]: ./account.md
[instruction]: #instructions

<!-- External -->
[message.rs]: https://github.com/Arch-Network/arch-examples/blob/main/program/src/message.rs
[instruction.rs]: https://github.com/Arch-Network/arch-examples/blob/main/program/src/instruction.rs
