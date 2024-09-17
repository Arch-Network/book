# Syscalls

A syscall is a function that can be used to obtain information from the underlying virtual machine.

```rust,ignore
// Used for cross-program invocation (CPI)

// Invokes a cross-program call
define_syscall!(fn sol_invoke_signed_rust(instruction_addr: *const u8, account_infos_addr: *const u8, account_infos_len: u64) -> u64);

// Sets the data to be returned for the cross-program invocation
define_syscall!(fn sol_set_return_data(data: *const u8, length: u64));

// Returns the cross-program invocation data
define_syscall!(fn sol_get_return_data(data: *mut u8, length: u64, program_id: *mut Pubkey) -> u64);

// Arch

// Validates and sets up transaction for being signed
define_syscall!(fn arch_set_transaction_to_sign(transaction_to_sign: *const TransactionToSign));

// Retrieves raw Bitcoin transaction from RPC and copies into memory buffer
define_syscall!(fn arch_get_bitcoin_tx(data: *mut u8, length: u64, txid: &[u8; 32]) -> u64);

// Retrieves the multi-sig public key and copies into memory buffer
define_syscall!(fn arch_get_network_xonly_pubkey(data: *mut u8) -> u64);

// Validates ownership of a Bitcoin UTXO against a public key
define_syscall!(fn arch_validate_utxo_ownership(utxo: *const UtxoMeta, owner: *const Pubkey) -> u64);

// Generates a Bitcoin script public key and copies into memory buffer
define_syscall!(fn arch_get_account_script_pubkey(script: *mut u8, pubkey: *const Pubkey) -> u64);

// logs

// Prints the hexidecimal representation of a string slice to stdout
define_syscall!(fn sol_log_(message: *const u8, len: u64));

// Prints 64-bit values represented as hexadecimal to stdout
define_syscall!(fn sol_log_64_(arg1: u64, arg2: u64, arg3: u64, arg4: u64, arg5: u64));

// Prints the hexidecimal representation of a public key to stdout
define_syscall!(fn sol_log_pubkey(pubkey_addr: *const u8));

// Prints the base64 representation of a data array to stdout
define_syscall!(fn sol_log_data(data: *const u8, data_len: u64));
```
[syscalls/definition.rs]

[syscalls/definition.rs]: https://github.com/Arch-Network/arch-local/blob/main/program/src/syscalls/definitions.rs

