# Methods

### Table of Contents
- [sendTransaction](#sendtransaction)
- [sendTransactions](#sendtransactions)
- [readAccountInfo](#readaccountinfo)
- [getAccountAddress](#getaccountaddress)
- [getProgram](#getprogram)
- [getBestBlockHash](#getbestblockhash)
- [getBlock](#getblock)
- [getBlockCount](#getblockcount)
- [getBlockHash](#getblockhash)
- [getProcessedTransaction](#getprocessedtransaction)
- [getAccountInfo](#getaccountinfo)
---
### `sendTransaction`

**Description:** Sends a single transaction to the node.

**Method:** `POST`

**Parameters:**
    `params: RuntimeTransaction` - A runtime transaction object representing the transaction to be sent.

**Returns:** Result of the transaction processing.

Example:
```ts
const result = await rpcConnection.sendTransaction(transaction);
```

### `sendTransactions`

**Description:**  Sends multiple transactions in a single batch request.

**Method:** `POST`

**Parameters:**
    `params: Array<RuntimeTransaction>` - An array of runtime transaction objects to be sent.

**Returns:** Result of the batch transaction processing.

Example:
```ts
const result = await rpcConnection.sendTransactions(transactions);
```

### `readAccountInfo`

**Description:**  Reads account information for a specific public key.

**Method:** `POST`

**Parameters:**
    `pubkey: Pubkey` - A public key for the account.

**Returns:** An `AccountInfoResult` object containing details of the account.

Example:
```ts
const accountInfo = await rpcConnection.readAccountInfo(pubkey);
```

### `getAccountAddress`

**Description:**  Fetches the account address associated with a public key.

**Method:** `POST`

**Parameters:**
    `pubkey: Pubkey` - A public key for the account.

**Returns:** The account address as a string.

Example:
```ts
const accountAddress = await rpcConnection.getAccountAddress(pubkey);
```

### `getProgram`

**Description:**  Retrieves the program associated with the provided program ID.

**Method:** `POST`

**Parameters:**
    `programId: string` - A string representing the program ID.

**Returns:** The program data as a string.

Example:
```ts
const program = await rpcConnection.getProgram(programId);
```

### `getBestBlockHash`

**Description:**  Fetches the best (most recent) block hash from the node.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A string representing the best block hash.

Example:
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

Example:
```ts
const block = await rpcConnection.getBlock(blockHash);
```

### `getBlockCount`

**Description:**  Retrieves the total number of blocks in the blockchain.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A number representing the block count.

Example:
```ts
const blockCount = await rpcConnection.getBlockCount();
```

### `getBlockHash`

**Description:**  Retrieves the block hash at a specific block height.

**Method:** `POST`

**Parameters:**
    `blockHeight: number` - The block height for which to retrieve the block hash.

**Returns:** A string representing the block hash.

Example:
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

Example:
```ts
const transaction = await rpcConnection.getProcessedTransaction(txid);
```

### `getAccountInfo`

**Description:**  Retrieves detailed information about an account using its address.

**Method:** `POST`

**Parameters:**
    `address: string` - A string representing the account address.

**Returns:** Account information as a result.

Example:
```ts
const accountInfo = await rpcConnection.getAccountInfo(address);
```

