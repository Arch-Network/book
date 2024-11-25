# Setting up a project

## Initialize
The `init` subcommand initializes an Arch Network project with the necessary folder structure, boilerplate code, and Docker configurations.

### `Config.toml`

The `arch-cli` relies on a configuration file called `config.toml` that is created during this [Initialize] step.

It is recommended to understand the `config.toml` file well as it is the source of node configurations as well as manages the location of your Arch projects and respective keys.

By default, the CLI will look for this file in the following locations:
- Linux: `~/.config/arch-cli/config.toml`
- macOS: `~/Library/Application Support/arch-cli/config.toml`
- Windows: `C:\Users\<User>\AppData\Roaming\arch-cli\config.toml`

If the configuration file is not found, a default configuration file will be created automatically using the `config.default.toml` template which can then be renamed to `config.toml` if you don't wish to create your own.

You can also specify a custom configuration file location by setting the `ARCH_CLI_CONFIG` environment variable:

```bash
export ARCH_CLI_CONFIG=/path/to/your/config.toml
```

Here's the default configuration, but don't worry about copying this as it will already be created for you:

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

[program]
key_path = "${CONFIG_DIR}/keys/program.json"

[electrs]
rest_api_port = "3003"
electrum_port = "60401"

[btc_rpc_explorer]
port = "3000"

[demo]
frontend_port = "5173"
backend_port = "5174"

[indexer]
port = "5175"

[ord]
port = "3032"

[arch]
docker_compose_file = "./arch-docker-compose.yml"
network_mode = "localnet"
rust_log = "info"
rust_backtrace = "1"
bootnode_ip = "172.30.0.10"
bootnode_p2p_port = "19001"
leader_p2p_port = "19002"
leader_rpc_port = "9002"
leader_rpc_endpoint = "http://localhost:9002"
validator1_p2p_port = "19003"
validator1_rpc_port = "9003"
validator2_p2p_port = "19004"
validator2_rpc_port = "9004"
bitcoin_rpc_endpoint = "bitcoin"
bitcoin_rpc_wallet = "devwallet"
services = ["bootnode", "leader", "validator-1", "validator-2"]
replica_count = 2
```

Run the subcommand to setup the `arch-cli` for development.

```bash
arch-cli init
```

> Note: This step will prompt you to provide a location on your hard drive where you'd like new Arch projects to be created; this location is then stored within the `config.toml` and can be updated accordingly.
> 
> The default location for new Arch projects is within your `/Documents` directory.


If everything initializes smoothly, you'll be presented with output similar to the following:
```bash
Welcome to the Arch Network CLI
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
Initializing new Arch Network app...
Checking required dependencies...
  → Checking docker... ✓
    Detected version: Docker version 27.3.1, build ce1223035a
  → Checking docker-compose... ✓
    Detected version: Docker Compose version 2.29.7
  → Checking node... ✓
    Detected version: v22.9.0
  → Checking solana... ✓
    Detected version: solana-cli 1.18.22 (src:b286211c; feat:4215500110, client:SolanaLabs)
  → Checking cargo... ✓
    Detected version: cargo 1.81.0 (2dbb1af80 2024-08-20)
All required dependencies are installed.
Where would you like to create your Arch Network project?
Default: /Users/jr/Documents/ArchNetwork
Project directory (press Enter for default):
  ⚠ Directory is not empty. Do you want to use this existing project folder? (y/N)
y
  ✓ Using existing project folder
  ✓ Created arch-data directory at "/Users/jr/Library/Application Support/arch-cli/arch-data"
  ✓ Copied default configuration to "/Users/jr/Library/Application Support/arch-cli/config.toml"
  ✓ Updated configuration with project directory
  ✓ New Arch Network app initialized successfully!
```

By following these steps, you ensure that your CLI can be run from any location and still correctly locate and load its configuration files on Windows, macOS, and Linux.

## Create a new project
To create a new project, the `arch-cli` offers a `project create` directive that will setup a new project directory in the location set in the `config.toml`.

Simply issue the following command and pass the name of your project in:
```bash
arch-cli project create --name my_app
```

And the corresponding output:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Creating a new project...
  ✓ Updated configuration with project directory
  ✓ Created project directory at "/Users/jr/Documents/ArchNetwork/projects/my_app"
```

You will find all of the necessary crates for development (eg, `/program`, `/sdk` and `/bip322`) available at the root of `/ArchNetwork`. 

In this way, all projects will be able to access the necessary Arch dependencies without needing to manage them within each project.

Example:
```bash
ArchNetwork/
├─ bip322/
├─ program/
├─ projects/
│  ├─ my_app/
├─ sdk/
```

<!-- Internal -->
[Initialize]: #initialize
