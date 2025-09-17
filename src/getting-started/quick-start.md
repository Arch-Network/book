# 🚀 Quick Start Guide

Welcome to Arch Network! Let's get your first program running in under 15 minutes.

## Prerequisites

Before starting, ensure you have the following tools installed:

- **Git** (v2.0 or later)
- **Rust** (v1.84.1 or later) - [Install Rust](https://rustup.rs/)
- **Solana CLI** (v2.2.14 or later) - [Install Solana](https://docs.solana.com/cli/install-solana-cli-tools)
- **Arch Network CLI** - Download from [Arch Network Releases](https://github.com/Arch-Network/arch-node/releases/latest)
- **Docker** - Required for local development - [Install Docker](https://docs.docker.com/engine/install/)

> ⚠️ **Important**: Arch Network now requires Solana CLI 2.x. Please ensure you have version 2.2.14 or later installed.

Verify your installation:
```bash
git --version
rustc --version
solana --version  # Should show 2.2.14 or later
arch-cli --version
docker --version
```

> 💡 Note: If you encounter any issues during installation, join our [Discord](https://discord.gg/archnetwork) for support.

## 🚀 Quick Start Project

### 1. Clone Example Project
```bash
# Get the starter example
git clone https://github.com/Arch-Network/arch-examples
cd arch-examples/examples/helloworld
```

### 2. Start Local Development Environment

Choose one of the following network modes:

#### Option A: Local Development (Recommended)
**Prerequisites:**
- **Docker**: Required on all platforms
- **Docker Management** (optional but recommended):
  - **macOS**: [OrbStack](https://orbstack.dev/) (recommended) or [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - **Linux**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional GUI)

```bash
# Use the orchestrate command for full local devnet
arch-cli orchestrate start
```

This starts a complete local development environment with:
- Bitcoin Core (regtest mode)
- Titan indexer
- Local validator

**Advanced Options:**
```bash
# Use local source code for development
arch-cli orchestrate start --local "$(pwd)"

# Skip bitcoind and use remote Bitcoin RPC
arch-cli orchestrate start --no-bitcoind

# Force rebuild images
arch-cli orchestrate start --force-rebuild
```

#### Option B: Testnet (Remote Bitcoin + Local Arch)
For testnet development with remote Bitcoin node:

```bash
# 1. Create a configuration profile
arch-cli config create-profile testnet \
    --bitcoin-node-endpoint http://bitcoin-rpc.test.arch.network:80 \
    --bitcoin-node-username bitcoin \
    --bitcoin-node-password 0F_Ed53o4kR7nxh3xNaSQx-2M3TY16L55mz5y9fjdrk \
    --bitcoin-network testnet \
    --arch-node-url http://localhost:9002

# 2. Start local Arch environment (no local bitcoind)
arch-cli --profile testnet orchestrate start --local "$(pwd)" --no-bitcoind
```

#### Option C: Devnet (Full Local Stack)
For devnet, you'll need to run your own Bitcoin regtest node and Titan indexer:

```bash
# 1. Start Bitcoin Core in regtest mode
bitcoind -regtest -port=18444 -rpcport=18443 \
    -rpcuser=bitcoin -rpcpassword=bitcoinpass \
    -fallbackfee=0.001

# 2. First-time setup (only needed once)
# Create a wallet called "testwallet"
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoinpass createwallet testwallet

# Generate an address and mine the first 100 blocks to it
ADDRESS=$(bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoinpass getnewaddress)
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoinpass generatetoaddress 100 $ADDRESS

# 3. Clone and build Titan indexer (if not already done)
git clone https://github.com/saturnbtc/Titan.git
cd Titan
cargo build --release
cd ..

# 4. Start Titan indexer
./Titan/target/release/titan \
    --network regtest \
    --bitcoin-rpc-url http://bitcoin:bitcoinpass@127.0.0.1:18443 \
    --http-addr 127.0.0.1:8080 \
    --tcp-addr 127.0.0.1:3030

# 5. Start local validator
arch-cli orchestrate validator-start
```

### 3. Verify Your Environment

Check that all services are running:

```bash
# Check orchestrated services status
arch-cli orchestrate validator-status

# Check network connectivity
arch-cli get-block-height

# Check Bitcoin integration
arch-cli orchestrate mine-blocks --num-blocks 1
```

### 4. Build and Deploy Your Program

```bash
# Build the example program
cargo build-bpf

# Deploy to your local network
arch-cli deploy target/deploy/
```

### 5. Test Your Program

```bash
# Check the deployed program
arch-cli show <PROGRAM_ID>

# Run the program (if it has a client)
cargo run
```

## 🎯 Next Steps

- **Learn More**: Check out our [Program Development Guide](guides/writing-your-first-program.md)
- **Token Development**: Explore [APL Token Creation](guides/how-to-create-a-fungible-token.md)
- **Examples**: Browse more examples in the [examples directory](https://github.com/Arch-Network/arch-examples)
- **Community**: Join our [Discord](https://discord.gg/archnetwork) for support and updates

## 🔧 Troubleshooting

### Common Issues

**Docker not running:**
```bash
# Check Docker status
docker ps

# Start Docker if needed
# macOS: Open Docker Desktop or OrbStack
# Linux: sudo systemctl start docker
```

**Port conflicts:**
```bash
# Check if ports are in use
netstat -an | grep 9002
netstat -an | grep 18443

# Stop conflicting services or use different ports
```

**Build failures:**
```bash
# Clean and rebuild
cargo clean
cargo build-bpf

# Check Rust version
rustc --version  # Should be 1.84.1+
```

**Validator won't start:**
```bash
# Reset environment
arch-cli orchestrate reset

# Check logs
arch-cli orchestrate validator-status
```

### Getting Help

- **Discord**: [https://discord.gg/archnetwork](https://discord.gg/archnetwork)
- **GitHub Issues**: [https://github.com/Arch-Network/arch-node/issues](https://github.com/Arch-Network/arch-node/issues)
- **Documentation**: [https://docs.arch.network](https://docs.arch.network)

---

**Congratulations!** You've successfully set up your Arch Network development environment. You're now ready to build and deploy programs on the most Bitcoin-native smart contract platform.