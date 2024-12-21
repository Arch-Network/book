# Network Architecture

Arch Network operates as a distributed system with different types of nodes working together to provide secure and efficient program execution on Bitcoin. This document details the network's architecture and how different components interact.

## Network Overview

```ascii
                                   Bitcoin Network
                                         ▲
                                         │
                    ┌────────────────────┴───────────────────┐
                    │         Leader Node (Coordinator)       │
                    │                                        │
                    │  ┌─────────────┐    ┌──────────────┐  │
                    │  │Transaction  │    │ Multi-sig    │  │
                    │  │Coordination │    │ Aggregation  │  │
                    │  └─────────────┘    └──────────────┘  │
                    └─┬──────────┬──────────┬──────────┬────┘
                      │          │          │          │
                 ┌────▼───┐ ┌────▼───┐ ┌────▼───┐ ┌────▼───┐
                 │Validator│ │Validator│ │Validator│ │Validator│
                 │Node 1  │ │Node 2  │ │Node 3  │ │Node N  │
                 └────────┘ └────────┘ └────────┘ └────────┘
                      ▲          ▲          ▲          ▲
                      └──────────┴──────────┴──────────┘
                                    │
                            ┌───────▼───────┐
                            │   Bootnode    │
                            │(Discovery)    │
                            └───────────────┘
```

## Node Types

### 1. Bootnode
The bootnode serves as the network's entry point, similar to DNS seeds in Bitcoin:
- Handles initial network discovery
- Maintains whitelist of valid validators
- Coordinates peer connections
- Manages network topology

```ascii
                     ┌─────────────────┐
                     │    Bootnode     │
                     │                 │
┌──────────┐        │ ┌─────────────┐ │         ┌──────────┐
│New Node  │◄──────►│ │Peer Registry│ │◄────────►│Validator │
│          │        │ └─────────────┘ │         │Network   │
└──────────┘        │ ┌─────────────┐ │         └──────────┘
                    │ │  Whitelist  │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

Configuration:
```bash
cargo run -p bootnode -- \
    --network-mode localnet \
    --p2p-bind-port 19001 \
    --leader-peer-id "<LEADER_ID>" \
    --validator-whitelist "<VALIDATOR_IDS>"
```

### 2. Leader Node
The leader node coordinates transaction processing and Bitcoin integration:

```ascii
                Bitcoin Network
                      ▲
                      │
        ┌─────────────┴─────────────┐
        │        Leader Node        │
        │                          │
    ┌───┴──────────┐   ┌──────────┴───┐
    │ Transaction  │   │  Multi-sig   │
    │ Coordination │   │ Aggregation  │
    └─────────────┬┘   └┬────────────┘
                  │     │
         ┌────────▼─────▼────────┐
         │   Validator Network   │
         └─────────────────────┬─┘
                              │
                     ┌────────▼───────┐
                     │Program Execution│
                     └────────────────┘
```

Key responsibilities:
- Transaction coordination
- Multi-signature aggregation
- Bitcoin transaction submission
- Network state management

### 3. Validator Nodes
Validator nodes form the core of the network's computation and validation:

```ascii
┌────────────────────────────────────┐
│           Validator Node           │
│                                   │
│  ┌───────────┐     ┌───────────┐  │
│  │  Arch VM  │     │  State    │  │
│  │ Execution │     │ Validation│  │
│  └─────┬─────┘     └─────┬─────┘  │
│        │                 │         │
│  ┌─────▼─────────────────▼─────┐  │
│  │      Network Protocol       │  │
│  └─────────────┬───────────────┘  │
└────────────────┼──────────────────┘
                 │
         ┌───────▼───────┐
         │ P2P Network   │
         └───────────────┘
```

Types:
1. **Full Validator**
   - Participates in consensus
   - Executes programs
   - Maintains full state

2. **Lightweight Validator**
   - Local development use
   - Single-node operation
   - Simulated environment

## Network Communication

### P2P Protocol
The network uses libp2p for peer-to-peer communication:
```rust
pub const ENABLED_PROTOCOLS: [&str; 2] = [
    ArchNetworkProtocol::STREAM_PROTOCOL,
    ArchNetworkProtocol::VALIDATOR_PROTOCOL,
];
```

### Message Types
1. **Network Messages**
   - Peer discovery
   - State synchronization
   - Transaction propagation

2. **ROAST Protocol Messages**
   - Multi-signature coordination
   - Threshold signing
   - Key generation

## Network Modes

### 1. Devnet
- Local development
- Single validator
- Simulated Bitcoin

### 2. Testnet
- Test environment
- Multiple validators
- Bitcoin testnet integration

### 3. Mainnet
- Production network
- Full security model
- Bitcoin mainnet integration

## Security Model

### 1. Validator Selection
- Whitelist-based validation
- PeerID verification
- Network role enforcement

### 2. Transaction Security
- Multi-signature validation
- Threshold signing
- Bitcoin-based finality

### 3. State Protection
- Distributed state verification
- UTXO-based state anchoring
- Cross-validator consistency

## Monitoring and Telemetry

### 1. Node Metrics
```rust
pub struct NodeInfo {
    pub peer_id: PeerId,
    pub network_mode: ArchNetworkMode,
    pub bitcoin_block_height: u64,
    pub arch_block_height: u64,
}
```

### 2. Network Health
- Peer connectivity
- Block propagation
- Transaction processing
- Bitcoin synchronization

### 3. Debug Interfaces
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"is_node_ready",
    "params":[]
}' http://localhost:9002/
```

## Best Practices

### 1. Node Operation
- Secure key management
- Regular state verification
- Proper shutdown procedures
- Log management

### 2. Network Participation
- Maintain node availability
- Monitor Bitcoin integration
- Handle network upgrades
- Backup critical data

### 3. Development Setup
- Use lightweight validator for testing
- Monitor resource usage
- Handle network modes properly
- Implement proper error handling

<!-- Internal -->
[Arch VM]: ./arch-vm.md
[Bitcoin Integration]: ./bitcoin-integration.md
[UTXO]: ../program/utxo.md
[Program]: ../program/program.md 