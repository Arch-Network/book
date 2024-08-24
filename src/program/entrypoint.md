# Entrypoint

Every Arch program includes a single entrypoint used to invoke the program. The `$process_instruction` then handles the data passed into the entrypoint.

```rust,ignore
entrypoint!(process_instruction);
```

```rust,ignore
#[macro_export]
macro_rules! entrypoint {
    ($process_instruction:ident) => {
        /// # Safety
        #[no_mangle]
        pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64 {
            use std::collections::HashMap;
            let (program_id, utxos, instruction_data) =
                unsafe { $crate::entrypoint::deserialize(input) };
            match $process_instruction(&program_id, &utxos, &instruction_data) {
                Ok(()) => {
                    return 0;
                }
                Err(e) => {
                    $crate::msg!("program return an error {:?}", e);
                    return 1;
                }
            }
        }
        $crate::custom_heap_default!();
        $crate::custom_panic_default!();
    };
}
```
[entrypoint.rs]

[entrypoint.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/entrypoint.rs

