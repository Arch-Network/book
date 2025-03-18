# 🚄 Quick Development Environment Setup

This guide provides a streamlined setup process for experienced developers who want to get up and running quickly with Arch Network development.

## 📋 Prerequisites

- Git
- Rust (1.75.0 or later)
- 10GB free disk space
- macOS or Linux

## 🚀 One-Command Setup

```bash
# Download and run the setup script
curl -L https://raw.githubusercontent.com/arch-network/arch-cli/main/scripts/setup.sh | bash
```

> ⚠️ **Note**: Always review scripts before running them with sudo privileges!

The script will:
1. Install required dependencies
2. Set up Bitcoin Core
3. Configure Titan
4. Install the Arch CLI
5. Launch the local validator

## 🔍 Verify Your Setup

```bash
# Check Bitcoin Core
bitcoin-cli -regtest getblockchaininfo

# Check Titan
curl http://localhost:3030/blocks/tip/height

# Check Arch CLI
arch-cli --version
```

## 🎮 Quick Test

```bash
# Generate some test Bitcoin
ADDR=$(bitcoin-cli -regtest getnewaddress)
bitcoin-cli -regtest generatetoaddress 101 $ADDR

# Start the local validator
arch-cli validator-start
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
   curl http://localhost:3030/blocks/tip/height
   ```
3. Visit our [Discord](https://discord.gg/archnetwork) for help

## 📚 Next Steps

1. [Build Your First dApp](../guides/how-to-write-arch-program.md)
2. [Explore Example Projects](../guides/guides.md)
3. [Read the Architecture Overview](../concepts/architecture.md)
