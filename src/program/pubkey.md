# Pubkey

A pubkey, or public key, is a custom type that contains a 256-bit (32 bytes) integer derived from the private key.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct Pubkey([u8; 32]);
```
[pubkey.rs]

[pubkey.rs]: https://github.com/Arch-Network/arch-cli/blob/main/program/src/pubkey.rs

