# SDK Reference

The Arch Network SDK provides type definitions and utilities for building applications on the Arch Network. This section covers the core data structures and types you'll work with when developing programs or interacting with the network.

## Core Types

### [Runtime Transaction](runtime-transaction.md)
The fundamental transaction type that gets processed by the Arch Network runtime. Contains version information, signatures, and a message with instructions.

### [Processed Transaction](processed-transaction.md)
A wrapper around Runtime Transaction that includes execution status and associated Bitcoin transaction IDs. This is what you'll receive from RPC methods like `get_processed_transaction`.

### [Signature](signature.md)
Digital signature implementation used to authenticate transactions and instructions.

## SDK Libraries

For development, use the official SDK libraries:

- **TypeScript/JavaScript**: `@saturnbtcio/arch-sdk`
- **Rust**: `arch_sdk` crate

## Source Code

The complete SDK source code is available on [GitHub](https://github.com/Arch-Network/arch-sdk/tree/main/sdk/).
