# `get_version`

**Description:** Retrieves the version information of the node.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** Version information object containing node version details.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_version",
    "params":[]
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "version": "0.5.0",
    "build": "dev"
  },
  "id": "1"
}
```
