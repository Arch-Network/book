# System Requirements

Welcome to the Arch Network development guide. This page will walk you through setting up your development environment with all necessary dependencies. Please follow each section carefully to ensure a smooth setup process.

## Overview

Before you begin development with Arch Network, you'll need to install and configure the following tools:

| Requirement | Minimum Version | Description |
|------------|----------------|-------------|
| [Rust] | Latest stable | Core development language |
| [C++ Compiler] | gcc/clang | Required for native builds |
| [Solana CLI] | v1.18.18 | Solana development tools |
| [Arch Network CLI] | Latest | Arch Network development toolkit |

## Detailed Installation Guide

### 1. Install Rust
Rust is the primary development language for Arch Network programs.

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

> 💡 **Note:** Make sure you're using the stable channel throughout this book.

### 2. C++ Compiler Setup

#### MacOS Users
The C++ compiler comes pre-installed with Xcode Command Line Tools. Verify with:
```bash
gcc --version
```

If not installed, run:
```bash
xcode-select --install
```

#### Linux Users (Debian/Ubuntu)
Install the required compiler tools:
```bash
sudo apt-get update
sudo apt-get install gcc-multilib build-essential jq
```

### 3. Install Solana CLI

The Solana CLI is required for program compilation and deployment.

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.13/install)"
```

> ⚠️ **Important Notes:** 
> - Add Solana to your PATH as instructed after installation

#### Troubleshooting Solana Installation

If you installed Rust through Homebrew and encounter `cargo-build-sbf` issues:

1. Remove existing Rust installation:
```bash
rustup self uninstall
```

2. Verify removal:
```bash
rustup --version  # Should show "command not found"
```

3. Perform clean Rust installation:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

4. Reinstall Solana:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
```

### 4. Install Arch Network CLI

The Arch Network CLI provides essential development tools and a local development environment.

```bash
# Download the appropriate CLI binary for your architecture from:
# https://github.com/Arch-Network/arch-node/releases/latest
# For example, for macOS with Apple Silicon:
curl -L -o cli https://github.com/Arch-Network/arch-node/releases/latest/download/cli-aarch64-apple-darwin
chmod +x cli
sudo mv cli /usr/local/bin/

# Verify installation
cli --version
```

## Features
The Arch Network CLI provides:
- Local validator node for development
- Program deployment and management
- Account and transaction management
- Block data and program logging
- Group key and network controls

## Need Help?

- Check our [Troubleshooting Guide](#troubleshooting-solana-installation)
- Join our [Discord dev-chat] for community support
- Review the [Arch Network CLI repo] documentation
- Ensure all version requirements are met

<!-- Internal -->
[Rust]: #install-rust
[C++ Compiler]: #install-c-compiler
[Solana CLI]: #install-solana-cli
[Arch Network CLI]: #install-arch-network-cli

<!-- External -->
[GCC]: https://gcc.gnu.org/
[gcc-multilib]: https://packages.debian.org/sid/gcc-multilib
[npm]: https://github.com/npm/cli
[eBPF]: https://ebpf.io/
[Arch Network CLI repo]: https://github.com/arch-network/arch-node/releases
[rust]: https://www.rust-lang.org
[Solana]: https://github.com/solana-labs/solana
[arch-typescript-sdk]: https://github.com/saturnBTC/arch-typescript-sdk
[Homebrew]: https://brew.sh/
[Solana Docs]: https://docs.solanalabs.com/cli/install#macos--linux
[the Rust website]: https://www.rust-lang.org/tools/install
[Discord dev-chat]: https://discord.com/channels/1241112027963986001/1270921925991989268
