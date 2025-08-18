# 🚀 Quick Start Guide

Welcome to Arch Network! Let's get your first program running in under 15 minutes.

## Prerequisites

Before starting, ensure you have the following tools installed:

- **Git** (v2.0 or later)
- **Rust** (v1.84.1 or later) - [Install Rust](https://rustup.rs/)
- **Solana CLI** (v2.2.14 or later) - [Install Solana](https://docs.solana.com/cli/install-solana-cli-tools)
- **Arch Network CLI** - Download from [Arch Network Releases](https://github.com/Arch-Network/arch-node/releases/latest)

> ⚠️ **Important**: Arch Network now requires Solana CLI 2.x. Please ensure you have version 2.2.14 or later installed.

Verify your installation:
```bash
git --version
rustc --version
solana --version  # Should show 2.2.14 or later
arch-cli --version
```

> 💡 Note: If you encounter any issues during installation, join our [Discord](https://discord.gg/archnetwork) for support.

## 🚀 Quick Start Project

### 1. Clone Example Project
```bash
# Get the starter example
git clone https://github.com/Arch-Network/arch-examples
cd arch-examples/examples/helloworld
```

### 2. Start Local Validator 

Choose one of the following network modes:

#### Option A: Testnet (Recommended for Testing)
```bash
arch-cli validator-start \
    --network-mode testnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint https://titan-public-http.test.arch.network \
    --titan-socket-endpoint titan-public-tcp.test.arch.network:3030
```

#### Option B: Local Development (Regtest) - Recommended
**Prerequisites:**
- **Docker**: Required on all platforms - [Install Docker](https://docs.docker.com/engine/install/)
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

# Customize Titan image
arch-cli orchestrate start --titan-image ghcr.io/arch-network/titan:latest

# Force rebuild images
arch-cli orchestrate start --force-rebuild --rebuild-titan

# Skip bitcoind and use profile's Bitcoin RPC
arch-cli orchestrate start --no-bitcoind
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

# 4. Start Titan indexer pointing to your Bitcoin node
cargo run --bin titan -- \
    --bitcoin-rpc-url http://127.0.0.1:18443 \
    --bitcoin-rpc-username bitcoin \
    --bitcoin-rpc-password bitcoinpass \
    --chain regtest \
    --index-addresses \
    --index-bitcoin-transactions \
    --enable-tcp-subscriptions \
    --main-loop-interval 0 \
    --http-listen 127.0.0.1:3030

# 5. Start validator pointing to your local Titan (in a new terminal)
arch-cli validator-start \
    --network-mode devnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint http://127.0.0.1:3030 \
    --titan-socket-endpoint 127.0.0.1:3030
```

> 💡 **Note**: This option requires you to build and run Bitcoin Core and Titan yourself. For easier local development, use Option B (orchestrate start) instead.

> ⚠️ **First-time setup**: The wallet creation and block generation steps are only needed the first time you start bitcoind in regtest mode.

### 3. Create and Fund Account

Create a new account with the faucet:
```bash
# Create account and fund with 1 ARCH (1 billion lamports)
arch-cli account create --keypair-path ./my-account.json --airdrop

# Or create account first, then fund separately
arch-cli account create --keypair-path ./my-account.json
arch-cli account airdrop --keypair-path ./my-account.json --amount 1000000000

# Alternative: Fund by public key
arch-cli account airdrop --pubkey <PUBLIC_KEY> --amount 1000000000
```

### 4. Build and Deploy Your Program

```bash
# Navigate to the program directory
cd program

# Build the program using Solana's BPF compiler
cargo build-sbf

# Deploy to the validator
arch-cli deploy ./target/deploy/<program_name>.so --generate-if-missing --fund-authority

# Note: Save your program ID for later use
export PROGRAM_ID=<DEPLOYED_PROGRAM_ADDRESS>
```

### 5. Test Your Deployment

```bash
# Verify program deployment
arch-cli show $PROGRAM_ID

# Check transaction status
arch-cli tx confirm <TX_ID>

# Get current block height
arch-cli get-block-height

# Get latest block information
arch-cli get-block <BLOCK_HASH>
```

## 🔧 Available CLI Commands

### Global Options
```bash
# Specify network mode
arch-cli --network-mode devnet|testnet|mainnet

# Use configuration profile
arch-cli --profile <PROFILE_NAME>
```

### Validator Management
```bash
# Start local validator
arch-cli validator-start [OPTIONS]

# Orchestrate full local devnet
arch-cli orchestrate start     # Start bitcoind + titan + validator
arch-cli orchestrate stop      # Stop all services
arch-cli orchestrate reset     # Reset entire environment

# Fine-grained control
arch-cli orchestrate validator-start    # Start only validator
arch-cli orchestrate validator-stop     # Stop only validator
arch-cli orchestrate validator-restart  # Restart only validator
arch-cli orchestrate validator-status   # Check validator status
arch-cli orchestrate validator-reset    # Reset only validator

# Bitcoin mining (regtest)
arch-cli orchestrate mine-blocks --num-blocks 10
```

### Configuration Profiles
```bash
# Create configuration profile
arch-cli config create-profile <NAME> \
    --bitcoin-node-endpoint <URL> \
    --bitcoin-node-username <USER> \
    --bitcoin-node-password <PASS> \
    --bitcoin-network <mainnet|testnet|regtest> \
    --arch-node-url <URL>

# List profiles
arch-cli config list-profiles

# Update profile
arch-cli config update-profile <NAME> [OPTIONS]

# Delete profile
arch-cli config delete-profile <NAME>

# Set default profile
arch-cli config set-default-profile <NAME>
```

### Account Operations
```bash
# Create new account
arch-cli account create --keypair-path <PATH> [--airdrop]

# Fund existing account
arch-cli account airdrop --keypair-path <PATH> --amount <LAMPORTS>
arch-cli account airdrop --pubkey <PUBKEY> --amount <LAMPORTS>

# Change account owner
arch-cli account change-owner <ACCOUNT> <NEW_OWNER> <PAYER_KEYPAIR>

# Assign UTXO to account
arch-cli account assign-utxo <ACCOUNT_PUBKEY>
```

### Program Deployment
```bash
# Deploy program
arch-cli deploy <ELF_PATH> [--generate-if-missing] [--fund-authority]

# Show account/program info
arch-cli show <ADDRESS>
```

### Transaction Operations
```bash
# Confirm transaction status
arch-cli tx confirm <TX_ID>

# Get transaction details
arch-cli tx get <TX_ID>

# View program logs from transaction
arch-cli tx log-program-messages <TX_ID>
```

### Block and Network Info
```bash
# Get block by hash
arch-cli get-block <BLOCK_HASH>

# Get current block height
arch-cli get-block-height

# Get group key
arch-cli get-group-key <PUBKEY>
```

### APL Token Operations
```bash
# Token mint management
arch-cli token create-mint --decimals <DECIMALS> --mint-authority <PATH> --keypair-path <PATH>
arch-cli token show-mint <MINT_ADDRESS>

# Token account management
arch-cli token create-account --mint <MINT> --owner <PATH> --keypair-path <PATH>
arch-cli token show-account <ACCOUNT_ADDRESS>

# Token operations
arch-cli token mint <MINT_ADDRESS> <AMOUNT> --authority <PATH> --keypair-path <PATH>
arch-cli token transfer <SOURCE> <DESTINATION> <AMOUNT> --owner <PATH> --keypair-path <PATH>
arch-cli token burn <ACCOUNT> <AMOUNT> --owner <PATH> --keypair-path <PATH>

# Advanced features
arch-cli token create-multisig <M> --signers <PATHS> --keypair-path <PATH>
arch-cli token multisig-sign <MULTISIG> <TRANSACTION> --keypair-path <PATH>
arch-cli token multisig-execute <MULTISIG> <TRANSACTION> --signers <PATHS> --keypair-path <PATH>

# Utility commands
arch-cli token balance <ACCOUNT>
arch-cli token supply <MINT>
arch-cli token amount-to-ui <MINT> <AMOUNT>
arch-cli token ui-to-amount <MINT> <UI_AMOUNT>
```

## 🌐 Network Modes

| Network Mode | Description | Use Case |
|--------------|-------------|----------|
| `devnet` | Development network (default) | Development and integration testing |
| `testnet` | Test network with Bitcoin testnet | Pre-production testing |
| `mainnet` | Main production network | Production use (use with caution) |

## ⚙️ Validator Configuration

### Key Parameters
```bash
# Basic configuration
--data-dir ./.arch_data                    # Data directory
--network-mode devnet                      # Network mode
--rpc-bind-ip 127.0.0.1                   # RPC bind IP
--rpc-bind-port 9002                      # RPC port

# Titan integration (for testnet/mainnet)
--titan-endpoint <URL>                     # Titan HTTP endpoint
--titan-socket-endpoint <HOST:PORT>        # Titan TCP endpoint

# Performance tuning
--max-tx-pool-size 10000                  # Transaction pool size
--full-snapshot-reccurence 100            # Snapshot frequency
--max-snapshots 5                         # Max snapshots to keep

# Security
--private-key-password <PASSWORD>         # Key encryption password
```

### Environment Variables
You can also use environment variables instead of command-line flags:
```bash
export ARCH_NETWORK_MODE=devnet
export ARCH_RPC_BIND_PORT=9002
export ARCH_DATA_DIR=./.arch_data
export ARCH_TITAN_ENDPOINT=https://titan-public-http.test.arch.network
export ARCH_PROFILE=my-profile
```

## 🎮 Next Steps

Congratulations! You've successfully deployed your first program. Here's what you can explore next:

### Development
- **[Program Development Guide](../guides/understanding-arch-programs.md)** - Learn about program architecture
- **[Writing Your First Program](../guides/writing-your-first-program.md)** - Detailed program development
- **[Testing Guide](../guides/testing-guide.md)** - Testing strategies and tools

### Examples
- **[Fungible Token](../guides/how-to-create-a-fungible-token.md)** - Create your own token
- **[Oracle Program](../guides/how-to-write-oracle-program.md)** - Build price oracles
- **[Runes Swap](../guides/how-to-build-runes-swap.md)** - Create a DEX for Bitcoin Runes

### Production
- **[Validator Setup](bitcoin-and-titan-setup.md)** - Run a production validator
- **[Network Configuration](../concepts/network-architecture.md)** - Understanding network topology
- **[Security Best Practices](../concepts/bitcoin-integration.md#security-model)** - Production security

## 🆘 Need Help?

- **[Discord Community](https://discord.gg/archnetwork)** - Real-time support and discussion
- **[Troubleshooting Guide](../reference/troubleshooting.md)** - Common issues and solutions
- **[FAQ](faq.md)** - Frequently asked questions
- **[API Reference](../rpc/rpc.md)** - Complete RPC documentation

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 100 Mbps

### Recommended for Production
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 500GB+ NVMe SSD
- **Network**: 1 Gbps

## 🔍 Common Commands Quick Reference

```bash
# Full local development setup
arch-cli orchestrate start

# Deploy and test a program
arch-cli deploy ./target/deploy/program.so --generate-if-missing
arch-cli show <PROGRAM_ADDRESS>
arch-cli tx confirm <TX_ID>

# Account management
arch-cli account create --keypair-path ./account.json --airdrop
arch-cli show <ACCOUNT_ADDRESS>

# Network information
arch-cli get-block-height
arch-cli get-block <BLOCK_HASH>

# Stop local environment
arch-cli orchestrate stop

# Token operations
arch-cli token create-mint --decimals 6 --mint-authority ./authority.json --keypair-path ./payer.json
arch-cli token mint <MINT> 1000000 --authority ./authority.json --keypair-path ./payer.json
```