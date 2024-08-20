# UTXO

### UtxoMeta

A `UtxoMeta` structure contains a transaction id (`txid`) as well as an index number (`vout`) denoting which UTXO, or output, is to be referenced later.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct UtxoMeta {
    pub txid: String,
    pub vout: u32,
}
```

#### Example implementation
```rust,ignore
vec![
    UtxoMeta {
        txid: first_state_txid.clone(),
        vout: 1,
    },
    UtxoMeta {
        txid: second_state_txid.clone(),
        vout: 1,
    },
];
```

### UtxoInfo

A `UtxoInfo` struct contains a transaction id (`txid`), a UTXO index number (`vout`), an authority [key](./pubkey.md), as well as a data field that holds a slice of bytes associated with the UTXO.

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UtxoInfo {
    pub txid: String,
    pub vout: u32,
    pub authority: RefCell<Pubkey>,
    pub data: RefCell<Vec<u8>>,
}
```

#### Example implementation
```rust,ignore
UtxoInfo {
    txid: utxo.txid.clone(),
    vout: utxo.vout,
    authority: RefCell::new(Pubkey::from_slice(
        &authorities
            .get(&utxo.id())
            .expect("this utxo does not exist")
            .to_vec(),
    )),
    data: RefCell::new(
        data.get(&utxo.id())
            .expect("this utxo does not exist")
            .to_vec(),
    ),
}
```
