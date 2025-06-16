# Configuring Local Validator with Bitcoin Testnet4

This guide covers how to configure your Arch Network local validator to connect to Bitcoin testnet4, which provides access to additional tools and features for development and testing, including ordinals and runes functionality.

## Overview

Bitcoin testnet4 is the latest Bitcoin test network that provides:
- **Ordinals Support**: Create and test Bitcoin ordinal inscriptions
- **Runes Protocol**: Test BRC-20 and rune token functionality  
- **Enhanced Tooling**: Access to advanced Bitcoin testing tools
- **Real Network Conditions**: More realistic testing environment than regtest

**When to Use This Setup:**
- Testing ordinals/runes integration
- Developing Bitcoin-native features
- Testing with external Bitcoin services
- Preparing for mainnet deployment

## Prerequisites

Before starting, ensure you have:
- **Arch Network CLI** installed - [Download Latest](https://github.com/Arch-Network/arch-node/releases/latest)
- **Docker** installed and running - [Install Docker](https://docs.docker.com/get-docker/)
- **Bitcoin Core** (optional, for advanced users) - [Install Guide](https://bitcoin.org/en/download)

## Quick Start (Recommended)

The easiest way to run a local validator with testnet4 connectivity:

```bash
# Start validator connected to hosted testnet4 infrastructure
cli validator-start --network-mode testnet
```

This connects to Arch's hosted testnet4 infrastructure including:
- Bitcoin testnet4 node
- Titan indexer
- Network coordination services

## Configuration Options

### Basic Testnet4 Configuration

```bash
cli validator-start \
  --network-mode testnet \
  --data-dir ./.arch_data \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 9002 \
  --titan-endpoint titan-node.test.aws.archnetwork.xyz \
  --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
```

### Custom Network Configuration

If you want to run your own Bitcoin testnet4 node:

```bash
# Start your Bitcoin testnet4 node
bitcoind \
  -testnet4 \
  -server \
  -rpcuser=bitcoin \
  -rpcpassword=bitcoinpass \
  -rpcbind=0.0.0.0 \
  -rpcallowip=0.0.0.0/0 \
  -fallbackfee=0.00001 \
  -zmqpubrawblock=tcp://0.0.0.0:28332 \
  -zmqpubrawtx=tcp://0.0.0.0:28333

# Start validator with custom Bitcoin node
cli validator-start \
  --network-mode testnet \
  --bitcoin-rpc-endpoint http://localhost:48332 \
  --bitcoin-rpc-username bitcoin \
  --bitcoin-rpc-password bitcoinpass
```

## Configuration Parameters

### Core Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--network-mode` | Network to connect to (`regtest`, `testnet`, `mainnet`) | `regtest` |
| `--data-dir` | Directory for validator data storage | `./.arch_data` |
| `--rpc-bind-ip` | IP address for RPC server | `127.0.0.1` |
| `--rpc-bind-port` | Port for RPC server | `9002` |

### Bitcoin Integration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--bitcoin-rpc-endpoint` | Bitcoin node RPC URL | Uses hosted node |
| `--bitcoin-rpc-username` | Bitcoin RPC username | - |
| `--bitcoin-rpc-password` | Bitcoin RPC password | - |

### Titan Indexer

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--titan-endpoint` | Titan HTTP endpoint | Hosted endpoint |
| `--titan-socket-endpoint` | Titan WebSocket endpoint | Hosted endpoint |

## Advanced Setup: Standalone Binary

For advanced users who want more control over the validator process:

### Download and Setup

1. **Download Required Files**:
   ```bash
   # Create working directory
   mkdir arch-testnet4-validator
   cd arch-testnet4-validator
   
   # Download validator binary and system program
   wget https://github.com/Arch-Network/arch-node/releases/latest/download/local_validator
   wget https://github.com/Arch-Network/arch-node/releases/latest/download/system_program.so
   
   # Create required directory structure
   mkdir ebpf
   mv system_program.so ebpf/
   chmod +x local_validator
   ```

2. **Verify Directory Structure**:
   ```
   arch-testnet4-validator/
   ├── ebpf/
   │   └── system_program.so
   └── local_validator
   ```

### Run Standalone Validator

```bash
RUST_LOG=info ./local_validator \
  --network-mode testnet \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 9002 \
  --titan-endpoint titan-node.test.aws.archnetwork.xyz \
  --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
```

## Testing Your Setup

### Health Check

Verify your validator is running correctly:

```bash
curl -X POST -H 'Content-Type: application/json' -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"is_node_ready",
    "params":[]
}' http://localhost:9002/
```

**Expected Response:**
```json
{
    "jsonrpc": "2.0",
    "result": true,
    "id": 1
}
```

### Deploy Test Program

Test program deployment to verify everything works:

```bash
# Using CLI (automatic endpoint detection)
cli deploy --network-mode testnet

# Using CLI with explicit endpoint
cli deploy --network-mode testnet --rpc-url http://localhost:9002
```

### Check Validator Status

```bash
cli validator-status --rpc-url http://localhost:9002
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if validator is running
curl -X POST http://localhost:9002/ \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"is_node_ready","params":[]}'
```

#### 2. Reset Validator State
```bash
# Stop validator first (Ctrl+C or docker stop)
rm -rf .arch_data

# Restart validator
cli validator-start --network-mode testnet
```

#### 3. View Logs

**Docker Logs:**
```bash
# Find container name
docker ps

# View logs
docker logs -f <container_name>
```

**Standalone Binary Logs:**
```bash
# Redirect logs to file
RUST_LOG=info ./local_validator \
  --network-mode testnet \
  [other options] > validator.log 2>&1

# Monitor logs in another terminal
tail -f validator.log
```

#### 4. Network Connectivity Issues
```bash
# Test connection to Titan endpoint
curl -I https://titan-node.test.aws.archnetwork.xyz

# Test WebSocket endpoint (requires wscat)
wscat -c wss://titan-node.test.aws.archnetwork.xyz:49332
```

## Development Workflow

### 1. Development Cycle
```bash
# Start validator
cli validator-start --network-mode testnet

# Build your program
cd your-program
cargo build-sbf

# Deploy and test
cli deploy --network-mode testnet
cli invoke [program-id] [account] --data [instruction-data]
```

### 2. Reset Between Tests
```bash
# Quick reset
cli orchestrate reset

# Full reset (if needed)
rm -rf .arch_data
cli validator-start --network-mode testnet
```

### 3. Working with Testnet4 Features

**Ordinals Testing:**
```bash
# Your program can interact with ordinal inscriptions
# Use the Bitcoin testnet4 ordinals APIs
```

**Runes Integration:**
```bash
# Test rune token operations
# Integrate with runes protocol via Bitcoin transactions
```

## Production Considerations

### Security
- **Never expose RPC ports** publicly in production
- **Use strong credentials** for Bitcoin RPC connections
- **Monitor validator health** continuously

### Performance
- **Allocate sufficient resources** (4+ GB RAM recommended)
- **Use SSD storage** for data directory
- **Monitor disk usage** (logs can grow large)

### Networking
- **Configure firewalls** appropriately
- **Use SSL/TLS** for external connections
- **Monitor network latency** to Bitcoin and Titan nodes

## Next Steps

1. **Deploy Your First Program**: Follow the [Writing Your First Program](./writing-your-first-program.md) guide
2. **Test Thoroughly**: Use the [Testing Guide](./testing-guide.md) for comprehensive testing
3. **Explore Examples**: Check out [advanced examples](./guides.md) for complex scenarios
4. **Join the Community**: Get help on [Discord](https://discord.gg/archnetwork) if you run into issues

## Additional Resources

- [Arch Network CLI Reference](../rpc/http-methods.md)
- [Bitcoin Testnet4 Faucet](https://mempool.space/testnet4)
- [Ordinals Documentation](https://docs.ordinals.com/)
- [Runes Protocol Guide](https://runes.com/)

**Need Help?** Join our [Discord community](https://discord.gg/archnetwork) or file issues on our [GitHub](https://github.com/Arch-Network/arch-node/issues).
