# Accounts

An account is a unique 256-bit address that can store arbitrary data. 

Everything on Arch is an account, and anyone can publicly read from any account; however, only an account's owner can modify data within an account.

If an account `is_executable: true`, then the account is considered to be a [program]; conversely, if an account `is_executable: false`, then it is considered to be a data account, meaning that it only serves to hold and manage state of a program.

```rust,ignore
#[derive(Clone)]
#[repr(C)]
pub struct AccountInfo<'a> {
    pub key: &'a Pubkey, // address of the account
    pub utxo: &'a UtxoMeta, // utxo has this account key in script_pubkey
    pub data: Rc<RefCell<&'a mut [u8]>>, // if program, program bytecode; if data account, program state
    pub owner: &'a Pubkey, // owner of an account is always a program
    pub is_signer: bool,
    pub is_writable: bool,
    pub is_executable: bool, // true: program; false: data account
}

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
#[repr(C)]
pub struct AccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
```
[account.rs]


[eBPF]: https://ebpf.io
[program]: ./program.md
[account.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/account.rs
