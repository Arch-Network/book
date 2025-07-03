# RPC API Reference

The Arch Network provides a comprehensive JSON-RPC API for interacting with validator nodes. This API allows you to:

- Query account information and balances
- Submit transactions to the network
- Retrieve block and transaction data
- Monitor network state and readiness
- Manage validator operations

## API Endpoints

### Default Configuration
- **Default Port**: `9002` for validator nodes, `9001` for local validators
- **Endpoint URL**: `http://localhost:9002` (or your node's IP address)
- **Protocol**: HTTP POST with JSON-RPC 2.0

### Request Format
All RPC requests must be sent as HTTP `POST` requests with:
- **Content-Type**: `application/json`
- **JSON-RPC Version**: `"2.0"`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "method_name",
  "params": [/* parameters */]
}
```

### Response Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {/* response data */}
}
```

## Available Methods

The following RPC methods are available:

### Account Operations
- [`read_account_info`](http-methods.md#read_account_info) - Get account information
- [`get_account_address`](http-methods.md#get_account_address) - Get Bitcoin address for account
- [`get_program_accounts`](http-methods.md#get_program_accounts) - Query accounts by program ID
- [`get_multiple_accounts`](http-methods.md#get_multiple_accounts) - Get multiple accounts at once

### Transaction Operations  
- [`send_transaction`](http-methods.md#send_transaction) - Submit a single transaction
- [`send_transactions`](http-methods.md#send_transactions) - Submit multiple transactions
- [`get_processed_transaction`](http-methods.md#get_processed_transaction) - Get transaction status and details

### Block Operations
- [`get_block`](http-methods.md#get_block) - Get block by hash
- [`get_block_by_height`](http-methods.md#get_block_by_height) - Get block by height
- [`get_block_count`](http-methods.md#get_block_count) - Get current block count
- [`get_block_hash`](http-methods.md#get_block_hash) - Get block hash by height
- [`get_best_block_hash`](http-methods.md#get_best_block_hash) - Get latest block hash

### Network Operations
- [`is_node_ready`](http-methods.md#is_node_ready) - Check node readiness
- [`start_dkg`](http-methods.md#start_dkg) - Initiate Distributed Key Generation
- [`reset_network`](http-methods.md#reset_network) - Reset network state (leader only)

## SDK Integration

For easier integration, use the official SDK:
- **TypeScript/JavaScript**: `@saturnbtcio/arch-sdk`
- **Rust**: `arch_sdk` crate

## CLI Alternative

Most RPC operations can also be performed using the [Arch Network CLI](../getting-started/quick-start.md#cli-alternative):

```bash
# Deploy a program
arch-cli deploy <ELF_PATH>

# Check transaction status  
arch-cli confirm <TX_ID>

# Get account information
arch-cli account <ACCOUNT_ADDRESS>
```

For detailed examples and parameter specifications, see the [HTTP Methods](http-methods.md) reference.
