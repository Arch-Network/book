# `get_latest_tx_using_account`

**Description:** Finds the most recent transaction that involves a specified account.

**Method:** `POST`

**Parameters:**
    `account_pubkey: <string>` - Account public key as a string

**Returns:** The most recent transaction information for the specified account.

**Availability:** Available in both `validator` and `local_validator` crates.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_latest_tx_using_account",
    "params":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "transaction_id": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "block_height": 12345,
    "timestamp": 1640995200
  },
  "id": "1"
}
```
