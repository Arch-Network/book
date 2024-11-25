# Signature

A signature is a custom data type that holds a slice of 64 bytes.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Signature(pub Vec<u8>);
```
[signature.rs]

<!-- External -->
[signature.rs]: https://github.com/Arch-Network/arch-examples/blob/main/sdk/src/signature.rs
