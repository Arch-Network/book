# Architecture Overview

## Core Components

### Arch VM
The Arch Virtual Machine (VM) is built on eBPF technology, providing a secure and efficient environment for executing programs. The VM:
- Manages program execution
- Handles state transitions
- Ensures deterministic computation
- Provides syscalls for Bitcoin UTXO operations

### Bitcoin Integration
Arch Network interacts directly with Bitcoin through:
- Native UTXO management
- Transaction validation
- Multi-signature coordination
- State commitment to Bitcoin

### Validator Network
The validator network consists of multiple node types that work together:

1. **Leader Node**
- Coordinates transaction signing
- Submits signed transactions to Bitcoin
- Manages validator communication

2. **Validator Nodes**
- Execute programs in the Arch VM
- Validate transactions
- Participate in multi-signature operations
- Maintain network state

3. **Bootnode**
- Handles initial network discovery
- Similar to Bitcoin DNS seeds
- Helps new nodes join the network

## Transaction Flow
1. Client submits transaction to network
2. Leader distributes to validators
3. Validators execute in Arch VM
4. Results are validated and signed
5. Leader submits to Bitcoin network

## Security Model
Arch Network's security is derived directly from Bitcoin through:
- Multi-signature threshold schemes
- UTXO-based state management
- Bitcoin transaction finality
- Validator consensus requirements

<!-- Internal -->
[nodes]: nodes.md
[program]: ../program/program.md
[utxo]: ../program/utxo.md

<!-- External -->
[eBPF]: https://ebpf.io/
