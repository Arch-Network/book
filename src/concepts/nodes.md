# Nodes

Let's introduce the nodes that comprise the Arch Network stack within Docker in greater detail.

1. [The Bootnode](https://github.com/Arch-Network/arch-local/blob/main/compose.yaml#L2)

    This node is the entrypoint for other nodes and serves as the leader/coordinator of the network. All signing is coordinated by the leader. Ultimately, the leader submits signed Bitcoin transactions to the Bitcoin network following program execution.

2. [The Validator Node](https://github.com/Arch-Network/arch-local/blob/main/compose.yaml#L38)

    This node represents a generic node operated by another party. It performs the validator role and has a share in the network's distributed signing key. The leader node passes transactions to validator nodes to validate and sign. After enough signatures have been collected (a threshold has been met), the leader can then submit a fully signed Bitcoin transaction to the Bitcoin network.

3. [The zkVM](https://github.com/Arch-Network/arch-local/blob/main/compose.yaml#L68)

    This node represents the execution environment for the smart contracts that normally runs on the leader's hardware. The leader sends the program request to the zkVM which executes it and generates outputs (execution receipts) as a result of these computations; the results are then shared back to the leader.

    The leader node then submits the receipts, program data, and completed state transitions to the validator pool to validate and sign.

More can be read about the Arch Network architecture in our [docs](https://arch-network.gitbook.io/arch-documentation/fundamentals/arch-architecture).
