# Contract interaction

Continuing with our example program: `helloworld`, we can find an implementation example of how to communicate with a smart contract starting on [line 21 of lib.rs](https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/src/lib.rs#L23-L106) within the `back_2_back()` test function.

```rust,ignore
#[test]
#[serial]
fn back_2_back() { /* ... */ }
```

This test initializes a new instance of RPC client, constructs a runtime transaction, and then includes this within the `send_transaction()` RPC call made to the Arch Network.

After that, the Arch Network will execute the program logic within the context of the [zkVM](../concepts/nodes.md#the-zkvm), validate and sign-off on the execution, then post the results back to the Bitcoin network.
