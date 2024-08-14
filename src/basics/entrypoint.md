# Entry points

We'll navigate to the [`main.rs`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs) and explore the contents.

## `entrypoint!()`

On [line 9 of `main.rs`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs#L9), we see a Rust macro called `entrypoint!()` which takes the argument `handler`, a [dispatcher function](#dispatcher-handler) which is explained further below.

```rust
#[cfg(target_os = "zkvm")]
entrypoint!(handler);
```

But where did it come from?

```rust
use sdk::{entrypoint, Pubkey, UtxoInfo};
```

We import it on [line 6](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs#L6) from a library called `sdk` which gets imported from a local resource location denoted by the relative path within the [`Cargo.toml`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/Cargo.toml#L16) of our `helloworld` directory. 

```toml
sdk = { path = "../../../sdk" }
```

Now that we know where it came from, let's walk through what's going on.

#### Initialization and Data Reading:
The entrypoint begins by initializing and reading serialized data from the execution environment (`ExecutorEnv`), which includes everything needed for contract execution. It then deserializes this data to obtain the `Instruction`, an object which contains all necessary details like the program ID and associated UTXO information.

#### Authority and Data Processing:
It retrieves authority information and associated data for each UTXO. These are crucial for determining permissions and understanding the context of each UTXO as it relates to the smart contract's logic.

#### Business Logic Execution:
With all relevant data and mappings prepared, the smart contract processes the instruction using a designated function. This could involve transactions, state updates, or other contract-specific operations.

#### Result Commitment:
Upon successful execution, the new UTXO authorities, new UTXO Data and Bitcoin transaction are committed back to the network.

## Dispatcher: `handler()`: 

Here we'll discuss Arch Network's dispatcher function: `handler()` as defined in [`main.rs`](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/program/src/main.rs#L12-L28).

```rust
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

This function, typically named `handler()`, is responsible for parsing and directing the execution flow based on the type of transaction or method specified. It's a critical component that developers must implement to ensure that their smart contract can appropriately respond to different operational requests.

The dispatcher function is defined as part of the smart contract and is designated as the entrypoint by the [entrypoint!](#entrypoint) macro. This macro binds the `handler()` function to be the first receiver of any execution call made by the Arch Network's virtual machine, effectively making it the gatekeeper for all incoming instructions.

### Some responsibilities of the dispatcher:

#### Deserialize Input Data
The function starts by deserializing the input data (instruction_data) into a known format, typically a custom struct that represents different methods or commands the contract can execute.

#### Method Dispatch
Based on the deserialized data, the function determines which specific method to execute. This is often handled through a match statement that routes to different functions or modules within the contract.

#### Execute Business Logic
Each routed function performs specific business logic related to the contract's purpose, such as managing assets, updating state, or interacting with other contracts or tokens.

