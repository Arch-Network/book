# Instructions

An instruction specifies the `program_id`, which is a unique resource identifier for the [program], a collection of [AccountMeta] to be consumed, as well as a slice of bytes which, once deserialized, includes the actions for the program to take.

```rust,ignore
#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Instruction {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMeta>,
    pub data: Vec<u8>,
}
```
[instruction.rs]

[account]: ./account.md
[pubkey]: ./pubkey.md
[instruction.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/instruction.rs

