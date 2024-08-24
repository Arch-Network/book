# Program interaction

Continuing with our example program: [helloworld], we find an implementation example of how to communicate with a [program] within the `test_deploy_call()` function.

```rust,ignore
#[test]
fn test_deploy_call() { 
...
}
```
[lib.rs]

This test initializes a new instance of RPC client, constructs, signs and sends 4 transactions, and then polls the network for the processed transaction results.

After that, the Arch Network [validator] nodes will execute the program logic within the context of the Arch VM, signing-off on the execution then passing the results to the [leader] who will ultimately submit signed Bitcoin transactions back to the Bitcoin network.

[leader]: ../concepts/nodes.md
[program]: ../program/program.md
[validator]: ../concepts/nodes.md
[helloworld]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld
[lib.rs]: https://github.com/Arch-Network/arch-local/blob/main/examples/helloworld/src/lib.rs

