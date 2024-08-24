# Messages

A message structure contains a slice of signing keys as well as a slice of [instruction] data.

```rust,ignore
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Message {
    pub signers: Vec<Pubkey>,
    pub instructions: Vec<Instruction>,
}
```
[message.rs]

[instruction]: ./instruction.md
[message.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/message.rs

