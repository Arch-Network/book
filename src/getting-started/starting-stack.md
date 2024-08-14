# Starting the stack

Within the [arch-local repository](https://github.com/Arch-Network/arch-local) there is a `compose.yaml` file. This is a descriptor for the multi-container Arch Network stack. 

It contains a pre-configured definition of the components required for local development.

### Configure Docker

First, ensure that your [Docker](https://www.docker.com/) client is up-to-date and that the `DOCKER_DEFAULT_PLATFORM` environment variable is properly set (within your `~/.bashrc` or shell of choice) to your machine's architecture.

```bash
# Eg, for Apple-Silicon users:
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

Once Docker is up and running, start the stack by issuing the following command:
```bash
docker compose up
```

If everything pulls and builds correctly, you should see something resembling the following in your Docker client logs: 
```bash
2024-08-05 10:09:41 arch-node-1      | [2024-08-05T17:09:41Z INFO  dkg::participant] Finished round 3
2024-08-05 10:09:41 bootnode-1       | [2024-08-05T17:09:41Z INFO  dkg::participant] Finished round 3
2024-08-05 10:09:41 zkvm-1           | [2024-08-05T17:09:41Z INFO  dkg::participant] Finished round 3
2024-08-05 10:09:41 init-bootnode-1  | {"jsonrpc":"2.0","result":"tb1p7xq37ajlargykmkdrsn8p0qg9jxsvvwefje07x0ydpz5yvujv5gq4ck3gh","id":"id"}
2024-08-05 10:09:41 init-bootnode-1  | Done!
2001-01-01 00:00:00 xited with code 0
```
