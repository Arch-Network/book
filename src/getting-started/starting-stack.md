# Starting the stack

## Configure

### Docker

First, ensure that your Docker client is up-to-date and that the `DOCKER_DEFAULT_PLATFORM` environment variable is properly set (within your `~/.bashrc` or shell of choice) to your machine's architecture.

```bash
# Eg, for Apple-Silicon users:
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

## Start the validator

This spins up a lightweight validator that effectively serves the purpose of testing program deployment and functionality by simulating a single-node blockchain environment locally.

This setup is much less resource intensive than running the [Self-contained Arch Network] and includes only the VM component needed to test business logic.

> Note: If you are looking to work on core components of Arch Network or would like to understand how Arch validators communicate with one another, we recommend looking into the [Self-contained Arch Network] setup.

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

Now that everything is configured and the local validator is up and running, it's time learn how to build, deploy and interact with a program.

<!-- Internal -->
[nodes]: ../concepts/nodes.md

<!-- External -->
[Self-contained Arch Network]: https://github.com/arch-Network/arch-cli?tab=readme-ov-file#manage-a-self-contained-arch-network-locally-advanced
