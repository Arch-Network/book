# System Instruction

By default, every [account] is owned by the System Program ([Pubkey]). Only the System Program can create a new account.

`SystemInstruction` provides a method to create a new account through the System Program (see [Implementation](#implementation)).

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

### Implementation
```rust,ignore
let (txid, instruction_hash) = sign_and_send_instruction(
    SystemInstruction::new_create_account_instruction(
        hex::decode(txid).unwrap().try_into().unwrap(),
        vout,
        program_pubkey.clone(),
    ),
    vec![program_keypair],
).expect("signing and sending a transaction should not fail");
```
[helloworld/src/lib.rs]

[account]: ./account.md
[Pubkey]: ./pubkey.md
[system_instruction.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/system_instruction.rs
[helloworld/src/lib.rs]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/src/lib.rs#L47-L51

