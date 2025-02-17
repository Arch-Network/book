# Setting up Bitcoin Core and Electrs for Local Validator

This guide walks you through setting up Bitcoin Core and Electrs, which are required dependencies for running the local validator via arch-cli.

## Bitcoin Core Setup

## 1.1 Installing Dependencies

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

## 1.2 Building Bitcoin Core
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

```bash,ignore
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

## 1.3 Bitcoin Core Configuration
### Setting up the Configuration File
First, create and navigate to the Bitcoin configuration directory:

```bash
# Navigate to Bitcoin directory from root

# ON LINUX
cd ~/.bitcoin

# ON MAC. Replace <USER-NAME> with your mac's username
mkdir /Users/<USER-NAME>/Library/'Application Support'/Bitcoin && cd /Users/<USER-NAME>/Library/'Application Support'/Bitcoin

# Create configuration file
touch bitcoin.conf
```

### Bitcoin Core Configuration Settings
Add the following settings to your bitcoin.conf file:

then paste this in your .conf file:
```bash
# Core Settings
server=1                    # Accept command line and JSON-RPC commands
txindex=1                   # Maintain a full transaction index
prune=0                    # Keep full blockchain data
printtoconsole=1           # Print log messages to console

# Memory Management
maxmempool=100             # Maximum memory for unconfirmed transactions (MB)
dbcache=150                # Database cache size (MB)

# Fee Settings
fallbackfee=0.001          # Fallback fee rate when estimation fails (BTC/kB)
maxtxfee=0.002            # Maximum total fees for a single transaction

# RPC Settings
rpcallowip=0.0.0.0/0      # Allow RPC connections from any IP
rpcuser=bitcoin            # RPC username
rpcpassword=bitcoinpass    

# Testnet Configuration
[testnet4]
rpcbind=0.0.0.0           # Bind to all network interfaces
rpcport=18332             # RPC port for testnet
wallet=testwallet         # Default wallet name for testnet

# Regtest Configuration
[regtest]
rpcbind=0.0.0.0           # Bind to all network interfaces
rpcport=18443             # RPC port for regtest
wallet=testwallet         # Default wallet name for regtest
```

### Starting Bitcoin Core
Start Bitcoin Core in regtest mode as a background process:

```bash
# Start Bitcoin Core daemon in regtest mode
bitcoind -regtest -daemon
```

### Verify Installation
After starting Bitcoin Core, verify it's running correctly:
```bash
# Check if Bitcoin Core is responding
bitcoin-cli -regtest getblockchaininfo

# Check the debug log for any errors
tail -f ~/.bitcoin/regtest/debug.log
```

## 2. Electrs Setup
Electrs is a high-performance Rust implementation of Electrum Server that connects to your Bitcoin Core node.

### 2.1 Building Electrs
```bash
# Clone the Mempool fork of Electrs
git clone https://github.com/Arch-Network/electrs && cd electrs

# Switch to the mempool branch which contains required customizations
git checkout mempool
```

### 2.2 Running Electrs

#### Local Development (Regtest)
```bash
# Build and run Electrs in release mode for local development
electrs -vvvv \
    --daemon-dir ~/.bitcoin \
    --network regtest \
    --cookie bitcoin:bitcoinpass \
    --main-loop-delay 0 \
    --electrum-rpc-addr="127.0.0.1:50001" \
    --http-addr="127.0.0.1:3002"
```

#### Testnet4 Configuration
For connecting to testnet4, use the following configuration:

```bash
# Run Electrs with testnet4 configuration
electrs -vvvv \
    --network testnet4 \
    --daemon-rpc-addr <BITCOIN_NODE_ENDPOINT>:<PORT> \
    --cookie "<BITCOIN_RPC_USER>:<BITCOIN_RPC_PASSWORD>" \
    --db-dir ./db \
    --main-loop-delay 0 \
    --lightmode \
    --jsonrpc-import \
    --electrum-rpc-addr="127.0.0.1:40001" \
    --http-addr="127.0.0.1:3004"
```

Expected output:
```
INFO - Electrum RPC server running on 127.0.0.1:40001
TRACE - [THREAD] GETHASHMAP INSERT | notification-8 ThreadId(31)
TRACE - [THREAD] START WORK        | notification-8 ThreadId(31)
TRACE - [THREAD] GETHASHMAP INSERT | shutdown-acceptor-9 ThreadId(35)
TRACE - [THREAD] START WORK        | shutdown-acceptor-9 ThreadId(35)
INFO - REST server running on 127.0.0.1:3004
```

> Note: The default ports are:
> - Regtest mode:
>   - Electrum RPC: 50001
>   - REST API: 3002
> - Testnet4 mode:
>   - Electrum RPC: 40001
>   - REST API: 3004

## 3. Running the Local Validator

### 3.1 Local Development (Regtest)
```bash
# Start the arch local validator for regtest
arch-cli validator-start
```

### 3.2 Testnet4 Configuration
For running the local validator with testnet4:

```bash
# Start the local validator with testnet4 configuration
arch-cli validator-start \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --electrs-endpoint http://localhost:3004 \
    --network-mode testnet \
    --electrum-endpoint tcp://127.0.0.1:40001
```

Output:

```bash,ignore

Welcome to the Arch Network CLI
2025-01-29T20:44:39.579899Z  INFO local_validator: local_validator/src/lib.rs:247: Detected disconnection. Reinitializing state...
2025-01-29T20:44:39.587229Z  INFO local_validator: local_validator/src/lib.rs:260: Waiting for all subscriptions to reconnect...
replaced false
new_tx false
blocks false
2025-01-29T20:44:39.780383Z  INFO validator::btc_notifications::subscription_thread: validator/src/btc_notifications/subscription_thread.rs:47: Connected to 'new_tx'. Subscribing...
2025-01-29T20:44:39.780477Z  INFO validator::btc_notifications::subscription_thread: validator/src/btc_notifications/subscription_thread.rs:47: Connected to 'replaced_tx'. Subscribing...
2025-01-29T20:44:39.780616Z  INFO validator::btc_notifications::subscription_thread: validator/src/btc_notifications/subscription_thread.rs:47: Connected to 'new_block'. Subscribing...
replaced true
new_tx true
blocks true
2025-01-29T20:44:40.087620Z  INFO local_validator: local_validator/src/lib.rs:264: All subscriptions are now ready. Resuming operations...
2025-01-29T20:44:40.087717Z  INFO local_validator: local_validator/src/lib.rs:284: slot 1
2025-01-29T20:44:40.089111Z  INFO local_validator: local_validator/src/lib.rs:310: block Block { transactions: [], previous_block_hash: "012f4e9ba6e3a7434688526a9a33f4ac373c0c03a1fd13f174803729de633046", timestamp: 1738183480089, bitcoin_block_height: 0, transaction_count: 0, merkle_root: "0000000000000000000000000000000000000000000000000000000000000000" }
2025-01-29T20:44:40.089628Z  INFO local_validator: local_validator/src/lib.rs:371: get_all_account_keys len 1 took: 26.58µs
2025-01-29T20:44:40.089670Z  INFO local_validator: local_validator/src/lib.rs:441: New block: RawHeaderNotification { height: 0, header: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 163, 237, 253, 122, 123, 18, 178, 122, 199, 44, 62, 103, 118, 143, 97, 127, 200, 27, 195, 136, 138, 81, 50, 58, 159, 184, 170, 75, 30, 94, 74, 218, 229, 73, 77, 255, 255, 127, 32, 2, 0, 0, 0] }
2025-01-29T20:44:40.089974Z  INFO local_validator: local_validator/src/lib.rs:470: accounts_to_rollback len 0 took 6.041µs
2025-01-29T20:44:40.290524Z  INFO local_validator: local_validator/src/lib.rs:284: slot 2
2025-01-29T20:44:40.291888Z  INFO local_validator: local_validator/src/lib.rs:310: block Block
```

## Troubleshooting
Common issues and their solutions:

- If make install fails, ensure you have proper sudo privileges
- If Electrs can't connect to Bitcoin Core, verify Bitcoin Core is running and the authentication credentials are correct
- For permission errors, check that the .bitcoin directory has the correct ownership and permissions

## Additional Resources

- [Bitcoin Core Documentation](https://github.com/bitcoin/bitcoin)
- [Electrs Documentation](https://github.com/mempool/electrs)
