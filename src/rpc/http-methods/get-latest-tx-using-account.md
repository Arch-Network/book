# `get_latest_tx_using_account`

**Description:** Finds the most recent transaction that involves a specified account.

**Method:** `POST`

**Parameters:**
1. `account_pubkey` - Account public key as a 32-byte array

**Returns:** The most recent transaction information for the specified account.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_latest_tx_using_account",
    "params":[
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
    ]
}' \
http://localhost:9001/
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

**Note:** This method is only available on local validators (port 9001).
