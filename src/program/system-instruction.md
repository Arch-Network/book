# System Instruction

By default, every [account] is owned by the System Program ([Pubkey]). Only the System Program can create a new account.

```rust,ignore
#[derive(Clone, PartialEq, Eq, Debug)]
pub enum SystemInstruction {
    CreateAccount(UtxoMeta),
    ExtendBytes(Vec<u8>),
}

...

pub fn new_create_account_instruction(
    txid: [u8; 32],
    vout: u32,
    pubkey: Pubkey,
) -> Instruction {
    Instruction {
        program_id: Pubkey::system_program(),
        accounts: vec![AccountMeta {
            pubkey,
            is_signer: true,
            is_writable: true,
        }],
        data: SystemInstruction::CreateAccount(UtxoMeta::from(txid, vout)).serialise(),
    }
}
```
[system_instruction.rs]

[account]: ./account.md
[Pubkey]: ./pubkey.md
[system_instruction.rs]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/program/src/system_instruction.rs
