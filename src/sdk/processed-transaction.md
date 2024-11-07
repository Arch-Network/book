# Processed Transaction

A processed transaction is a custom data type that contains a [runtime transaction], a status, denoting the result of executing this runtime transaction, as well as a collection of Bitcoin transaction IDs.

```rust,ignore
#[derive(Clone, Debug, Deserialize, Serialize, BorshDeserialize, BorshSerialize)]
pub enum Status {
    Processing,
    Processed,
}

#[derive(Clone, Debug, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct ProcessedTransaction {
    pub runtime_transaction: RuntimeTransaction,
    pub status: Status,
    pub bitcoin_txids: Vec<String>,
}
```
[processed_transaction.rs]

[runtime transaction]: ./runtime-transaction.md
[processed_transaction.rs]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/common/src/processed_transaction.rs
