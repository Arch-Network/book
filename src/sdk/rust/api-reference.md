# Rust SDK API Reference

This page provides a comprehensive API reference for the native Arch Network Rust SDK.

> **Note**: For the most complete and up-to-date API documentation, please visit [docs.rs/arch_sdk](https://docs.rs/arch_sdk).

## Core Modules

### Connection
The main struct for interacting with an Arch Network node.

### Keypair
Manages Ed25519 keypairs for transaction signing.

### Transaction
Builds and signs transactions for the network.

### Account
Represents account data on the network.

### Instruction
Defines instructions for programs.

## Key Traits

### Signer
Trait for types that can sign transactions.

### Serialize/Deserialize
Borsh serialization support for on-chain data.

## Error Types

### ArchError
Main error type for SDK operations.

### ProgramError
Errors returned by on-chain programs.

## Complete API Documentation

For complete API documentation, please refer to:
- [docs.rs Documentation](https://docs.rs/arch_sdk)
- [Crates.io Package](https://crates.io/crates/arch_sdk)
- [Source Code](https://github.com/arch-network/arch-network/tree/main/sdk) 