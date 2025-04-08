# System Requirements

Welcome to the Arch Network development guide. This page contains all the requirements and setup instructions needed to start developing with Arch Network.

## System Requirements

### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4+ cores | 8+ cores |
| RAM | 16GB | 32GB |
| Storage | 100GB SSD | 500GB+ SSD |
| Network | 100Mbps | 1Gbps+ |

### Software Requirements
| Requirement | Minimum Version | Description |
|------------|----------------|-------------|
| Operating System | Ubuntu 20.04+ / macOS 12.0+ | Latest LTS recommended |
| Git | Latest | Version control |
| Rust | Latest stable | Core development language |
| Solana CLI | v1.18.18 | Program compilation tools |
| Arch Network CLI | Latest | Development toolkit |

## Installation Guide

### 1. Install Rust
```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env  # Add Rust to your current shell session

# Verify installation
rustc --version
cargo --version
```

### 2. Install Build Tools

#### macOS
```bash
xcode-select --install  # Install Command Line Tools
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y build-essential gcc-multilib jq
```

### 3. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"

# Verify installation
solana --version
```

### 4. Install Arch Network CLI

<div class="platform-select">
<div class="platform-option">
<h4>macOS - Apple Silicon</h4>

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

Verify installation:
```bash
cli --version
```

## Troubleshooting

### Solana Installation Issues

If you installed Rust through Homebrew and encounter `cargo-build-sbf` issues:

1. Remove existing Rust installation:
```bash
rustup self uninstall
```

2. Perform clean Rust installation:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

3. Reinstall Solana:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
```

## Need Help?

- Check our [Troubleshooting Guide](troubleshooting.md)
- Join our [Discord dev-chat](https://discord.com/channels/1241112027963986001/1270921925991989268)
- Review the [Arch Network CLI documentation](https://github.com/arch-network/arch-node/releases)
