# 🚀 Quick Start Guide

Welcome to Arch Network! Let's get your first program running in under 15 minutes.

## 🎯 What You'll Build

```mermaid
graph LR
    A[Your Program] -->|Deploy| B[Local Validator]
    B -->|Execute| C[Arch Network]
    classDef default fill:#f8f9fa,stroke:#dee2e6,stroke-width:2px,rx:10px,ry:10px
    classDef program fill:#ff6b81,stroke:#ff4757,stroke-width:2px,rx:10px,ry:10px
    classDef validator fill:#2ed573,stroke:#26ae60,stroke-width:2px,rx:10px,ry:10px
    classDef network fill:#ffd700,stroke:#f4c430,stroke-width:2px,rx:10px,ry:10px
    class A program
    class B validator
    class C network
    linkStyle default stroke:#a4b0be,stroke-width:2px
```

## ⏱️ Time Estimate
- Total time: ~15 minutes
- Active time: ~10 minutes
- Waiting time: ~5 minutes (during installations)

## 📋 Quick Setup

### 1. Install CLI (2 minutes)

Download the appropriate binary for your system from the [latest releases page](https://github.com/Arch-Network/arch-node/releases/latest):

<div class="platform-select">
<div class="platform-option">
<h4>macOS - Apple Silicon (M1/M2/M3)</h4>

```bash
curl -L -o cli https://github.com/Arch-Network/arch-node/releases/latest/download/cli-aarch64-apple-darwin
chmod +x cli
sudo mv cli /usr/local/bin/
```
</div>

<div class="platform-option">
<h4>macOS - Intel</h4>

```bash
curl -L -o cli https://github.com/Arch-Network/arch-node/releases/latest/download/cli-x86_64-apple-darwin
chmod +x cli
sudo mv cli /usr/local/bin/
```
</div>

<div class="platform-option">
<h4>Linux - x86_64</h4>

```bash
curl -L -o cli https://github.com/Arch-Network/arch-node/releases/latest/download/cli-x86_64-unknown-linux-gnu
chmod +x cli
sudo mv cli /usr/local/bin/
```
</div>

<div class="platform-option">
<h4>Linux - ARM64</h4>

```bash
curl -L -o cli https://github.com/Arch-Network/arch-node/releases/latest/download/cli-aarch64-unknown-linux-gnu
chmod +x cli
sudo mv cli /usr/local/bin/
```
</div>
</div>

After installation, verify it works:
```bash
cli --version
```

### 2. Start Local Validator (1 minute)

Start the local validator:
```bash
# Start a local validator
cli validator-start \
    --network-mode localnet \
    --rpc-bind-port 9002 \
    --titan-rpc-endpoint titan-node.dev.aws.archnetwork.xyz \
    --titan-rpc-port 18443 \
    --titan-rpc-username bitcoin \
    --titan-rpc-password 428bae8f3c94f8c39c50757fc89c39bc7e6ebc70ebf8f618
```

### 3. Clone Example Project (2 minutes)
```bash
# Get the starter example
git clone https://github.com/Arch-Network/arch-examples
cd arch-examples/examples/helloworld
```

### 4. Build and Deploy (5 minutes)

<div class="platform-select">
<div class="platform-option">
<h4>First Time Setup</h4>

If this is your first time building Arch programs, install the required dependencies:

<details>
<summary>macOS Dependencies</summary>

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
```
</details>

<details>
<summary>Linux Dependencies</summary>

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Install build essentials
sudo apt-get update && sudo apt-get install -y build-essential
# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
```
</details>
</div>
</div>

Build and deploy the program:
```bash
# Build the program
cargo build-sbf

# Deploy to your local validator
cli deploy ./target/deploy/helloworld.so
```

## 🎮 Test Your Deployment

Once deployed, you can interact with your program:
```bash
# Show program information
cli show <PROGRAM_ADDRESS>

# Get block information
cli get-block <BLOCK_HASH>
```

## 🌐 Ready for Testnet?

When you're ready to deploy to testnet:
```bash
cli validator-start --network-mode testnet
cli deploy ./target/deploy/helloworld.so --network-mode testnet
```

## 📚 Next Steps

- [Modify the Hello World program](../guides/how-to-write-arch-program.md)
- [Create a fungible token](../guides/how-to-create-a-fungible-token.md)
- [Build a Runes swap application](../guides/how-to-build-runes-swap.md)
- [Set up a full validator node](bitcoin-and-electrs-setup.md)

## 🆘 Need Help?

- Join our [Discord](https://discord.gg/archnetwork) for real-time support
- Check the [Troubleshooting Guide](troubleshooting.md)
- Browse the [FAQ](faq.md)