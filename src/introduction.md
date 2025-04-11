# Welcome to Arch Network

<div class="info">
This documentation is actively maintained. If you find any issues or have suggestions for improvements, please visit our <a href="https://github.com/arch-network/docs">GitHub repository</a>.
</div>

<div style="float: right; margin: 0 0 20px 20px; max-width: 40%;">
    <img src="images/coders.png" alt="Developer coding" style="width: 100%; height: auto;">
</div>

## What is Arch Network?

Arch Network is a computation environment that enhances Bitcoin's capabilities by enabling complex operations on Bitcoin UTXOs through its specialized virtual machine. Unlike Layer 2 solutions, Arch Network provides a native computation layer that works directly with Bitcoin's security model.

## Choose Your Path 👋

<div class="path-selector">
    <div class="path-option">
        <h3>🚀 Deploy First</h3>
        <p>Get your first smart contract running on Arch Network as quickly as possible</p>
        <ul>
            <li>Download CLI and deploy a program in 15 minutes</li>
            <li>Use our pre-configured development environment</li>
            <li>Perfect for developers wanting to try Arch Network</li>
        </ul>
        <a href="getting-started/quick-start.md" class="button">Start Building →</a>
    </div>
</div>

### 🏗️ Run a Validator

Set up and run your own validator node on the Arch Network

* Set up Bitcoin Core and Titan
* Configure and run a validator node
* Perfect for those wanting to participate in network security

[Start Running →](getting-started/bitcoin-and-titan-setup.md)

<div class="network-selector">
    <h3>Network Options</h3>
    <div class="network-grid">
        <div class="network-option">
            <h4>🔧 Regtest</h4>
            <p>Local development environment with instant block confirmation. Perfect for development and testing.</p>
        </div>
        <div class="network-option">
            <h4>🧪 Testnet</h4>
            <p>Test network with real Bitcoin testnet integration. For testing in a live environment.</p>
        </div>
    </div>
</div>

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

## Prerequisites

<div class="prerequisites-box">
Before you begin, ensure you have:

- Node.js v19+ ([installation guide](getting-started/requirements.md))
- Rust (latest stable)
- Docker for local development
- Basic understanding of [Bitcoin UTXOs](program/utxo.md)
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

### 🛠 Reference Documentation

<div class="reference-grid">
Technical documentation:

- [API Reference](rpc/rpc.md)
  - [HTTP Methods](rpc/http-methods.md)
  - [Transaction Processing](sdk/processed-transaction.md)
- [Program Examples](guides/writing-your-first-program.md)
  - [Oracle Program](guides/how-to-write-oracle-program.md)
  - [Fungible Token](guides/how-to-create-a-fungible-token.md)
- [System Program](system-program/system-program.md)
  - [Account Creation](system-program/create-account.md)
  - [Program Deployment](system-program/make-executable.md)
</div>

## Need Help?

<div class="help-box">
<ul>
<li><a href="https://discord.gg/archnetwork">Join our Discord</a></li>
<li><a href="concepts/architecture.md">Read the Architecture Overview</a></li>
<li><a href="guides/writing-your-first-program.md">View Example Programs</a></li>
<li><a href="concepts/network-architecture.md#monitoring-and-telemetry">Check Network Status</a></li>
<li><a href="rpc/rpc.md">API Reference</a></li>
</ul>
</div>

<div class="tip">
💡 <strong>Pro Tip:</strong> Use the search function (press 's' or '/' on your keyboard) to quickly find what you're looking for in the documentation.
</div>
