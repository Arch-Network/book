# Validator Staking Guide

This guide will walk you through the process of staking ARCH tokens to become a validator on the Arch Network. As a validator, you'll be an integral part of the network's security and computation infrastructure.

<div class="toc">
<h2>Contents</h2>

<div class="toc-list">
<a href="#prerequisites" class="toc-item">
    <div class="toc-left">
        <span class="toc-number">01</span>
        <span class="toc-text">Prerequisites</span>
    </div>
    <div class="toc-right">→</div>
</a>

<a href="#validator-responsibilities" class="toc-item">
    <div class="toc-left">
        <span class="toc-number">02</span>
        <span class="toc-text">Validator Responsibilities</span>
    </div>
    <div class="toc-right">→</div>
</a>

<a href="#setup-and-configuration" class="toc-item">
    <div class="toc-left">
        <span class="toc-number">03</span>
        <span class="toc-text">Setup & Configuration</span>
    </div>
    <div class="toc-right">→</div>
</a>

<a href="#monitoring-and-maintenance" class="toc-item">
    <div class="toc-left">
        <span class="toc-number">04</span>
        <span class="toc-text">Monitoring & Maintenance</span>
    </div>
    <div class="toc-right">→</div>
</a>
</div>
</div>

## Prerequisites

<div class="requirement-grid">
<div class="requirement-card">
<h3>🖥️ System Requirements</h3>
<table>
<tr><th>Component</th><th>Minimum</th><th>Recommended</th></tr>
<tr><td>CPU</td><td>4+ cores</td><td>8+ cores</td></tr>
<tr><td>RAM</td><td>16GB</td><td>32GB</td></tr>
<tr><td>Storage</td><td>100GB SSD</td><td>500GB+ SSD</td></tr>
<tr><td>Network</td><td>100Mbps</td><td>1Gbps+</td></tr>
<tr><td>OS</td><td>Ubuntu 20.04+ / macOS 12.0+</td><td>Latest LTS</td></tr>
</table>
</div>

<div class="requirement-card">
<h3>🔑 ARCH Tokens</h3>
<p>Contact the Arch Network team for current staking requirements, including:</p>
<ul>
<li>Minimum stake amounts</li>
<li>Lockup periods</li>
<li>Commission rates</li>
</ul>
</div>
</div>

## Validator Responsibilities

<div class="responsibility-grid">
<div class="responsibility-card">
<h3>🔄 Transaction Processing</h3>
<ul>
<li>Execute programs in Arch VM</li>
<li>Validate transaction signatures</li>
<li>Process Bitcoin-related transactions</li>
<li>Maintain transaction history</li>
</ul>
</div>

<div class="responsibility-card">
<h3>🤝 Consensus Participation</h3>
<ul>
<li>Participate in ROAST protocol</li>
<li>Contribute to threshold signing</li>
<li>Coordinate transaction finality</li>
<li>Verify state transitions</li>
</ul>
</div>

<div class="responsibility-card">
<h3>📊 State Management</h3>
<ul>
<li>Track UTXO states</li>
<li>Validate Bitcoin operations</li>
<li>Maintain state consistency</li>
<li>Verify network state</li>
</ul>
</div>
</div>

## Setup & Configuration

### 1. Install Arch Network CLI

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

### 2. Configure Bitcoin Node Access

<div class="network-select">
<div class="network-option">
<h4>📡 Remote Node (Recommended)</h4>

**Regtest/Development:**
```bash
--bitcoin-rpc-endpoint bitcoin-node.dev.aws.archnetwork.xyz \
--bitcoin-rpc-port 18443 \
--bitcoin-rpc-username bitcoin \
--bitcoin-rpc-password your_password \
--bitcoin-rpc-wallet testwallet
```

**Testnet:**
```bash
--bitcoin-rpc-endpoint bitcoin-node.test.aws.archnetwork.xyz \
--bitcoin-rpc-port 49332 \
--bitcoin-rpc-username bitcoin \
--bitcoin-rpc-password your_password \
--bitcoin-rpc-wallet testwallet
```
</div>

<div class="network-option">
<h4>🖥️ Local Node</h4>

For advanced users who want full control. See our [Bitcoin Node Setup Guide](bitcoin-and-titan-setup.md).

**Local Regtest Configuration:**
```bash
--bitcoin-rpc-endpoint 127.0.0.1 \
--bitcoin-rpc-port 18443 \
--bitcoin-rpc-username your_username \
--bitcoin-rpc-password your_password \
--bitcoin-rpc-wallet regtest
```

**Local Testnet Configuration:**
```bash
--bitcoin-rpc-endpoint 127.0.0.1 \
--bitcoin-rpc-port 18332 \
--bitcoin-rpc-username your_username \
--bitcoin-rpc-password your_password \
--bitcoin-rpc-wallet testnet
```

**Local Mainnet Configuration:**
```bash
--bitcoin-rpc-endpoint 127.0.0.1 \
--bitcoin-rpc-port 8332 \
--bitcoin-rpc-username your_username \
--bitcoin-rpc-password your_password \
--bitcoin-rpc-wallet mainnet
```
</div>
</div>

### 3. Start Your Validator

```bash
cli validator start \
  --network-mode mainnet \
  --titan-rpc-endpoint your_endpoint \
  --titan-rpc-port your_port \
  --titan-rpc-username your_username \
  --titan-rpc-password your_password \
  --titan-rpc-wallet your_wallet
```

## Monitoring & Maintenance

<div class="monitoring-grid">
<div class="monitoring-card">
<h3>📊 Health Checks</h3>

```bash
# Node status
cli validator status

# Performance metrics
cli validator metrics
```
</div>

<div class="monitoring-card">
<h3>🔄 Sync Management</h3>

```bash
# Check sync status
cli validator sync-status

# Force resync if needed
cli validator resync
```
</div>
</div>

## Understanding Staking in Arch Network

<div class="staking-explanation">
<h3>🔐 What is Staking?</h3>

Staking in Arch Network is fundamentally different from traditional Proof of Stake systems. Instead of using staking for consensus, Arch Network uses staked validators to participate in the ROAST protocol for secure Bitcoin transaction signing.

```mermaid
flowchart TB
    subgraph Staking["Staking Process"]
        direction TB
        V[Validator Node] -->|1. Stakes ARCH| N[Network]
        N -->|2. Assigns Share| DKG[Distributed Key]
        DKG -->|3. Participates in| ROAST[ROAST Protocol]
    end

    subgraph Validation["Transaction Validation"]
        direction TB
        TX[Transaction] -->|1. Submitted| L[Leader]
        L -->|2. Distributes| VS[Validator Set]
        VS -->|3. Execute & Sign| R[Results]
        R -->|4. Aggregate| BTC[Bitcoin Network]
    end

    style Staking fill:#f3e5f5,stroke:#4a148c
    style Validation fill:#e8f5e9,stroke:#1b5e20
```

<h3>🤔 Solana vs. Arch Network: Validator Comparison</h3>

<div class="comparison-table">
<table>
<tr><th>Feature</th><th>Solana</th><th>Arch Network</th></tr>
<tr>
  <td><b>Consensus Role</b></td>
  <td>Validators vote on blocks and produce blocks when selected as leader</td>
  <td>Validators execute transactions and sign Bitcoin transactions using threshold signatures</td>
</tr>
<tr>
  <td><b>Economic Model</b></td>
  <td>Block rewards + transaction fees</td>
  <td>Transaction fees + commission from Bitcoin operations</td>
</tr>
<tr>
  <td><b>Selection Mechanism</b></td>
  <td>Stake-weighted leader selection</td>
  <td>Stake-weighted participation in threshold signing committee</td>
</tr>
<tr>
  <td><b>Performance Metrics</b></td>
  <td>Vote signing speed, block production, uptime</td>
  <td>Transaction execution correctness, signing participation, uptime</td>
</tr>
<tr>
  <td><b>Slashing Conditions</b></td>
  <td>Double signing, unavailability</td>
  <td>Malicious signing, transaction manipulation attempts</td>
</tr>
<tr>
  <td><b>Hardware Requirements</b></td>
  <td>High-end CPU, 128GB+ RAM, 2TB+ NVMe</td>
  <td>4+ CPU cores, 16GB+ RAM, 100GB+ SSD</td>
</tr>
</table>
</div>

<h3>🚀 From Solana to Arch: Operational Transition Guide</h3>

If you're an experienced Solana validator operator, here's what you need to know about running an Arch Network validator:

<div class="transition-grid">
<div class="transition-card">
<h4>⚙️ Technical Setup</h4>
<ul>
<li><b>Lower Hardware Requirements:</b> Arch Network requires less powerful hardware than Solana</li>
<li><b>Bitcoin RPC Access:</b> Validators need Bitcoin node access (remote or local)</li>
<li><b>Key Management:</b> Different key structure focusing on distributed key generation</li>
<li><b>Monitoring:</b> Focus on signing participation rather than block production</li>
</ul>
</div>

<div class="transition-card">
<h4>💰 Economic Considerations</h4>
<ul>
<li><b>Staking Return Model:</b> Fee-based with transaction execution rewards</li>
<li><b>Reward Distribution:</b> Based on stake proportion and signing participation</li>
<li><b>Commission Structure:</b> Set during validator configuration</li>
<li><b>Lockup Periods:</b> Network-defined based on security requirements</li>
</ul>
</div>

<div class="transition-card">
<h4>🔄 Operational Differences</h4>
<ul>
<li><b>Signing vs. Voting:</b> Focus on correct transaction execution and signing</li>
<li><b>Performance Metrics:</b> Measured by signing participation and availability</li>
<li><b>Updates:</b> Less frequent than Solana's rapid release cycle</li>
<li><b>Network Bandwidth:</b> Lower requirements due to different architecture</li>
</ul>
</div>

<div class="transition-card">
<h4>🛣️ Onboarding Process</h4>
<ul>
<li><b>Registration:</b> Complete validator registration through the network portal</li>
<li><b>Stake Deposit:</b> Transfer ARCH tokens to the validator staking contract</li>
<li><b>Configuration:</b> Set up your validator with proper Bitcoin node access</li>
<li><b>Key Generation:</b> Participate in distributed key generation ceremony</li>
<li><b>Activation:</b> Begin participation after stake activation period</li>
</ul>
</div>
</div>

<h3>📊 Staking Economics</h3>

<div class="economics-grid">
<div class="economics-card">
<h4>Validator Requirements</h4>
<ul>
<li><b>Minimum Stake:</b> Contact Arch Network team for current requirements</li>
<li><b>Lockup Period:</b> Network-defined based on security requirements</li>
<li><b>Uptime Requirement:</b> High availability expected for signing participation</li>
<li><b>Performance Bonding:</b> Stake acts as bond for correct behavior</li>
</ul>
</div>

<div class="economics-card">
<h4>Reward Structure</h4>
<ul>
<li><b>Base Rewards:</b> From transaction fees distributed proportionally to stake</li>
<li><b>Signing Rewards:</b> Additional rewards for participating in threshold signing</li>
<li><b>Commission:</b> Set percentage of rewards retained by validator</li>
<li><b>Distribution Frequency:</b> Continuous as transactions are processed</li>
</ul>
</div>
</div>

<h3>🔄 ROAST Protocol Integration</h3>

The ROAST (Robust Asynchronous Schnorr Threshold) protocol enables validators to collectively sign Bitcoin transactions:

```mermaid
sequenceDiagram
    participant C as Client
    participant L as Leader
    participant V as Validators
    participant B as Bitcoin Network
    
    C->>L: 1. Submit Transaction
    L->>V: 2. Distribute to Validators
    V->>V: 3. Execute in Arch VM
    V->>L: 4. Sign Results
    L->>B: 5. Submit to Bitcoin
```

<h3>🛡️ Security Model</h3>

```mermaid
flowchart LR
    subgraph Security["Security Layers"]
        direction TB
        UTXO[UTXO Validation] -->|Verifies| Own[Ownership]
        Own -->|Ensures| State[State Consistency]
        State -->|Commits to| BTC[Bitcoin]
    end

    subgraph Threshold["Threshold Signing"]
        direction TB
        Val[Validators] -->|t-of-n| Sign[Signature]
        Sign -->|ROAST| Agg[Aggregation]
        Agg -->|Submit| Final[Final Transaction]
    end

    style Security fill:#e1f5fe,stroke:#01579b
    style Threshold fill:#fff3e0,stroke:#e65100
```

<div class="staking-card">
<h4>Key Features</h4>
<ul>
<li>Distributed key generation for secure signing</li>
<li>Threshold signature scheme (t-of-n) for fault tolerance</li>
<li>Bitcoin-based finality guarantees</li>
<li>Automatic malicious node detection</li>
</ul>
</div>
</div>

<style>
.requirement-grid, .responsibility-grid, .monitoring-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.requirement-card, .responsibility-card, .monitoring-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.requirement-card h3, .responsibility-card h3, .monitoring-card h3 {
    margin-top: 0;
    color: #2c3e50;
}

.platform-select, .network-select {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
}

.platform-option, .network-option {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background: #f1f3f5;
}

.staking-explanation {
    background: #ffffff;
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.staking-explanation h3 {
    color: #2c3e50;
    margin-top: 2rem;
}

.staking-explanation h3:first-child {
    margin-top: 0;
}

.staking-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.staking-card h4 {
    margin-top: 0;
    color: #2c3e50;
}

.comparison-table {
    overflow-x: auto;
    margin: 1.5rem 0;
}

.comparison-table table {
    width: 100%;
    border-collapse: collapse;
}

.comparison-table th {
    background: #f1f3f5;
    padding: 0.75rem;
    text-align: left;
}

.comparison-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
}

.transition-grid, .economics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.transition-card, .economics-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.transition-card h4, .economics-card h4 {
    margin-top: 0;
    color: #2c3e50;
}
</style> 