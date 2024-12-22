# Setting up an Arch Network Project

This guide will walk you through setting up a new Arch Network project using the `arch-cli` tool.

<div class="terminal-animation">
  <img src="../assets/setup-project-demo.gif" alt="Project Setup Animation" />
</div>

## Prerequisites

Before starting, ensure you have the following dependencies installed:
- Docker (v27.3.1 or later)
- Docker Compose (v2.29.7 or later)
- Node.js (v22.9.0 or later)
- Solana CLI (v1.18.22 or later)
- Cargo (v1.81.0 or later)

## Project Setup Process

### 1. Initialize the CLI Environment

First, run the initialization command:

```bash
arch-cli init
```

This command will:
1. Create the necessary folder structure
2. Set up boilerplate code
3. Configure Docker settings
4. Create a default configuration file

### 2. Configuration Setup

The CLI uses a `config.toml` file for managing settings. This file will be automatically created during initialization.

#### Configuration File Location

The default locations for `config.toml` are:
- Linux: `~/.config/arch-cli/config.toml`
- macOS: `~/Library/Application Support/arch-cli/config.toml`
- Windows: `C:\Users\<User>\AppData\Roaming\arch-cli\config.toml`

You can specify a custom location using:
```bash
export ARCH_CLI_CONFIG=/path/to/your/config.toml
```

#### Key Configuration Settings

The `config.toml` file contains important settings for:
- Network configuration
- Bitcoin node settings
- Program keys
- Service ports
- Arch network parameters

For reference, here's the default configuration structure:

```toml
[network]
type = "development"

[bitcoin]
docker_compose_file = "./bitcoin-docker-compose.yml"
network = "regtest"
rpc_endpoint = "http://localhost:18443"
rpc_port = "18443"
rpc_user = "bitcoin"
rpc_password = "password"
rpc_wallet = "devwallet"
services = ["bitcoin", "electrs", "btc-rpc-explorer"]

# ... Additional configuration sections ...
# See full example in documentation
```

### 3. Create a New Project

Once the CLI is initialized, you can create a new project using:

```bash
arch-cli project create --name my_app
```

This will:
1. Create a new project directory in your configured location
2. Set up the necessary project structure
3. Configure project-specific settings

#### Project Structure

Your project will be organized as follows:
```
sample/
├─ app/                    # Frontend application
│  ├─ frontend/
│  │  ├─ node_modules/    # Frontend dependencies
│  │  ├─ public/         # Static assets
│  │  ├─ src/           # Frontend source code
│  │  ├─ eslint.config.js
│  │  ├─ index.html
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  └─ vite.config.js
├─ program/              # Backend program
│  ├─ src/
│  │  └─ lib.rs        # Rust source code
│  ├─ Cargo.lock
│  └─ Cargo.toml
```

## Next Steps

After setting up your project:
1. Review the generated `config.toml` file
2. Familiarize yourself with the project structure
3. Begin development in your project directory

For more detailed information about specific components, refer to their respective documentation sections.
