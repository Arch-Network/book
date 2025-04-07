# How to configure the local validator with Bitcoin Testnet4

This guide is intended for those wishing to view logs from their programs while benefitting from being connected to Bitcoin testnet4 and therefore gaining access to ordinals/runes helper tools.

Table of Contents:
- [Config]
- [Local validator]
- [Help commands]
- [Log assistance]

### Config

First, you'll need to configure the network settings for connecting to Bitcoin testnet4. The CLI accepts these parameters directly when starting the validator.

> Note: We have redacted our Bitcoin node password to prevent abuse; contact us if you need this, otherwise provide your own node credentials and use the below as a reference.

When starting the validator, you can include the following parameters:

```bash
cli validator-start \
  --network-mode testnet \
  --data-dir ./.arch_data \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 9002 \
  --titan-endpoint titan-node.test.aws.archnetwork.xyz \
  --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
```

Optional parameters:
- `--data-dir` - Directory for storing validator data (default: ./.arch_data)
- `--rpc-bind-ip` - IP Address for the RPC handler (default: 127.0.0.1)
- `--rpc-bind-port` - Port for the RPC handler (default: 9002)
- `--titan-endpoint` - HTTP endpoint for the Titan node
- `--titan-socket-endpoint` - WebSocket endpoint for the Titan node

### Local validator
> Note: You can start a local validator using the Arch Network CLI tool.
>
> Additionally, you can download pre-built binaries from the [arch-node releases page](https://github.com/Arch-Network/arch-node/releases). 
> 
> **Be sure to download the local validator binary, not the regular validator.**

#### Run the local validator
Use the CLI command to run the local validator. You'll need to have [Docker] installed and running.

```bash
cli validator-start --network-mode testnet
```

The validator logs can be viewed easily within the [Docker] desktop dashboard.

> Note: You can also run the standalone local validator binary where the logs will be streamed to `stdout` unless otherwise redirected.

**Steps for running standalone validator binary:**
1. Download the appropriate binary as well as the `system_program.so` file from [arch-node releases page](https://github.com/Arch-Network/arch-node/releases/latest).
2. Store the `system_program.so` file within a new directory called `/ebpf`.

    Your directory structure should resemble the following:
    ```bash
    tmp/
    ├─ ebpf/
    │  ├─ system_program.so
    ├─ local_validator
    ```

3. Run the binary and pass the relevant flags dependening on your target network.
    ```bash
    RUST_LOG=info \
    ./local_validator \
    --network-mode testnet \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint titan-node.test.aws.archnetwork.xyz \
    --titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
    ```

### Help commands
This section includes some helpful material when needing to restart the node state or better ensure our infrastructure is operational before proceeding.

#### Arch node

The below commands can be used to assist with running the [Local validator].

##### Start fresh

By removing the `/.arch_data` directory, we can wipe the state and effective start the node again from genesis (block: 0).

```bash
rm -rf .arch_data && RUST_LOG=info \
./local_validator \
--network-mode testnet \
--rpc-bind-ip 127.0.0.1 \
--rpc-bind-port 9002 \
--titan-endpoint titan-node.test.aws.archnetwork.xyz \
--titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332
```

##### Pulse check

This `cURL` command will allow us to ensure that our [Local validator] is up and running correctly. We can use this to effective get a pulse check on the node which is helpful for debugging.

```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"is_node_ready",
    "params":[]
}' \
http://localhost:9002/
```

### Log assistance

Ordinarily, the arch-node logs will flood your terminal screen (or the [Docker] logs). This is less than idea when needing to review them carefully, so you can also direct the `stdout` to a file for later reading.

Here's an example of how to do this:
```bash
rm -rf .arch_data && RUST_LOG=info \
./local_validator \
--network-mode testnet \
--rpc-bind-ip 127.0.0.1 \
--rpc-bind-port 9002 \
--titan-endpoint titan-node.test.aws.archnetwork.xyz \
--titan-socket-endpoint titan-node.test.aws.archnetwork.xyz:49332 \
> node-logs.txt
```

Then you can `tail` the output and view the logs as they stream in.
```bash
tail -f node-logs.txt
```

### Deploy + interact
Now that everything is setup correctly, we can now deploy our program and begin interacting with it. The deploy step will prove everything works correctly.

```bash
cli deploy --network-mode testnet
```

And if you are running the local validator binary directly from the command-line, set the `--rpc-url` flag to specify your validator endpoint:
```bash
cli deploy --network-mode testnet --rpc-url http://localhost:9002
```

We hope this guide has been helpful, but as always, feel free to ask question within our [Discord dev-chat] or submit issues within out [public-issues] repo.

<!-- Internal -->
[Config]: #config
[Local validator]: #local-validator
[Help commands]: #help-commands
[Log assistance]: #log-assistance

<!-- External -->
[arch-node]: https://github.com/arch-network/arch-node/releases
[Docker]: https://docker.com
[Discord dev-chat]: https://discord.com/channels/1241112027963986001/1270921925991989268
[public-issues]: https://github.com/arch-network/public-issues
