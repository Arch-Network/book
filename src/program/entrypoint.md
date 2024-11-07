# Entrypoint and Handler Functions

## Entrypoint

Every Arch program includes a single entrypoint used to invoke the program. A [handler function] is then used to process the data passed into the entrypoint.

```rust,ignore
entrypoint!(process_instruction);
```
[lib.rs]

#### Initialization and Data Reading:
The entrypoint begins by initializing and reading serialized data that is passed in, which includes everything needed for program execution. It then deserializes this data to obtain the [instruction], an object which contains all necessary details like the `program_id` and associated [UTXO] information.

It passes in all deserialized data in to the [handler function] for processing of the [program]'s business logic; this could involve transactions, state updates, or other program-specific operations.

## Handler function

Here we'll discuss the dispatcher function, in our case, named: `process_instruction`.

This dispatcher function requires the following parameters:
- `program_id` - Unique identifier of the currently executing program.
- `accounts` - Slice reference containing accounts needed to execute an instruction.
- `instruction_data` - Serialized data containing program instructions.

This returns a [`Result`] representing success (`Ok`) or failture ([`ProgramError`]).
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

This function is responsible for parsing and directing the execution flow based on the type of transaction or method specified. It is a critical component that developers must implement to ensure that their programs can appropriately respond to different operational requests.

The handler function is defined as part of the program and is facilitated via the [`entrypoint!`]. This macro binds the `process_instruction` function to be the first receiver of any execution call made by the Arch virtual machine, effectively making it the gatekeeper for all incoming instructions.

#### Deserialize Input Data
The function starts by deserializing the input data (`instruction_data`) into a known format, typically a custom struct that represents different methods or commands the program can execute.

#### Method Dispatch
Based on the deserialized data, the function determines which specific method to execute. This is often handled through a match statement that routes to different functions or modules within the program.

#### Execute Business Logic
Each routed function performs specific business logic related to the program's purpose, such as managing assets, updating state, or interacting with other program or tokens.

#### Result Commitment:
Upon successful execution, the new UTXO authorities, new UTXO Data and a Bitcoin transaction are committed back to the network.

[UTXO]: ../program/utxo.md
[program]: ../program/program.md
[`entrypoint!`]: #entrypoint
[handler function]: #handler-function
[instruction]: ../program/instruction.md
[`Result`]: https://doc.rust-lang.org/std/result/enum.Result.html
[lib.rs]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/app/program/src/lib.rs
[entrypoint.rs]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/program/src/entrypoint.rs
[`ProgramError`]: https://github.com/Arch-Network/arch-cli/blob/main/templates/sample/program/src/program_error.rs
