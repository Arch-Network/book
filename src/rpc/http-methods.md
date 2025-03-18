# HTTP Methods

Interact with Arch nodes directly with the JSON RPC API via this list of available HTTP methods.
 
> Note: For client-side needs, use the [@saturnbtcio/arch-sdk] library as an interface for the RPC methods to interact with an Arch node. Alternatively, the new Arch Network CLI tool provides convenient commands to interact with the network.

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

### Response Format:
The response output will be a JSON object with the following fields:
- `jsonrpc: <string>` - matching the value set in the request.
- `id: <number>` - matching the value set in the request.
- `result: <array|boolean|number|object|string>` - requested data, success confirmation or boolean flag.

### CLI Alternative
Many of these RPC methods can be accessed through the Arch Network CLI tool with simpler commands:

```bash
# Start a local validator
cli validator start

# Deploy a program
cli deploy <ELF_PATH>

# Show program information
cli show <PROGRAM_ADDRESS>

# Confirm transaction status
cli confirm <TX_ID>

# Get block information
cli get-block <BLOCK_HASH>

# Get current block height
cli get-block-height

# Log program messages in a transaction
cli log-program-messages <TX_ID>

# Get group key
cli get-group-key <PUBKEY>

# Change account owner
cli change-owner <ACCOUNT_ADDRESS> <NEW_OWNER>
```

For more details on the CLI tool, download the latest version from the [Arch Network CLI releases page].

<!-- External -->
[@saturnbtcio/arch-sdk]: https://www.npmjs.com/package/@saturnbtcio/arch-sdk
[Arch Network CLI releases page]: https://github.com/Arch-Network/arch-node/releases/latest

<!-- Note: The main Arch Network repository is not yet publicly accessible. -->
