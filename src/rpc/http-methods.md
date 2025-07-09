# HTTP Methods

This page provides detailed documentation for all available RPC methods in the Arch Network JSON-RPC API.

## Endpoint Configuration

- **Default Port**: `9002` for validator nodes, `9001` for local validators  
- **URL**: `http://localhost:9002` (replace with your node's address)
- **Content-Type**: `application/json`

## Account Operations

### read_account_info

Retrieves information for a specified account.

**Parameters:**
1. `pubkey` - Account public key as a 32-byte array

**Returns:** Account information object with `data`, `owner`, `utxo`, `is_executable`, and `tag` fields.

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"read_account_info",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' http://localhost:9002/
```

### get_account_address

Retrieves the Bitcoin address for a given account public key.

**Parameters:**
1. `account_pubkey` - Account public key as a 32-byte array

**Returns:** Bitcoin address string (format depends on network mode)

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_account_address",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32] 
    ]
}' http://localhost:9002/
```

### get_program_accounts

Fetches all accounts owned by a specified program ID.

**Parameters:**
1. `program_id` - Program public key as a 32-byte array
2. `filters` (optional) - Array of filter objects:
   - `{ "DataSize": <size> }` - Filter by account data size
   - `{ "DataContent": { "offset": <offset>, "bytes": <byte_array> } }` - Filter by data content

**Returns:** Array of account objects with `pubkey` and `account` information.

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method": "get_program_accounts",
  "params": [
    [80,82,242,228,43,246,248,133,88,238,139,124,88,96,107,32,71,40,52,251,90,42,66,176,66,32,147,203,137,211,253,40],
    [
      {
        "DataSize": 165
      },
      {
        "DataContent": {
          "offset": 0,
          "bytes": [1, 2, 3, 4]
        }
      }
    ]
  ]
}' http://localhost:9002/
```

### get_multiple_accounts

Retrieves information for multiple accounts in a single request.

**Parameters:**
1. `pubkeys` - Array of account public keys (32-byte arrays)

**Returns:** Array of account information objects.

### request_airdrop

Requests airdrop of lamports to a specified account (development networks only).

**Parameters:**
1. `pubkey` - Account public key as a 32-byte array

**Returns:** Transaction ID string of the airdrop transaction

**Note:** Only available on non-mainnet networks (testnet, devnet, regtest).

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"request_airdrop",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' http://localhost:9002/
```

### create_account_with_faucet

Creates a new account and funds it using the faucet (development networks only).

**Parameters:**
1. `pubkey` - Account public key as a 32-byte array

**Returns:** RuntimeTransaction object for the account creation

**Note:** Only available on non-mainnet networks (testnet, devnet, regtest).

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"create_account_with_faucet",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' http://localhost:9002/
```

## Transaction Operations

### send_transaction

Submits a single transaction to the network.

**Parameters:**
1. `transaction` - RuntimeTransaction object containing:
   - `version` - Transaction version (currently 0)
   - `signatures` - Array of transaction signatures
   - `message` - Transaction message with signers and instructions

**Returns:** Transaction ID (txid) string

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"send_transaction",
    "params":[{
        "version": 0,
        "signatures": [
            {"0": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]}
        ],
        "message": {
            "signers": [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]],
            "instructions": [
                {
                    "program_id": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
                    "accounts": [
                        {
                            "pubkey": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
                            "is_signer": true,
                            "is_writable": true
                        }
                    ],
                    "data": [1,2,3,4]
                }
            ]
        }
    }]
}' http://localhost:9002/
```

### send_transactions

Submits multiple transactions to the network.

**Parameters:**
1. `transactions` - Array of serialized transactions (byte arrays)

**Returns:** Array of transaction ID strings

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"send_transactions",
    "params": [
        [
            [1,2,3,4,5,6,7,8,9,10],
            [11,12,13,14,15,16,17,18,19,20]
        ]
    ]
}' http://localhost:9002/
```

### get_processed_transaction

Retrieves a processed transaction and its status.

**Parameters:**
1. `transaction_id` - Transaction ID string

**Returns:** Object containing `runtime_transaction`, `status`, and `bitcoin_txids`

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_processed_transaction",
    "params":[
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    ]
}' http://localhost:9002/
```

### recent_transactions

Retrieves recent transactions with optional filtering.

**Parameters:**
1. `params` - Object with optional fields:
   - `limit` (optional) - Maximum number of transactions to return
   - `offset` (optional) - Number of transactions to skip
   - `account` (optional) - Filter by account involvement (32-byte array)

**Returns:** Array of ProcessedTransaction objects

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"recent_transactions",
    "params":[{
        "limit": 10,
        "offset": 0,
        "account": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    }]
}' http://localhost:9002/
```

### get_transactions_by_block

Retrieves transactions from a specific block.

**Parameters:**
1. `params` - Object with required and optional fields:
   - `block_hash` - Block hash string
   - `limit` (optional) - Maximum number of transactions to return
   - `offset` (optional) - Number of transactions to skip
   - `account` (optional) - Filter by account involvement (32-byte array)

**Returns:** Array of ProcessedTransaction objects

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_transactions_by_block",
    "params":[{
        "block_hash": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
        "limit": 50,
        "offset": 0
    }]
}' http://localhost:9002/
```

### get_transactions_by_ids

Retrieves multiple transactions by their IDs.

**Parameters:**
1. `params` - Object with required field:
   - `txids` - Array of transaction ID strings

**Returns:** Array of ProcessedTransaction objects (null for missing transactions)

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_transactions_by_ids",
    "params":[{
        "txids": [
            "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
        ]
    }]
}' http://localhost:9002/
```

## Block Operations

### get_block

Retrieves a block by its hash.

**Parameters:**
1. `block_hash` - Block hash string
2. `filter` (optional) - Block transaction filter

**Returns:** Block object with transaction data

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block",
    "params":[
        "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f" 
    ]
}' http://localhost:9002/
```

### get_block_by_height

Retrieves a block by its height.

**Parameters:**
1. `block_height` - Block height number
2. `filter` (optional) - Block transaction filter

**Returns:** Block object with transaction data

### get_block_count

Retrieves the current block count.

**Parameters:** None

**Returns:** Current block count as a number

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block_count",
    "params":[]
}' http://localhost:9002/
```

### get_block_hash

Retrieves the block hash for a given height.

**Parameters:**
1. `block_height` - Block height number

**Returns:** Block hash string

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block_hash",
    "params":[680000]
}' http://localhost:9002/
```

### get_best_block_hash

Retrieves the hash of the latest block.

**Parameters:** None

**Returns:** Latest block hash string

## Network Operations

### is_node_ready

Checks if the node is ready to process requests.

**Parameters:** None

**Returns:** Boolean indicating readiness

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"is_node_ready",
    "params":[]
}' http://localhost:9002/
```

### get_peers

Retrieves information about connected network peers.

**Parameters:** None

**Returns:** Array of peer statistics objects

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_peers",
    "params":[]
}' http://localhost:9002/
```

### get_current_state

Retrieves the current state of the validator node.

**Parameters:** None

**Returns:** CurrentState object containing validator state information

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_current_state",
    "params":[]
}' http://localhost:9002/
```



## Local Validator Specific Methods

The following methods are available only when using the local validator (for development):

### get_arch_txid_from_btc_txid

Maps a Bitcoin transaction ID to its corresponding Arch transaction ID.

**Parameters:**
1. `btc_txid` - Bitcoin transaction ID string

**Returns:** Optional Arch transaction ID string (null if not found)

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_arch_txid_from_btc_txid",
    "params":["1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"]
}' http://localhost:9002/
```

### get_transaction_report

Retrieves detailed transaction processing report for debugging.

**Parameters:**
1. `txid` - Transaction ID string

**Returns:** Transaction report string with processing details

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_transaction_report",
    "params":["1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"]
}' http://localhost:9002/
```

### get_latest_tx_using_account

Finds the most recent transaction involving a specific account.

**Parameters:**
1. `account_pubkey` - Account public key as hex string

**Returns:** Optional transaction ID string (null if not found)

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_latest_tx_using_account",
    "params":["0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"]
}' http://localhost:9002/
```

### get_all_accounts

Retrieves all account public keys in the database.

**Parameters:** None

**Returns:** Array of account public key hex strings

**Example:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_all_accounts",
    "params":[]
}' http://localhost:9002/
```

## CLI Alternative

Many RPC methods are available through the Arch Network CLI:

```bash
# Start local validator
arch-cli validator-start

# Deploy a program  
arch-cli deploy <ELF_PATH>

# Show program information
arch-cli show <PROGRAM_ADDRESS>

# Check transaction status
arch-cli confirm <TX_ID>

# Get block information
arch-cli get-block <BLOCK_HASH>

# Get current block height
arch-cli get-block-height

# Get program messages from transaction
arch-cli log-program-messages <TX_ID>

# Change account owner
arch-cli change-owner <ACCOUNT_ADDRESS> <NEW_OWNER>
```

For CLI installation and usage, see the [Quick Start Guide](../getting-started/quick-start.md).

## Error Handling

All RPC methods return JSON-RPC 2.0 compliant error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": "Additional error details"
  }
}
```

Common error codes:
- `-32600`: Invalid Request
- `-32601`: Method not found  
- `-32602`: Invalid params
- `-32603`: Internal error
