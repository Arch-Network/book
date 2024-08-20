# Message

A message structure contains a slice of signing keys as well as a slice of [instruction](./instruction.md) data.

### Example implementation
```rust,ignore
let message = Message {
    signers: vec![Pubkey::from_slice(&caller.public_key.serialize())],
    instructions: vec![instruction.clone()],
};
```

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct Message {
    pub signers: Vec<Pubkey>,
    pub instructions: Vec<Instruction>,
}
```
