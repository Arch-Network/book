# How to configure the local validator with Bitcoin Testnet4

This guide is intended for those wishing to view logs from their programs while benefitting from being connected to Bitcoin testnet4 and therefore gaining access to ordinals/runes helper tools.

Table of Contents:
- [Config]
- [Local validator]
- [Help commands]
- [Log assistance]

### Config

First, edit the [arch-cli] configuration file and insert the following details into the `testnet` section. 

```bash
arch-cli config edit
```

> Note: We have redacted our Bitcoin node password to prevent abuse; contact us if you need this, otherwise provide your own node credentials and use the below as a reference.

Your [arch-cli] configuration file should resemble something like the following, with the `leader_rpc_endpoint` being the endpoint for reaching your [Local validator], which defaults to port `9002`.

```toml
[networks.testnet]
type = "testnet"
bitcoin_rpc_endpoint = "bitcoin-node.test.aws.archnetwork.xyz"
bitcoin_rpc_port = "49332"
bitcoin_rpc_user = "bitcoin"
bitcoin_rpc_password = "redacted"
bitcoin_rpc_wallet = "testwallet"
leader_rpc_endpoint = "http://localhost:9002"
```

### Local validator
> Note: the [arch-cli] (and Docker) can be used to run the local validator.
>
> Additionally, if you do not already have the local validator installed, please pull it from the [arch-node] releases page. 
> 
> **Be sure to download the local variant, not the regular validator.**

#### Run the local validator
Use the [arch-cli] command to run the local validator. You'll need to have [Docker] installed and running.

```bash
arch-cli validator start
```

The validator logs can be viewed easily within the [Docker] desktop dashboard.

You can also run the standalone binary yourself where the logs will be streamed to `stdout` unless otherwise redirected.
```bash
RUST_LOG=info \
./local_validator \
--network-mode testnet \
--rpc-bind-ip 127.0.0.1 \
--rpc-bind-port 9002 \
--bitcoin-rpc-endpoint bitcoin-node.test.aws.archnetwork.xyz \
--bitcoin-rpc-port 49332 \
--bitcoin-rpc-username bitcoin \
--bitcoin-rpc-password redacted
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
...
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
--bitcoin-rpc-endpoint bitcoin-node.test.aws.archnetwork.xyz \
--bitcoin-rpc-port 49332 \
--bitcoin-rpc-username bitcoin \
--bitcoin-rpc-password redacted \
> node-logs.txt
```

Then you can `tail` the output and view the logs as they stream in.
```bash
tail -f node-logs.txt
```

### Deploy + interact
Now that everything is setup correctly, we can now deploy our program and begin interacting with it. The deploy step will prove everything works correctly.

```bash
arch-cli deploy --network testnet
```

We hope this guide has been helpful, but as always, feel free to ask question within our [Discord dev-chat] or submit issues within out [public-issues] repo.

<!-- Internal -->
[Config]: #config
[Local validator]: #arch-node
[Help commands]: #help-commands
[Log assistance]: #log-assistance

<!-- External -->
[arch-cli]: https://github.com/arch-network/arch-cli
[arch-node]: https://github.com/arch-network/arch-node/releases
[Docker]: https://docker.com
[Discord dev-chat]: https://discord.com/channels/1241112027963986001/1270921925991989268
[public-issues]: https://github.com/arch-network/public-issues