# Program

A program is a special kind of [account] that contains executable [eBPF] bytecode, denoted by the `Account.is_executable: true` field. This allows an account to receive arbitrary [instruction] data via a [transaction] to be processed by the runtime.

Every program is stateless, meaning that it can only read/write data to other accounts and that it **cannot** write to its own account; this, in-part, is how parallelized execution is made possible (see [State] for more info).

> 💡 Additionally, programs can send instructions to other programs which, in turn, receive instructions and thus extend program composability further. This is known as cross-program invocation (CPI) and will be detailed in future sections.

### Components:
#### 1. [Entrypoint]

Every Arch program includes a single entrypoint used to invoke the program. A [handler function], often named `process_instruction`, is then used to handle the data passed into the entrypoint. 

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

If a program has multiple instructions, a corresponding [handler function] should be defined to include the specific logic unique to the instruction.

#### 4. State

Since programs are stateless, a "data" [account] is needed to hold state for a user. This is a non-executable account that holds program data.

If a program receives instruction that results in a user's state being altered, the program would manage this user's state via a mapping within the program's logic. This mapping would link the user's [pubkey] with a data [account] where the state would live for that specific program.
 
The program will likely include a struct to define the structure of its state and make it easier to work with. The deserialization of account data occurs during program invocation. After an update is made, state data gets re-serialized into a byte array and stored within the `data` field of the [account].

[State]: #4-state
[eBPF]: https://ebpf.io
[account]: ./accounts.md
[pubkey]: ./pubkey.md
[entrypoint]: ./entrypoint.md
[instruction]: ./instructions-and-messages.md
[transaction]: ./transaction.md
[handler function]: ./entrypoint.md#handler-function
[lib.rs]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/lib.rs

