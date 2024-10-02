# Methods

### Table of Contents
- [sendTransaction]
- [sendTransactions]
- [getAccountInfo]
- [getAccountAddress]
- [getProgramAccounts]
- [getBlock]
- [getBlockCount]
- [getBlockHash]
- [getProcessedTransaction]
- [startDkg]
- [isNodeReady]
- [resetNetwork]
---
### `sendTransaction`

**Description:** Relays a single transaction to the nodes for execution. 

The following pre-flight checks are performed:
1. It verifies the transaction size limit.
2. It verifies the transaction signatures.
3. It verifies that the UTXOs are not already spent.

_The same checks are performed on [sendTransactions]._

If these checks pass, the transaction is forwarded to the rest of the nodes for processing.

**Method:** `POST`

**Parameters:**
    `params: <serialized_object>` - A serialized [Runtime Transaction] object representing the transaction to be sent.

**Returns:** A string containing the transaction IDs (`txid`) of the submitted transaction.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"send_transaction",
  "params": [
    [1,2,3,4,...]
  ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "id": "1"
}
```

### `sendTransactions`

**Description:**  Sends multiple transactions in a single batch request.

The following pre-flight checks are performed:
1. It verifies the transaction size limit.
2. It verifies the transaction signatures.
3. It verifies that the UTXOs are not already spent.

_The same checks are performed on [sendTransaction]._

If these checks pass, the transaction is forwarded to the rest of the nodes for processing.

**Method:** `POST`

**Parameters:**
    `params: <array[serialized_object]>` - An array of serialized [Runtime Transaction] objects to be sent.

**Returns:** An array of strings containing the transaction IDs (`txids`) of the submitted transactions.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"send_transactions",
    "params": [
        [
            [1,2,3,4,...],
            [5,6,7,8,...]
        ]
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  ],
  "id": "1"
}
```

### `getAccountInfo`

**Description:**  Reads account information for a specific public key.

**Method:** `POST`

**Parameters:**
    `pubkey: <byte_array>` - The public key ([Pubkey]) of the account.

**Returns:** An `AccountInfoResult` object containing details of the account.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_account_info",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "data": [1,2,3,4,...],
    "owner": [80,82,242,228,43,246,248,133,88,238,139,124,88,96,107,32,71,40,52,251,90,42,66,176,66,32,147,203,137,211,253,40],
    "utxo": "txid:vout",
    "is_executable": false
  },
  "id": "1"
}
```

### `getAccountAddress`

**Description:**  Fetches the account address associated with a public key.

**Method:** `POST`

**Parameters:**
    `pubkey: <byte_array>` - The public key ([Pubkey]) of the account.

**Returns:** The account address as a string.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_account_address",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32] 
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  "id": "1"
}
```

### `getProgramAccounts`
Fetches all accounts owned by the specified program ID.

**Parameters:** `program_id: <byte_array>` - Pubkey of the program to query, as an array of 32 bytes.

`filters` (optional) - Array of filter objects, each filter should be either:    
- `{ "DataSize": <size> }` where `<size>` is the required size of the account data
- `{ "DataContent": { "offset": <offset>, "bytes": <byte_array> } }` where `<offset>` is the offset into the account data, and `<byte_array>` is an array of bytes to match

**Returns:** An array of account objects, each containing:
- `pubkey: <byte_array>`: The account's public key.
- `account: <object>`: An object containing the account's data and metadata.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
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
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "pubkey": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
      "account": {
        "data": [1,2,3,4,...],
        "owner": [80,82,242,228,43,246,248,133,88,238,139,124,88,96,107,32,71,40,52,251,90,42,66,176,66,32,147,203,137,211,253,40],
        "utxo": "txid:vout",
        "is_executable": false
      }
    }
  ],
  "id": "1"
}
```

### `getBlock`

**Description:**  Retrieves block data based on a block hash.

**Method:** `POST`

**Parameters:**
    `blockHash: <string>` - A string representing the block hash.

**Returns:** A `Block` object or `undefined` if the block is not found.

**Error Handling:** Returns `undefined` if the block is not found (404).

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block",
    "params":[
        "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f" 
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    /* Block object */
  },
  "id": "1"
}
```

### `getBlockCount`

**Description:**  Retrieves the current block count.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** The current block count as a number. 

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block_count",
    "params":[]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": 680000,
  "id": "1"
}
```

### `getBlockHash`

**Description:**  Retrieves the block hash at a specific block height.

**Method:** `POST`

**Parameters:**
    `blockHeight: <number>` - The block height for which to retrieve the block hash.

**Returns:** A string representing the block hash.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_block_hash",
    "params":["680000"]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  "id": "1"
}
```

### `getProcessedTransaction`

**Description:**  Fetches details of a processed transaction using a transaction ID.

**Method:** `POST`

**Parameters:**
    `txid: <string>` - A string representing the transaction ID.

**Returns:** A `ProcessedTransaction` object or undefined if the transaction is not found.

**Error Handling:** Returns `undefined` if the transaction is not found (404).

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_processed_transaction",
    "params":[
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "runtime_transaction": { /* RuntimeTransaction object */ },
    "status": "Confirmed",
    "bitcoin_txids": ["txid1", "txid2"]
  },
  "id": "1"
}
```

### `getAccountInfo`

**Description:**  Retrieves detailed information for the specified account.

**Method:** `POST`

**Parameters:**
    `pubkey: <byte_array>` - The public key ([Pubkey]) of the account to query, as an array of 32 bytes.

**Returns:** An object containing the account's information:
- `data`: The account's data as a byte array.
- `owner`: The account's owner as a byte array (`program_id`).
- `utxo`: The UTXO associated with this account.
- `is_executable`: A boolean indicating if the account contains executable code.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_account_info",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "data": [1,2,3,4,...],
    "owner": [80,82,242,228,43,246,248,133,88,238,139,124,88,96,107,32,71,40,52,251,90,42,66,176,66,32,147,203,137,211,253,40],
    "utxo": "txid:vout",
    "is_executable": false
  },
  "id": "1"
}
```

### `startDkg`

**Description:** Initiates the Distributed Key Generation (DKG) process.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A success message if the DKG process is initiated.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"start_dkg",
    "params":[]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "DKG process initiated",
  "id": "1"
}
```

### `isNodeReady`

**Description:** Checks if the node is ready to process requests.

**Parameters:**
    None.

**Returns:** A boolean indicating whether the node is ready.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"is_node_ready",
    "params":[]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": "1"
}
```

### resetNetwork

**Description:** Resets the network state.

**Parameters:**
    None.

**Returns:** A success message if the network reset is successful.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"reset_network",
  "params":[]
}' \
https://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "Success!",
  "id": "1"
}
```

[arch-node]: https://github.com/arch-network/arch-node
[sendTransaction]: #sendtransaction
[sendTransactions]: #sendtransactions
[getAccountInfo]: #getaccountinfo
[getAccountAddress]: #getaccountaddress
[getProgramAccounts]: #getprogramaccounts
[getBlock]: #getblock
[getBlockCount]: #getblockcount
[getBlockHash]: #getblockhash
[getProcessedTransaction]: #getprocessedtransaction
[startDkg]: #startdkg
[isNodeReady]: #isnodeready
[resetNetwork]: #resetnetwork
[Runtime Transaction]: ../sdk/runtime-transaction.md
[Pubkey]: ../program/pubkey.md

