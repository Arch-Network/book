# `get_peers`

> ️️⚠️ Note: This endpoint is not available for local validators.

**Description:** Retrieves a list of peers currently connected to the node.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** An array of `PeerStats`.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_peers",
    "params":[]
}' \
http://localhost:9002/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "peer_id": "12D3KooW...",
      "address": "/ip4/192.168.1.1/tcp/30303",
      "status": "connected"
    }
  ],
  "id": 1
}
```

<!-- External -->
[Instant]: https://doc.rust-lang.org/std/time/struct.Instant.html
