# Runtime Transaction

A runtime transaction includes a version number, a slice of [signatures](./signature.md) as well as a [message](./message.md) field.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct RuntimeTransaction {
    pub version: u32,
    pub signatures: Vec<Signature>,
    pub message: Message,
}
```
