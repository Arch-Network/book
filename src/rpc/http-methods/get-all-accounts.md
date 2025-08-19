# `get_all_accounts`

**Description:** Get all account public keys currently stored in the validator.

**Method:** `POST`

**Parameters:**
    None.

**Returns:** Array of account public keys as byte arrays.

**Request:**
```bash
curl -vL POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"get_all_accounts",
    "params":[]
}' \
http://localhost:9001/
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
    [33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]
  ],
  "id": "1"
}
```

**Note:** This method is only available on local validators (port 9001).
