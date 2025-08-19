# `get_arch_txid_from_btc_txid`

**Description:** Maps a Bitcoin transaction ID to the corresponding Arch Network transaction ID.

**Method:** `POST`

**Parameters:**
    `btc_txid: <string>` - Bitcoin transaction ID as a string

**Returns:** The corresponding Arch Network transaction ID as a string.

**Availability:** Available in both `validator` and `local_validator` crates.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_arch_txid_from_btc_txid",
    "params":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
  "id": "1"
}
```
