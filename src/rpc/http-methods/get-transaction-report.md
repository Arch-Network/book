# `get_transaction_report`

**Description:** Get detailed transaction processing report for a specific transaction.

**Method:** `POST`

**Parameters:**
    `txid: <string>` - Transaction ID as a string

**Returns:** Detailed transaction processing report with status and processing details.

**Availability:** Available in both `validator` and `local_validator` crates.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_transaction_report",
    "params":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "transaction_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "status": "confirmed",
    "processing_time": 150,
    "block_height": 12345,
    "details": "Transaction processed successfully"
  },
  "id": "1"
}
```
