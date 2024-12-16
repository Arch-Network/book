# `getCurrentState`

> ️️⚠️ Note: This endpoint is not available for local validators.

**Description:** Retrieves the current state: the validator's state (`Init`, `ConnectedToNetwork`, `ReadyToSync`, etc.) and the latest state transition, as type [Instant].

**Method:** `POST`

**Parameters:**
    None.

**Returns:** A `CurrentState` object.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_current_state",
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
