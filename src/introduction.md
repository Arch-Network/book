# Welcome to Arch Network

<div class="info">
This documentation is actively maintained. If you find any issues or have suggestions for improvements, please visit our <a href="https://github.com/arch-network/docs">GitHub repository</a>.
</div>

## What is Arch Network?

Arch Network is a computation environment that enhances Bitcoin's capabilities by enabling complex operations on Bitcoin UTXOs through its specialized virtual machine. Unlike Layer 2 solutions, Arch Network provides a native computation layer that works directly with Bitcoin's security model.

### Key Features

<div class="feature-grid">
<div class="feature">
    <h4>Bitcoin-Native</h4>
    <p>Direct <a href="concepts/bitcoin-integration.md">integration with Bitcoin</a> through UTXO management</p>
</div>

<div class="feature">
    <h4>Computation Environment</h4>
    <p>Execute complex programs within the <a href="concepts/architecture.md">Arch VM</a></p>
</div>

<div class="feature">
    <h4>Program Development</h4>
    <p>Write <a href="program/program.md">programs in Rust</a> to interact with <a href="program/utxo.md">Bitcoin UTXOs</a></p>
</div>

<div class="feature">
    <h4>Security</h4>
    <p>Leverages Bitcoin's proven security guarantees through <a href="concepts/network-architecture.md#security-model">multi-signature validation</a></p>
</div>

<div class="feature">
    <h4>Developer Tools</h4>
    <p>Complete development environment with <a href="getting-started/environment-setup.md">CLI tools</a> and explorer</p>
</div>
</div>

## Choose Your Path 

### 🚀 Quick Start (15 minutes)

<div class="path-box">
Build your first Arch program:

1. [Set up your development environment](getting-started/environment-setup.md)
2. [Create and deploy a basic program](guides/how-to-write-arch-program.md)
3. [Interact with Bitcoin UTXOs](program/utxo.md)
</div>

### 🎓 Learning Path

<div class="path-box">
Master Arch development:

1. **Network Architecture** - Understand how nodes work together
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
</div>

### 🛠 Reference

<div class="reference-grid">
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
</div>

## Core Architecture

### How Arch Works

<div class="architecture-overview">
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
</div>

## Prerequisites

<div class="prerequisites-box">
Before you begin, ensure you have:

- Node.js v19+ ([installation guide](getting-started/requirements.md))
- Rust (latest stable)
- Docker for local development
- Basic understanding of [Bitcoin UTXOs](program/utxo.md)
</div>

## Next Steps

<div class="next-steps-grid">

- [Set Up Development Environment →](getting-started/environment-setup.md)
- [Create Your First Program →](guides/how-to-write-arch-program.md)
- [Configure Local Validator →](guides/how-to-configure-local-validator-bitcoin-testnet4.md)
- [Explore Example Projects →](https://github.com/Arch-Network/arch-examples)
</div>

## Need Help?

<div class="help-box">
- [Join our Discord](https://discord.gg/archnetwork)
- [Read the Architecture Overview](concepts/architecture.md)
- [View Example Programs](guides/how-to-write-arch-program.md)
- [Check Network Status](concepts/network-architecture.md#monitoring-and-telemetry)
- [API Reference](rpc/rpc.md)
</div>

<div class="tip">
💡 <strong>Pro Tip:</strong> Use the search function (press 's' or '/' on your keyboard) to quickly find what you're looking for in the documentation.
</div>
