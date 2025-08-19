# `get_best_finalized_block_hash`

**Description:** Retrieves the hash of the best finalized block in the blockchain.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** The hash of the best finalized block as a string.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_best_finalized_block_hash",
    "params":[]
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "id": "1"
}
```
