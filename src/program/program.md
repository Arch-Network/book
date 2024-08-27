# Program

A program is a special kind of [account] that contains executable [eBPF] bytecode, denoted by the `Account.is_executable: true` field. This allows an account to receive arbitrary [instruction] data via a [transaction] to be processed by the runtime.

Every program is stateless, meaning that it can only read/write data to other accounts and that it **cannot** write to its own account; this, in-part, is how parallelized execution is made possible. 

Any program can be the owner of an account allowing it to be modified. Therefore, if a program receives instruction that results in state being altered, it, as an account owner, would write to its child account holding state and update it accordingly.

Additionally, programs can send instructions to other programs which, in turn, would receive this instruction and provide instruction to its corresponding child account if state were to be updated or read from.

### Components:
#### 1. [Entrypoint]

Every Arch program includes a single entrypoint used to invoke the program. A [dispatcher function], typically named `process_instruction`, is then used to handle the data passed into the entrypoint. 

`process_instruction` requires the following parameters:

- `program_id` - Unique identifier of the currently executing program.
- `accounts` - Slice reference containing accounts needed to execute an instruction.
- `instruction_data` - Serialized data containing program instructions.

_These parameters are required for every [instruction] to be processed.__

```rust,ignore
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
...
}
```
[lib.rs]

#### 2. [Instruction]

The `instruction_data` is deserialized after being passed into the entrypoint. From there, if there are multiple instructions, a `match` statement can be utilized to point the logic flow to the appropriate handler function previously defined within the program which can continue processing the instruction.

#### 3. Process Instruction

If a program has multiple instructions, corresponding handler functions should be defined to include the specific logic unique to the instruction.

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
[dispatcher function]: ../basics/entrypoint.md#dispatcher-function
[lib.rs]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/lib.rs
[program.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/program.rs

