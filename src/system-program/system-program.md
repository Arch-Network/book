# System Program

The Arch System Program is Arch's core program. This program contains a set of variants that can be thought-of as native functionality that can be used within any Arch program.

The System Program creates new accounts, assigns accounts to owning programs, marks account as executable and writes data to the accounts.

```rust,ignore
enum InstructionType {
    CreateAccount(UtxoMeta),
    WriteBytes {
        offset: usize,
        len: usize,
        data: Vec<u8>,
    },
    MakeExecutable,
    AssignOwnership(Pubkey),
    Unknown,
}
```
