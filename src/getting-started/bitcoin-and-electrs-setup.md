# Setting up Bitcoin Core and Electrs for Local Validator

This guide walks you through setting up Bitcoin Core and Electrs, which are required dependencies for running the local validator via arch-cli.

## Bitcoin Core Setup

### 1.1 Installing Dependencies

macOS: 
```bash
# Install required dependencies via Homebrew
brew install automake boost ccache git libevent libnatpmp libtool llvm miniupnpc pkg-config python qrencode qt@5 sqlite zeromq
```

Ubuntu/Debian Linux:
```bash
# Install required development and build dependencies
sudo apt-get install automake autotools-dev bsdmainutils build-essential ccache clang gcc git libboost-dev libboost-filesystem-dev libboost-system-dev libboost-test-dev libevent-dev libminiupnpc-dev libnatpmp-dev libsqlite3-dev libtool libzmq3-dev pkg-config python3 qtbase5-dev qttools5-dev qttools5-dev-tools qtwayland5 systemtap-sdt-dev
```

### 1.2 Building Bitcoin Core
Clone and enter the Bitcoin repository:

```bash
# Clone the Bitcoin Core repository
git clone https://github.com/bitcoin/bitcoin.git
```

```bash
# Navigate to the bitcoin directory
cd bitcoin
```

Compile from source:

```
# Switch to Bitcoin Core v28.0 release branch
git checkout v28.0

# Generate build scripts and check build dependencies
# This prepares the build system and ensures required tools are present
./autogen.sh

# Configure the build with default options
# This checks system requirements and creates makefiles
./configure 

# Compile Bitcoin Core and all its components
# This may take 15-60 minutes depending on your system
make 

# Install Bitcoin Core binaries to your system
# Usually requires sudo privileges to install to system directories
make install
```

## 2. Electrs Setup
Electrs is a high-performance Rust implementation of Electrum Server that connects to your Bitcoin Core node.

```bash
# Clone the Mempool fork of Electrs
git clone https://github.com/mempool/electrs && cd electrs

# Switch to the mempool branch which contains required customizations
git checkout mempool

# Build and run Electrs in release mode
# - Uses verbose logging (-vvvv) for debugging
# - Connects to Bitcoin Core in the default directory
# - Runs in regtest mode for testing
# - Uses specified authentication credentials
cargo run --release --bin electrs -- -vvvv \
    --daemon-dir ~/.bitcoin \
    --network regtest \
    --cookie bitcoin:bitcoinpass
```

### 3. Running the Local Validator

Once both Bitcoin Core and Electrs are properly configured and running:

```bash
# Start the arch local validator
arch-cli validator-start
```

## Troubleshooting
Common issues and their solutions:

- If make install fails, ensure you have proper sudo privileges
- If Electrs can't connect to Bitcoin Core, verify Bitcoin Core is running and the authentication credentials are correct
- For permission errors, check that the .bitcoin directory has the correct ownership and permissions

## Additional Resources

- [Bitcoin Core Documentation](https://github.com/bitcoin/bitcoin)
- [Electrs Documentation](https://github.com/mempool/electrs)