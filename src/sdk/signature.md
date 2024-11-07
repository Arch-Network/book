# Signature

A signature is a custom data type that holds a slice of 64 bytes.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Signature(pub Vec<u8>);
```
[signature.rs]

[signature.rs]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/common/src/signature.rs 
