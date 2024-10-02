# Methods

### Table of Contents
- [sendTransaction]
- [sendTransactions]
- [readAccountInfo]
- [getAccountAddress]
- [getProgram]
- [getBestBlockHash]
- [getBlock]
- [getBlockCount]
- [getBlockHash]
- [getProcessedTransaction]
- [getAccountInfo]
---
## Arch RPC Node
By default, running the [arch-node] validator software will start the RPC service. For those wishing to run only the RPC server and not participate as an Arch validator, 

## Arch-TypeScript-SDK

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
    `params: RuntimeTransaction` - A [Runtime Transaction] object representing the transaction to be sent.

**Returns:** Result of the transaction processing.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"send_transaction",
  "params":["runtime_transaction"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const result = await rpcConnection.sendTransaction(transaction);
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
    `params: <array>` - An array of runtime transaction objects to be sent.

**Returns:** Result of the batch transaction processing.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"send_transactions",
  "params":["[runtime_transaction]"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const result = await rpcConnection.sendTransactions(transactions);
```

### `readAccountInfo`

**Description:**  Reads account information for a specific public key.

**Method:** `POST`

**Parameters:**
    `pubkey: Pubkey` - A public key for the account.

**Returns:** An `AccountInfoResult` object containing details of the account.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"read_account_info",
  "params":["pubkey"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const accountInfo = await rpcConnection.readAccountInfo(pubkey);
```

### `getAccountAddress`

**Description:**  Fetches the account address associated with a public key.

**Method:** `POST`

**Parameters:**
    `pubkey: Pubkey` - A public key for the account.

**Returns:** The account address as a string.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_account_address",
  "params":["pubkey"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const accountAddress = await rpcConnection.getAccountAddress(pubkey);
```

### `getProgram`

**Description:**  Retrieves the program associated with the provided program ID.

**Method:** `POST`

**Parameters:**
    `programId: string` - A string representing the program ID.

**Returns:** The program data as a string.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_program",
  "params":["program_id"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const program = await rpcConnection.getProgram(programId);
```

### `getBestBlockHash`

**Description:**  Fetches the best (most recent) block hash from the node.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A string representing the best block hash.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_best_block_hash",
  "params":[]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const bestBlockHash = await rpcConnection.getBestBlockHash();
```

### `getBlock`

**Description:**  Retrieves block data based on a block hash.

**Method:** `POST`

**Parameters:**
    `blockHash: string` - A string representing the block hash.

**Returns:** A `Block` object or `undefined` if the block is not found.

**Error Handling:** Returns `undefined` if the block is not found (404).

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_block",
  "params":["block_hash"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const block = await rpcConnection.getBlock(blockHash);
```

### `getBlockCount`

**Description:**  Retrieves the total number of blocks in the blockchain.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A number representing the block count.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_block_count",
  "params":[]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const blockCount = await rpcConnection.getBlockCount();
```

### `getBlockHash`

**Description:**  Retrieves the block hash at a specific block height.

**Method:** `POST`

**Parameters:**
    `blockHeight: number` - The block height for which to retrieve the block hash.

**Returns:** A string representing the block hash.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_block_hash",
  "params":["block_height"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const blockHash = await rpcConnection.getBlockHash(blockHeight);
```

### `getProcessedTransaction`

**Description:**  Fetches details of a processed transaction using a transaction ID.

**Method:** `POST`

**Parameters:**
    `txid: string` - A string representing the transaction ID.

**Returns:** A `ProcessedTransaction` object or undefined if the transaction is not found.

**Error Handling:** Returns `undefined` if the transaction is not found (404).

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_processed_transaction",
  "params":["txid"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const transaction = await rpcConnection.getProcessedTransaction(txid);
```

### `getAccountInfo`

**Description:**  Retrieves detailed information about an account using its address.

**Method:** `POST`

**Parameters:**
    `address: string` - A string representing the account address.

**Returns:** Account information as a result.

```bash
curl -vLX POST \
  -H 'Content-Type: application/json' \
  -d '{
  "jsonrpc":"2.0",
  "id":"id",
  "method":"get_account_info",
  "params":["address"]
  }' \
 https://localhost:9001/
```

SDK Example:
```ts
const accountInfo = await rpcConnection.getAccountInfo(address);
```

[arch-node]: https://github.com/arch-network/arch-node
[sendTransaction]: #sendtransaction
[sendTransactions]: #sendtransactions
[readAccountInfo]: #readaccountinfo
[getAccountAddress]: #getaccountaddress
[getProgram]: #getprogram
[getBestBlockHash]: #getbestblockhash
[getBlock]: #getblock
[getBlockCount]: #getblockcount
[getBlockHash]: #getblockhash
[getProcessedTransaction]: #getprocessedtransaction
[getAccountInfo]: #getaccountinfo
[Runtime Transaction]: ../sdk/runtime-transaction.md
