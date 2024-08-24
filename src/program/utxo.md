# UTXO

A `UtxoMeta` structure contains a 36-byte `u8` array representing the [UTXO].

```rust,ignore
#[derive(Clone, Debug, PartialEq, Eq)]
#[repr(C)]
pub struct UtxoMeta([u8; 36]);
```
[utxo.rs]

[UTXO]: https://learnmeabitcoin.com/technical/transaction/utxo/
[utxo.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/utxo.rs

