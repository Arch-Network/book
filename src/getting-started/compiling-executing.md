# Compiling and executing

Now that all of the dependencies are installed and we have successfully started our stack of development nodes, we can finally compile our program and interact with it.

### Build
Access the `examples/helloworld/program` folder:
```bash
cd examples/helloworld/program
```
- Build the example program
```bash
cargo-build-sbf
```

This step will compile the example `helloworld` program into a [eBPF] ELF file (the executable format expected by the Arch VM).

You will find the generated shared object file at: `./target/deploy/helloworldprogram.so`

> ⚠️ **NOTE:** If you are a Linux user and do not already have `gcc-multilib` installed you will see an error like the below when trying to execute `cargo-build-sbf`.

```bash
cargo:warning=/usr/include/stdint.h:26:10: fatal error: 'bits/libc-header-start.h' file not found
  cargo:warning=   26 | #include <bits/libc-header-start.h>
  cargo:warning=      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~
  cargo:warning=1 error generated.
```

_If you are experiencing issues with this step, we recommend returning to review the [requirements] page or hopping in our [Discord dev-chat] channel for support._

### Test
Now that our program is successfully compiled, we can run the corresponding test which will submit execute the program and submit transactions to the network.

```bash
# return to the helloworld dir and run test
cd .. && cargo test -- --nocapture
```

**NOTE:** If the test succeeds, you should be presented with the following:

```bash
test tests::test_deploy_call ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 77.21s

   Doc-tests helloworld

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

**NOTE:** If you encounter an error like the following: `linking with cc failed`, you may need to update your `~/.cargo/config` to include the correct architecture of your machine:

```bash
[target.x86_64-apple-darwin]
rustflags = [
  "-C", "link-arg=-undefined",
  "-C", "link-arg=dynamic_lookup",
]

[target.aarch64-apple-darwin]
rustflags = [
  "-C", "link-arg=-undefined",
  "-C", "link-arg=dynamic_lookup",
]
```

[eBPF]: https://ebpf.io/
[requirements]: ./requirements.md
[Discord dev-chat]: https://discord.com/channels/1241112027963986001/1270921925991989268

