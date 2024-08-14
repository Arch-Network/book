# Compiling and executing helloworld

Now that all of the dependencies are installed and we have successfully started our stack of development nodes, we can finally compile our contract and interact with it.

### Build
Access the `examples/helloworld` folder and build the program.

This step will compile the example `helloworld` program into a RISC-V ELF file (the executable format expected by the zkVM).

You will find the generated file at: `./target/helloworld.elf`

```bash
cd examples/helloworld
cargo build
```

### Test
Now that our program is successfully compiled, we can rust the corresponding test which will submit an Arch Network transaction, executing the `helloworld` program. 

```bash
cargo test -- --nocapture
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

If everything executes successfully, you should be presented with results resembling the following:
```bash
test tests::back_2_back ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 38.62s
```
