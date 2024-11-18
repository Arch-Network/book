# Runtime Transaction

A runtime transaction includes a version number, a slice of [signatures] included on the transaction and a [message] field, which details a list of [instructions] to be processed atomically.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct RuntimeTransaction {
    pub version: u32,
    pub signatures: Vec<Signature>,
    pub message: Message,
}
```
[runtime_transaction.rs]

<!-- Internal -->
[message]: ../program/message.md
[signatures]: ./signature.md
[instructions]: ../program/instruction.md

<!-- External -->
[runtime_transaction.rs]: https://github.com/Arch-Network/arch-examples/blob/main/sdk/src/runtime_transaction.rs
