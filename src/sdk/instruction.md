# Instruction

An instruction specifies the `program_id`, which is a unique resource identifier of type [Pubkey](./pubkey.md) for the program, a collection of [UtxoMeta](./utxo.md#utxometa) to be consumed, as well as a slice of bytes which, once deserialized, includes the actions for the program to take. 

If any part of the instructions fail during invocation, the entire transaction fails.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct Instruction {
    pub program_id: Pubkey,
    pub utxos: Vec<UtxoMeta>,
    pub data: Vec<u8>,
}
```
