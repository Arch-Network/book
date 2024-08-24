# Program

A program is a special kind of [account] that contain executable [eBPF] bytecode, denoted by the `Account.is_executable: true` field. This allows an account to receive arbitrary [instruction] data via a [transaction] to be processed by the runtime.

Every program is stateless, meaning that it can only read/write data to other accounts and that it **cannot** write to its own account; this, in-part, is how parallelized execution is made possible. 

Any program can be the owner of an account allowing it to be modified. Therefore, if a program receives instruction that results in state being altered, it, as an account owner, would write to its child account holding state and update it accordingly.

Additionally, programs can send instructions to other programs which, in turn, would receive this instruction and provide instruction to its corresponding child account if state were to be updated or read from.

### Components:
#### 1. [Entrypoint]

#### 2. [Instruction]

#### 3. Process Instruction
    - 

#### 4. State

Since programs are stateless, during initialization of the program, a new child account is created with the program being the child account's owner.
    
The program will include a struct to define the structure of its state, defined as a byte array, which the child account will store and manage (within its `data` field).

```rust,ignore
pub fn invoke(instruction: &Instruction, account_infos: &[AccountInfo]) -> ProgramResult {
    for account_meta in instruction.accounts.iter() {
        for account_info in account_infos.iter() {
            if account_meta.pubkey == *account_info.key {
                if account_meta.is_writable {
                    let _ = account_info.try_borrow_mut_data()?;
                } else {
                    let _ = account_info.try_borrow_data()?;
                }
                break;
            }
        }
    }

    let instruction = StableInstruction::from(instruction.clone());
    let result = unsafe {
        crate::syscalls::sol_invoke_signed_rust(
            &instruction as *const _ as *const u8,
            account_infos as *const _ as *const u8,
            account_infos.len() as u64,
        )
    };
    match result {
        crate::entrypoint::SUCCESS => Ok(()),
        _ => Err(result.into()),
    }
}
```
[program.rs]

[eBPF]: https://ebpf.io
[account]: ./accounts.md
[entrypoint]: ./entrypoint.md
[instruction]: ./instruction.md
[transaction]: ./transaction.md
[program.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/program.rs

