# `getTransactions`

**Description:** Retrieves a list of processed transactions based on specified parameters.

**Method:** `POST`

**Parameters:**
- `offset: <number>` - The number of transactions to skip (for pagination).
- `limit: <number>` - The maximum number of transactions to return (maximum: 100).
- `filter: <object>` (optional) - Filter criteria for transactions:
  - `account: <string>` - Filter transactions involving a specific account.
  - `program: <string>` - Filter transactions involving a specific program.
  - `block: <string>` - Filter transactions from a specific block.

**Returns:** An array of processed transaction objects.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"get_transactions",
  "params": {
    "offset": 0,
    "limit": 10,
    "filter": {
      "account": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    }
  }
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "txid": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "status": "Success",
      "fee": 0,
      "block": "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      "timestamp": 1234567890,
      "instructions": [
        {
          "program_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "accounts": [
            {
              "pubkey": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              "is_signer": true,
              "is_writable": true
            }
          ],
          "data": [1, 2, 3, 4]
        }
      ]
    }
  ],
  "id": "1"
}
```

**Error Codes:**
- `400` - Invalid parameters (e.g., negative offset, limit > 100)
- `500` - Internal server error

<!-- Internal -->
[ProcessedTransaction]: ../../sdk/processed-transaction.md 