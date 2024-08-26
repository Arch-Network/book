# Starting the stack

Within [arch-local] there is a [compose.yaml] file. This is a descriptor for the pre-configured multi-container definition of the components required for standing up a local development environment.

### Configure

First, ensure that your Docker client is up-to-date and that the `DOCKER_DEFAULT_PLATFORM` environment variable is properly set (within your `~/.bashrc` or shell of choice) to your machine's architecture.

```bash
# Eg, for Apple-Silicon users:
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

**NOTE:** Additionally, if you have an Intel chip (ie, x86_64), you may encounter the following error when executing `docker compose up`; we recommend removing the `--platform=linux/arm64` flag within [Line 1: Dockerfile]:

```bash
=> ERROR [init-bootnode 2/3] RUN set -ex && apt-get update && apt-get install -qq --no-install-recommends curl jq               0.6s
------
 > [init-bootnode 2/3] RUN set -ex && apt-get update && apt-get install -qq --no-install-recommends curl jq:
0.314 exec /bin/sh: exec format error
------
failed to solve: process "/bin/sh -c set -ex \t&& apt-get update \t&& apt-get install -qq --no-install-recommends curl jq" did not complete successfully: exit code: 1
```

### Start
Once Docker is up and running, start the stack by issuing the following command:
```bash
docker compose up
```

If everything pulls and builds correctly, you should see something resembling the following in your Docker client logs: 
```bash
leader-1       | 2024-08-22T00:22:08.858084Z  INFO validator::roast::roast_leader: validator/src/roast/roast_leader.rs:54: Starting a new session with id 2
leader-1       | 2024-08-22T00:22:08.861441Z  INFO validator::roast::roast_entry_generation: validator/src/roast/roast_entry_generation.rs:65: Generated 1 block commitments for block id #3c2360fc4938d5f08a2ab8b0bc15f5ee54b42dc1cd61a8b906952e068f2a92d9 session #2
validator-2-1  | 2024-08-22T00:22:08.863250Z  INFO validator::roast::roast_entry_generation: validator/src/roast/roast_entry_generation.rs:65: Generated 1 block commitments for block id #3c2360fc4938d5f08a2ab8b0bc15f5ee54b42dc1cd61a8b906952e068f2a92d9 session #1
leader-1       | 2024-08-22T00:22:08.870662Z  INFO validator::roast::roast_leader: validator/src/roast/roast_leader.rs:152: Session 1 is ready for aggregation
validator-1-1  | 2024-08-22T00:22:08.870958Z  INFO validator::roast::roast_entry_generation: validator/src/roast/roast_entry_generation.rs:65: Generated 1 block commitments for block id #3c2360fc4938d5f08a2ab8b0bc15f5ee54b42dc1cd61a8b906952e068f2a92d9 session #2
leader-1       | 2024-08-22T00:22:08.874029Z  INFO validator::roast::roast_leader: validator/src/roast/roast_leader.rs:233: Successfully finished signatures in session 1
leader-1       | 2024-08-22T00:22:08.874064Z  INFO validator::roast::roast_verification: validator/src/roast/roast_verification.rs:199: Execution time for verify_and_prepare_block: 1.4333e-5 seconds
leader-1       | 2024-08-22T00:22:08.874071Z  INFO validator::utils: validator/src/utils.rs:320: Execution time for submit_block_to_btc: 2.1834e-5 seconds
leader-1       | 2024-08-22T00:22:08.875352Z  INFO validator::roast::roast_verification: validator/src/roast/roast_verification.rs:308: Successfully verified the block #3c2360fc4938d5f08a2ab8b0bc15f5ee54b42dc1cd61a8b906952e068f2a92d9 signature !
leader-1       | 2024-08-22T00:22:08.875367Z  INFO validator::roast::roast_block_result: validator/src/roast/roast_block_result.rs:69: 0 Transactions were submitted to btc network : []
leader-1       | 2024-08-22T00:22:08.876336Z  INFO validator::roast::roast_block_result: validator/src/roast/roast_block_result.rs:117: Block #3c2360fc4938d5f08a2ab8b0bc15f5ee54b42dc1cd61a8b906952e068f2a92d9 was finalized in session 1, I got 1 signatures and successfully verified the block signature !
```

[arch-local]: https://github.com/Arch-Network/arch-local
[compose.yaml]: https://github.com/Arch-Network/arch-local/blob/main/compose.yaml

