# Entry points

We'll navigate to the [`main.rs`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs) and explore the contents.

## `entrypoint!()`

Every Arch program includes a single entrypoint used to invoke the program. The [dispatcher function](#dispatcher-function) is then used to process the data passed into the entrypoint.

```rust,ignore
#[cfg(target_os = "zkvm")]
entrypoint!(handler);
```

#### Initialization and Data Reading:
The entrypoint begins by initializing and reading serialized data from the execution environment (`ExecutorEnv`), which includes everything needed for contract execution. It then deserializes this data to obtain the `Instruction`, an object which contains all necessary details like the program ID and associated UTXO information.

#### Authority and Data Processing:
It retrieves authority information and associated data for each UTXO. These are crucial for determining permissions and understanding the context of each UTXO as it relates to the smart contract's logic. The UTXOs are then managed by the program.

#### Business Logic Execution:
With all relevant data and mappings prepared, the program processes the instruction using a designated function; this could involve transactions, state updates, or other program-specific operations.

#### Result Commitment:
Upon successful execution, the new UTXO authorities, new UTXO Data and Bitcoin transaction are committed back to the network.

## Dispatcher function: 

Here we'll discuss Arch Network's dispatcher function as defined in [`main.rs`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs#L12-L28).

This dispatcher function requires the following parameters:

- program_id - Unique identifier of the currently executing program.
- utxos - Slice reference of [UtxoInfo]() needed to execute an instruction.
- instruction_data - Serialized data containing program instructions.

```rust,ignore
#[cfg(target_os = "zkvm")]
fn handler(
    program_id: &Pubkey, 
    utxos: &[UtxoInfo], 
    instruction_data: &[u8],
) -> Result<Vec<u8>> { 
    ...
}
```

In the Arch Network's smart contract architecture, the dispatcher function serves as the primary entrypoint for handling incoming instructions. 

This function is responsible for parsing and directing the execution flow based on the type of transaction or method specified. It's a critical component that developers must implement to ensure that their smart contract can appropriately respond to different operational requests.

The dispatcher function is defined as part of the smart contract and is designated as the entrypoint by the [entrypoint!](#entrypoint) macro. This macro binds the `handler()` function to be the first receiver of any execution call made by the Arch Network's virtual machine, effectively making it the gatekeeper for all incoming instructions.

### Some responsibilities of the dispatcher:

#### Deserialize Input Data
The function starts by deserializing the input data (instruction_data) into a known format, typically a custom struct that represents different methods or commands the contract can execute.

#### Method Dispatch
Based on the deserialized data, the function determines which specific method to execute. This is often handled through a match statement that routes to different functions or modules within the contract.

#### Execute Business Logic
Each routed function performs specific business logic related to the contract's purpose, such as managing assets, updating state, or interacting with other contracts or tokens.

