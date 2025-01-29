# Setting up an Arch Network Project

This guide walks you through creating your first Arch Network project using the arch-cli tool. You'll learn how to set up, build, and deploy a "Hello World" program to the Arch Network.

<div class="terminal-animation">
  <img src="../assets/setup-project-demo.gif" alt="Project Setup Animation" />
</div>

## Prerequisites

Before starting, ensure you have the following dependencies installed:
- Arch-Cli(v1.0)
- Cargo(v1.81.0 or later)
- Bitcoin Core and Electrs: Required for local validation

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
```
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

> Important: Ensure Bitcoin Core and Electrs are properly configured and running before starting the validator. See the setup guide for details.

### 4. Deploy the program 

Deploy your compiled program to the local Arch Network:

```bash
# Deploy the program
arch-cli deploy
```


### Troubleshooting
Common issues and solutions:

- If cargo build-sbf fails:
  - Ensure you have the latest version of Rust and Cargo
  - Check that all dependencies are properly installed


- If validator fails to start:
  - Verify Bitcoin Core and Electrs are running
  - Check the logs for specific error messages