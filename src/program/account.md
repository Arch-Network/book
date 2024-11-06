# Accounts

An account is a unique 32-bytes address that can store arbitrary data. 

Everything on Arch is an account, and anyone can publicly read from any account; however, only an account's owner can modify data within an account.

If an account `is_executable: true`, then the account is considered to be a [program]; conversely, if an account `is_executable: false`, then it is considered to be a data account, meaning that it only serves to hold and manage state of a program.

#### Key Concepts
- Accounts can store up to 10MB of data, which can consist of either executable program code or program state
- Every account has a [UTXO]. The UTXO is used to anchor the state change to bitcoin.
- New Account Creation: Only the System Program can create a new account
- Space Allocation: Sets the byte capacity for the data field of an account
- Data Modification: Modifies the data field of an account

```rust,ignore
#[derive(Clone)]
#[repr(C)]
pub struct AccountInfo<'a> {
    pub key: &'a Pubkey, // address of the account
    pub utxo: &'a UtxoMeta, // utxo has this account key in script_pubkey
    pub data: Rc<RefCell<&'a mut [u8]>>, 
    pub owner: &'a Pubkey, 
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


[UTXO]: ./utxo.md
[eBPF]: https://ebpf.io
[program]: ./program.md
[account.rs]: https://github.com/Arch-Network/arch-cli/blob/main/program/src/account.rs

