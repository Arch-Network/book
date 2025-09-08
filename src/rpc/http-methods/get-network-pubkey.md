# `get_network_pubkey`

**Description:** Returns the current network verifying key as a hex string.

- In `validator`, this is the FROST group verifying key managed by the node's key manager.
- In `local_validator`, this returns the local validator's x-only public key used for development.

**Method:** `POST`

**Parameters:** None.

**Returns:** Hex-encoded verifying key string.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"get_network_pubkey",
  "params":[]
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00",
  "id": "1"
}
```

**Notes:**
- Available in both `validator` and `local_validator`.
- No parameters are required.
