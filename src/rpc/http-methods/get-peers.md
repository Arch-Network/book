# `getPeers`

**Description:** Retrieves details of a validator's peers: `peer_id`, `time_drift_ms` and the `last_heartbeat` as type, [Instant].

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
  "result": "",
  "id": "1"
}
```

<!-- External -->
[Instant]: https://doc.rust-lang.org/std/time/struct.Instant.html
