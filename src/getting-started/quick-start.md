# 🚀 Quick Start Guide

Welcome to Arch Network! Let's get your first program running in under 15 minutes.

## Prerequisites

Before starting, ensure you have all required tools and dependencies installed. See the [System Requirements](requirements.md) page for detailed installation instructions.

Quick checklist:
- [ ] Git (v2.0 or later)
- [ ] Rust (v1.70 or later)
- [ ] Solana CLI tools (v1.16 or later)
- [ ] Arch Network CLI (latest version)

Verify your installation:
```bash
# Verify installations
git --version
rustc --version
solana --version
cli --version
```

## ⏱️ Time Estimate
- Total time: ~15 minutes
- Active time: ~10 minutes
- Waiting time: ~5 minutes

## 🚀 Quick Start Project

### 1. Clone Example Project
```bash
# Get the starter example
git clone https://github.com/Arch-Network/arch-examples
cd arch-examples/examples/helloworld
```

### 2. Start Local Validator

<div class="network-mode-container">
<div class="network-mode-header">
    <h4 id="network-mode-title">Development Network (Default)</h4>
</div>

<div class="network-mode-content">
<div id="dev-network-command">

```bash
# Start a local validator
cli validator-start \
    --network-mode devnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint titan-node.dev.aws.archnetwork.xyz \
    --titan-socket-endpoint titan-node.dev.aws.archnetwork.xyz:18443
```

</div>
<div id="test-network-command" style="display: none;">

```bash
# Start a local validator
cli validator-start \
    --network-mode testnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint titan-node.test.aws.archnetwork.xyz \
    --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
```

</div>
</div>

<div class="network-mode-buttons">
    <button class="network-mode-button active" onclick="switchNetwork('dev')">Development Network</button>
    <button class="network-mode-button" onclick="switchNetwork('test')">Test Network</button>
</div>
</div>

<style>
.network-mode-container {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
}

.network-mode-header h4 {
    margin: 0;
    padding: 0.5rem 0;
    color: #ff4757;
}

.network-mode-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.network-mode-button {
    padding: 0.5rem 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
}

.network-mode-button.active {
    background: #007bff;
    color: white;
    border-color: #0056b3;
}

.network-mode-button:hover:not(.active) {
    background: #f1f3f5;
}
</style>

<script>
function switchNetwork(mode) {
    // Update buttons
    document.querySelectorAll('.network-mode-button').forEach(btn => {
        btn.classList.remove('active');
        if ((mode === 'dev' && btn.textContent.includes('Development')) ||
            (mode === 'test' && btn.textContent.includes('Test'))) {
            btn.classList.add('active');
        }
    });

    // Update title
    const title = document.getElementById('network-mode-title');
    title.textContent = mode === 'dev' ? 'Development Network (Default)' : 'Test Network';

    // Show/hide appropriate command
    document.getElementById('dev-network-command').style.display = mode === 'dev' ? 'block' : 'none';
    document.getElementById('test-network-command').style.display = mode === 'test' ? 'block' : 'none';
}
</script>

## Building and Deploying Your Program

> 💡 For a more detailed guide on program development and deployment, see [Setting Up a Project](setting-up-a-project.md#project-setup).

```bash
# Build the program using Solana's BPF compiler
cargo build-sbf

# Deploy to local validator using Arch Network CLI
cli deploy ./target/deploy/helloworldprogram.so

# Note: Save your program ID for later use
export PROGRAM_ID=<DEPLOYED_PROGRAM_ADDRESS>
```

## Testing Your Deployment

> 💡 For troubleshooting deployment issues, refer to our [Troubleshooting Guide](../reference/troubleshooting.md).

## 🎮 Test Your Deployment

> 💡 For detailed testing strategies and examples, see our [Testing Guide](../guides/testing-guide.md).

```bash
# Verify program deployment
cli show $PROGRAM_ID

# Get program logs
cli get-logs $PROGRAM_ID

# Get block information
cli get-block <BLOCK_HASH>
```

### Next Steps

Congratulations! You've successfully deployed your first program. Here's what you can explore next:

- [Program Development Guide](../development/overview.md) - Learn about program architecture and best practices
- [Client Integration](../clients/overview.md) - Build client applications that interact with your program
- [Advanced Topics](../advanced/overview.md) - Explore advanced concepts and optimizations

## 🌐 Ready for Testnet?

When you're ready to deploy to testnet:
```bash
# Start validator in testnet mode
cli validator-start \
    --network-mode testnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint titan-node.test.aws.archnetwork.xyz \
    --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332

# Deploy program to testnet
cli deploy ./target/deploy/helloworldprogram.so --network-mode testnet

# Verify deployment
cli show <PROGRAM_ADDRESS> --network-mode testnet
```

> 💡 Note: Testnet deployments require additional setup and configuration. See our [Testnet Guide](../guides/testnet-deployment.md) for details.

## 📚 Next Steps

- [Modify the Hello World program](../guides/how-to-write-arch-program.md)
- [Create a fungible token](../guides/how-to-create-a-fungible-token.md)
- [Build a Runes swap application](../guides/how-to-build-runes-swap.md)
- [Set up a full validator node](bitcoin-and-titan-setup.md)

## 🆘 Need Help?

- Join our [Discord](https://discord.gg/archnetwork) for real-time support
- Check the [Troubleshooting Guide](troubleshooting.md)
- Browse the [FAQ](faq.md)