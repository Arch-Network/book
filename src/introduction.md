# Welcome to Arch Network

## What is Arch Network?
Arch Network is a computation environment that enhances Bitcoin's capabilities by enabling complex operations on Bitcoin UTXOs through its specialized virtual machine. Unlike Layer 2 solutions, Arch Network provides a native computation layer that works directly with Bitcoin's security model.

### Key Features
- **Bitcoin-Native**: Direct [integration with Bitcoin](concepts/bitcoin-integration.md) through UTXO management
- **Computation Environment**: Execute complex programs within the [Arch VM](concepts/architecture.md)
- **Program Development**: Write [programs in Rust](program/program.md) to interact with [Bitcoin UTXOs](program/utxo.md)
- **Security**: Leverages Bitcoin's proven security guarantees through [multi-signature validation](concepts/network-architecture.md#security-model)
- **Developer Tools**: Complete development environment with [CLI tools](getting-started/environment-setup.md) and explorer

## Choose Your Path 

### 🚀 Quick Start (15 minutes)
Build your first Arch program:
1. [Set up your development environment](getting-started/environment-setup.md)
2. [Create and deploy a basic program](guides/how-to-write-arch-program.md)
3. [Interact with Bitcoin UTXOs](program/utxo.md)

### 🎓 Learning Path
Master Arch development:
1. [Network Architecture](concepts/network-architecture.md) - Understand how nodes work together
   - [Node Types](concepts/network-architecture.md#node-types)
   - [Network Communication](concepts/network-architecture.md#network-communication)
   - [Security Model](concepts/network-architecture.md#security-model)

2. [Bitcoin Integration](concepts/bitcoin-integration.md) - Learn Bitcoin interaction
   - [UTXO Management](concepts/bitcoin-integration.md#1-utxo-management)
   - [RPC Integration](concepts/bitcoin-integration.md#2-bitcoin-rpc-integration)
   - [Transaction Flow](concepts/bitcoin-integration.md#transaction-flow)

3. [Program Development](program/program.md) - Write programs
   - [Account Management](program/accounts.md)
   - [Instructions](program/instructions-and-messages.md)
   - [System Calls](program/syscall.md)

### 🛠 Reference
Technical documentation:
- [API Reference](rpc/rpc.md)
  - [HTTP Methods](rpc/http-methods.md)
  - [Transaction Processing](sdk/processed-transaction.md)
- [Program Examples](guides/how-to-write-arch-program.md)
  - [Oracle Program](guides/how-to-write-oracle-program.md)
  - [Fungible Token](guides/how-to-create-a-fungible-token.md)
- [System Program](system-program/system-program.md)
  - [Account Creation](system-program/create-account.md)
  - [Program Deployment](system-program/make-executable.md)

## Core Architecture

### How Arch Works
Arch Network consists of three main components:

1. **Network Layer**
   - [Network Architecture](concepts/network-architecture.md)
     - [Bootnode](concepts/network-architecture.md#1-bootnode): Network discovery and peer management
     - [Leader Node](concepts/network-architecture.md#2-leader-node): Transaction coordination
     - [Validator Nodes](concepts/network-architecture.md#3-validator-nodes): Program execution

2. **Bitcoin Integration**
   - [UTXO Management](concepts/bitcoin-integration.md#1-utxo-management)
     - Transaction tracking
     - State anchoring
     - Ownership validation
   - [RPC Integration](concepts/bitcoin-integration.md#2-bitcoin-rpc-integration)
     - Bitcoin node communication
     - Transaction submission
     - Network synchronization

3. **Computation Layer**
   - [Programs](program/program.md)
     - [Instructions](program/instructions-and-messages.md)
     - [Accounts](program/accounts.md)
     - [System Calls](program/syscall.md)
   - [Transaction Processing](sdk/processed-transaction.md)
     - Message validation
     - State updates
     - UTXO management

## Prerequisites
Before you begin, ensure you have:

- Node.js v19+ ([installation guide](getting-started/requirements.md))
- Rust (latest stable)
- Docker for local development
- Basic understanding of [Bitcoin UTXOs](program/utxo.md)

## Next Steps
1. [Set Up Development Environment →](getting-started/environment-setup.md)
2. [Create Your First Program →](guides/how-to-write-arch-program.md)
3. [Configure Local Validator →](guides/how-to-configure-local-validator-bitcoin-testnet4.md)
4. [Explore Example Projects →](https://github.com/Arch-Network/arch-examples)

## Need Help?
- [Join our Discord](https://discord.gg/archnetwork)
- [Read the Architecture Overview](concepts/architecture.md)
- [View Example Programs](guides/how-to-write-arch-program.md)
- [Check Network Status](concepts/network-architecture.md#monitoring-and-telemetry)
- [API Reference](rpc/rpc.md)
