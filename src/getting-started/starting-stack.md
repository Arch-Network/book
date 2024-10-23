# Starting the stack

## Configure

### Docker

First, ensure that your Docker client is up-to-date and that the `DOCKER_DEFAULT_PLATFORM` environment variable is properly set (within your `~/.bashrc` or shell of choice) to your machine's architecture.

```bash
# Eg, for Apple-Silicon users:
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

### `Config.toml`

Before using `arch-cli`, you need to set up a `config.toml` file. By default, the CLI will look for this file in the following locations:
- Linux: `~/.config/arch-cli/config.toml`
- macOS: `~/Library/Application Support/arch-cli/config.toml`
- Windows: `C:\Users\<User>\AppData\Roaming\arch-cli\config.toml`

If the configuration file is not found, a default configuration file will be created automatically using the `config.default.toml` template which can then be renamed to `config.toml` if you don't wish to create your own.

You can also specify a custom configuration file location by setting the `ARCH_CLI_CONFIG` environment variable:

```bash
export ARCH_CLI_CONFIG=/path/to/your/config.toml
```

Here's the default configuration:

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

By following these steps, you ensure that your CLI can be run from any location and still correctly locate and load its configuration files on Windows, macOS, and Linux.

## Start the validator

This spins up a lightweight validator that effectively serves the purpose of testing program deployment and functionality by simulating a single-node blockchain environment locally.
  
This is much less resource intensive for your machine and includes only the VM component needed to test business logic.

> Tip: We recommend starting here to begin development, test and refine your program logic before moving to the [Complete dApp] step.

The following commands will assist you in provisioning the local validator. Simply `start` the validator to begin testing your program logic.

```bash
arch-cli validator start [options]
```

If everything pulls and builds correctly, you should see something resembling the following in your logs:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Starting the local validator...
Local validator started successfully!
```

To stop the validator, simply issue the corresponding `stop` command.
```bash
arch-cli validator stop
```

If everything stops correctly, you should something resembling the following in your logs:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Stopping the local validator...
Local validator stopped successfully!
```

[nodes]: ../concepts/nodes.md
