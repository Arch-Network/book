# `sendTransaction`

**Description:** Relays a single transaction to the nodes for execution. 

The following pre-flight checks are performed:
1. It verifies the transaction size limit.
2. It verifies the transaction signatures.
3. It verifies that the UTXOs are not already spent.

_The same checks are performed on [sendTransactions]._

If these checks pass, the transaction is forwarded to the rest of the nodes for processing.

**Method:** `POST`

**Parameters:**
    `transaction: <RuntimeTransaction>` - A [Runtime Transaction] object representing the transaction to be sent.

**Returns:** A string containing the transaction IDs (`txid`) of the submitted transaction.

**Availability:** Available in both `validator` and `local_validator` crates.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"send_transaction",
  "params": {
    "version": 0,
    "signatures": [],
    "message": {
      "header": {...},
      "account_keys": [...],
      "recent_blockhash": "...",
      "instructions": [...]
    }
  }
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "id": "1"
}
```

<!-- Internal -->
[sendTransactions]: ./send-transactions.md
[Runtime Transaction]: ../../sdk/runtime-transaction.md
