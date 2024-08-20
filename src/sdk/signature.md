# Signature

A signature is a custom data type that holds a slice of bytes.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct Signature(pub Vec<u8>);
```
