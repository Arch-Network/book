# HTTP Methods

Interact with Arch nodes directly with the JSON RPC API via this list of available HTTP methods.
 
> Note: For client-side needs, use the [@saturnbtcio/arch-sdk] library as an interface for the RPC methods to interact with an Arch node.

### Endpoint
Default port: `9002`
- http://localhost:9002

### Request Format:
To make a JSON-RPC request, send an HTTP `POST` request with a `Content-Type: application/json` header. 

The JSON request data should contain 4 fields:
- `jsonrpc: <string>` - set to "2.0."
- `id: <number>` - a unique client-generated identifying integer.
- `method: <string>` - a string containing the method to be invoked.
- `params: <array>` - a JSON array of ordered parameter values.

> Note: While this documentation uses camelCase for method names (e.g., `sendTransaction`), the actual implementation uses snake_case (e.g., `send_transaction`). Both formats are shown in each method's documentation.

### Response Format:
The response output will be a JSON object with the following fields:
- `jsonrpc: <string>` - matching the value set in the request.
- `id: <number>` - matching the value set in the request.
- `result: <array|boolean|number|object|string>` - requested data, success confirmation or boolean flag.

### Available Methods:
- [sendTransaction](./http-methods/send-transaction.md) - Send a single transaction to the network
- [sendTransactions](./http-methods/send-transactions.md) - Send multiple transactions to the network
- [getAccountAddress](./http-methods/get-account-address.md) - Get a Bitcoin address for an account
- [getProgramAccounts](./http-methods/get-program-accounts.md) - Get all accounts owned by a program
- [getBlock](./http-methods/get-block.md) - Get block information by hash
- [getBlockCount](./http-methods/get-block-count.md) - Get the current block count
- [getBlockHash](./http-methods/get-block-hash.md) - Get block hash by height
- [getCurrentState](./http-methods/get-current-state.md) - Get the current state of the node
- [getPeers](./http-methods/get-peers.md) - Get information about connected peers
- [getProcessedTransaction](./http-methods/get-processed-transaction.md) - Get details of a processed transaction
- [getTransactions](./http-methods/get-transactions.md) - Get a list of transactions with pagination and filtering
- [readAccountInfo](./http-methods/read-account-info.md) - Get information about an account
- [startDkg](./http-methods/start-dkg.md) - Start the DKG process
- [isNodeReady](./http-methods/is-node-ready.md) - Check if the node is ready
- [resetNetwork](./http-methods/reset-network.md) - Reset the network state

<!-- External -->
[@saturnbtcio/arch-sdk]: https://www.npmjs.com/package/@saturnbtcio/arch-sdk
