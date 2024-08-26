# Entry points

We'll navigate to the [helloworld] [program] and explore the contents.

## `entrypoint!()`

Every Arch program includes a single entrypoint used to invoke the program.

The [dispatcher function](#dispatcher-function) is then used to process the data passed into the entrypoint.

```rust,ignore
entrypoint!(process_instruction);
```
[lib.rs]

#### Initialization and Data Reading:
The entrypoint begins by initializing and reading serialized data from the execution environment (`ExecutorEnv`), which includes everything needed for program execution. It then deserializes this data to obtain the [instruction], an object which contains all necessary details like the `program_id` and associated [UTXO] information.

#### Authority and Data Processing:
It retrieves authority information and associated data for each UTXO. These are crucial for determining permissions and understanding the context of each UTXO as it relates to the program's logic. The UTXOs are then managed by the program.

#### Business Logic Execution:
With all relevant data and mappings prepared, the program processes the instruction using a designated function; this could involve transactions, state updates, or other program-specific operations.

#### Result Commitment:
Upon successful execution, the new UTXO authorities, new UTXO Data and Bitcoin transaction are committed back to the network.

## Dispatcher function: 

Here we'll discuss Arch Network's dispatcher function: `process_instruction()`.

This dispatcher function requires the following parameters:

- `program_id` - Unique identifier of the currently executing program.
- `accounts` - Slice reference containing accounts needed to execute an instruction.
- `instruction_data` - Serialized data containing program instructions.

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

In the Arch Network's program architecture, the dispatcher function serves as the primary entrypoint for handling incoming instructions. 

This function is responsible for parsing and directing the execution flow based on the type of transaction or method specified. It's a critical component that developers must implement to ensure that their programs can appropriately respond to different operational requests.

The dispatcher function is defined as part of the program and is designated as the [entrypoint]. This macro binds the `process_instruction()` function to be the first receiver of any execution call made by the Arch Network's virtual machine, effectively making it the gatekeeper for all incoming instructions.

### Some responsibilities of the dispatcher:

#### Deserialize Input Data
The function starts by deserializing the input data (`instruction_data`) into a known format, typically a custom struct that represents different methods or commands the program can execute.

#### Method Dispatch
Based on the deserialized data, the function determines which specific method to execute. This is often handled through a match statement that routes to different functions or modules within the program.

#### Execute Business Logic
Each routed function performs specific business logic related to the program's purpose, such as managing assets, updating state, or interacting with other program or tokens.

[UTXO]: ../program/utxo.md
[program]: ../program/program.md
[entrypoint]: ./entrypoint.md
[instruction]: ../program/instruction.md
[helloworld]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/
[lib.rs]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/lib.rs

