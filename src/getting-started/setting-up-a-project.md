# Setting up an Arch Network Project

This guide walks you through creating your first Arch Network project. You'll learn how to set up, build, and deploy a "Hello World" program to the Arch Network using the Arch Network CLI tool.

## Prerequisites

Before starting, ensure you have the following dependencies installed:
- Arch Network CLI (Latest)
- Solana CLI (Latest stable version)
- Cargo (v1.81.0 or later)
- Rust (Latest stable version)
- Bitcoin Core and Titan: Required for local validation

## Project Setup

### 1. Clone the Example Repository

Start by cloning the Arch Network examples repository:

```bash
# Clone the examples repository
git clone https://github.com/Arch-Network/arch-examples.git

# Navigate to the Hello World example
cd arch-examples/examples/helloworld
```

### Project Structure
After cloning, you'll see the following project structure:

The helloworld folder should look like this:

```ignore

helloworld/
├── Cargo.toml              # Workspace configuration
├── program/                # Program directory containing on-chain code
│   ├── Cargo.lock
│   ├── Cargo.toml         # Program dependencies
│   └── src/
│       └── lib.rs         # Program logic
└── src/                   # Client-side code
    └── lib.rs             # Client interface
```

### 2. Build the program

Build the program using the Solana BPF compiler:

```bash
# Navigate to the program directory
cd program

# Build the program using Solana's BPF compiler
cargo build-sbf
```

This command compiles your Rust code into a format that can be deployed to the Arch Network.

### 3. Start the local validator
Start a local validator for testing:

```bash
# Start the Arch Network validator
arch-cli validator-start
```

> Important: Ensure Bitcoin Core and Titan are properly configured and running before starting the validator. See the setup guide for details.

### 4. Deploy the program

Deploy your compiled program to the local Arch Network:

```bash
# Deploy the program
arch-cli deploy ./target/deploy/
```


### Troubleshooting
Common issues and solutions:

- If cargo build-sbf fails:
  - Ensure you have the latest version of Rust and Cargo
  - Check that all dependencies are properly installed


- If validator fails to start:
  - Verify Bitcoin Core and Titan are running
  - Check the logs for specific error messages

## Additional CLI Commands

For more advanced operations, the Arch Network CLI provides additional commands:

```bash
# Show program information
arch-cli show <PROGRAM_ADDRESS>

# Confirm transaction status
arch-cli confirm <TX_ID>

# Get block information
arch-cli get-block <BLOCK_HASH>

# Get block height
arch-cli get-block-height
```

For a complete list of available commands, refer to the [Arch Network CLI documentation](https://github.com/Arch-Network/arch-node/releases/latest).
