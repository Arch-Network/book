# Starting the stack

## Choose a track
There are 2 tracks that developers can take when using `arch-cli`:
1. [Program-only]
  - A single-node execution environment for testing program logic.
2. [Complete dApp]
  - A complete, multi-node execution environment with consensus for testing a full-stack web dApp.

_If you aren't sure where to start, stick with [Program-only]!_

## Program-only
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

## Complete dApp
This spins up a local Arch network complete with 3 network [nodes], a front-end and backend server for your dApp, as well as an indexer, a block explorer and a Bitcoin node!
  
_This is more resource intensive for your machine but includes all of the components that the main Arch network comprises of._

> Tip: We recommend moving here as a next-step after successfully deploying and testing your business logic within the [Program-only] track.

Within `arch-cli`, there exist 3 configuration files needed to provision the various services:
1. [arch-docker-compose.yml]
2. [bitcoin-docker-compose.yml]
3. [btc-rpc-explorer.dockerfile]

These files comprise the pre-configured, multi-container definition of the components required for standing up a local development environment.

### Configure

First, ensure that your Docker client is up-to-date and that the `DOCKER_DEFAULT_PLATFORM` environment variable is properly set (within your `~/.bashrc` or shell of choice) to your machine's architecture.

```bash
# Eg, for Apple-Silicon users:
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

#### Declare your `config.toml`

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

### Start the services

Now that the arch-cli is properly configured, our next step will be to `start` the development cluster which will provision the Arch network stack. 

```bash
arch-cli server start
```

If everything pulls and builds correctly, you should see something resembling the following in your logs: 
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Starting the development server...
  ✓ Bitcoin started.
[+] Running 10/10
 ✔ leader Pulled 6.7s
 ✔ validator-2 Pulled 6.7s
 ✔ validator-1 Pulled 6.7s
 ✔ init Pulled 6.7s
 ✔ bootnode Pulled 6.6s
[+] Running 7/7
 ✔ Network arch-cli_arch-network Created 0.0s
 ✔ Network arch-cli_default Created 0.0s
 ✔ Container arch-cli-init-1  Started 0.5s
 ✔ Container arch-cli-bootnode-1  Started 0.3s
 ✔ Container arch-cli-leader-1  Started 0.4s
 ✔ Container arch-cli-validator-1-1  Started 0.5s
 ✔ Container arch-cli-validator-2-1  Started 0.6s
  ✓ Development server started successfully
```

### Manage the services

The following commands can be used stop, check the status of, and view logs for the development environment, including the Bitcoin regtest network and Arch Network nodes.

```bash
arch-cli server status
```

The following is an example output from querying the server status.

```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Checking development server status...
  → Checking Bitcoin regtest network status...
    ✓ bitcoin is running
    ✓ electrs is running
    ✓ btc-rpc-explorer is running
  → Checking Arch Network nodes status...
    ✓ bootnode is running
    ✓ leader is running
    ✓ validator-1 is running
    ✓ validator-2 is running
```

We'll reference these later in the book. For now, familiarize yourself with starting, stopping and viewing the logs from the stack.

```bash
arch-cli server stop
arch-cli server logs [<service>]
```

Additionally, issuing the `clean` subcommand will remove existing Docker volumes and networks as a convenience.
```bash
arch-cli server clean
```

[Program-only]: #program-only
[Complete dApp]: #complete-dapp
[nodes]: ../concepts/nodes.md
[arch-docker-compose.yml]: https://github.com/Arch-Network/arch-cli/blob/main/arch-docker-compose.yml
[bitcoin-docker-compose.yml]: https://github.com/Arch-Network/arch-cli/blob/main/bitcoin-docker-compose.yml
[btc-rpc-explorer.dockerfile]: https://github.com/Arch-Network/arch-cli/blob/main/btc-rpc-explorer.dockerfile
