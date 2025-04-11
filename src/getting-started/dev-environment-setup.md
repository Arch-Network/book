# 🚄 Quick Development Environment Setup

This guide provides a streamlined setup process for experienced developers who want to get up and running quickly with Arch Network development.

## 📋 Prerequisites

- Git
- Rust (1.75.0 or later)
- Solana CLI (latest stable version)
- 10GB free disk space
- macOS or Linux

## 🚀 Installation

Download the latest CLI binary for your architecture from the [official releases page](https://github.com/Arch-Network/arch-node/releases/latest).

> Note: The Arch Network source repository is not yet publicly accessible. Binary releases are available for download from the public releases page.

For macOS:
- [cli-aarch64-apple-darwin](https://github.com/Arch-Network/arch-node/releases/latest/download/cli-aarch64-apple-darwin) (Apple Silicon)
- [cli-x86_64-apple-darwin](https://github.com/Arch-Network/arch-node/releases/latest/download/cli-x86_64-apple-darwin) (Intel)

For Linux:
- [cli-x86_64-unknown-linux-gnu](https://github.com/Arch-Network/arch-node/releases/latest/download/cli-x86_64-unknown-linux-gnu)

After downloading, make the binary executable and move it to your PATH:

```bash
# Example for macOS Apple Silicon (M1/M2/M3)
chmod +x ./cli-aarch64-apple-darwin
sudo mv ./cli-aarch64-apple-darwin /usr/local/bin/cli
```

> ⚠️ **Note**: Choose the appropriate binary for your system architecture. The current stable release is v0.3.2.

## 🔍 Verify Your Setup

```bash
# Check Bitcoin Core
bitcoin-cli -regtest getblockchaininfo

# Check Titan
curl http://localhost:3002/blocks/tip/height

# Check Arch Network CLI
cli --version
```

## 🎮 Quick Test

```bash
# Generate some test Bitcoin
ADDR=$(bitcoin-cli -regtest getnewaddress)
bitcoin-cli -regtest generatetoaddress 101 $ADDR

# Start the local validator
cli validator start
```

## 🔧 Manual Configuration

If you need to customize your setup, check the [detailed setup guide](bitcoin-and-titan-setup.md).

## 🆘 Troubleshooting

If you encounter issues:
1. Check the logs in `~/.bitcoin/debug.log`
2. Ensure all services are running:
   ```bash
   # Check Bitcoin Core
   bitcoin-cli -regtest getblockchaininfo
   
   # Check Titan
   curl http://localhost:3002/blocks/tip/height
   ```
3. Visit our [Discord](https://discord.gg/archnetwork) for help

## 📚 Next Steps

1. [Build Your First dApp](../guides/writing-your-first-program.md)
2. [Explore Example Projects](../guides/guides.md)
3. [Read the Architecture Overview](../concepts/architecture.md)
