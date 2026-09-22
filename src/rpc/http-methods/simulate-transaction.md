# simulate_transaction

Simulates the execution of a transaction without committing it to the blockchain. This method allows you to test transaction logic, check for errors, and estimate execution costs before actually submitting the transaction.

## Parameters

1. `transaction` - RuntimeTransaction object containing:
   - `version` - Transaction version (currently 0)
   - `signatures` - Array of transaction signatures (can be empty for simulation)
   - `message` - Transaction message with signers and instructions

2. `options` (optional) - Simulation options object:
   - `commitment` (optional) - Commitment level for simulation ("processed", "confirmed", "finalized")
   - `sig_verify` (optional) - Whether to verify signatures (default: false for simulation)
   - `replace_recent_blockhash` (optional) - Whether to replace recent blockhash (default: false)

## Returns

Object containing:
- `err` - Error object if simulation failed, null if successful
- `logs` - Array of log messages from transaction execution
- `accounts` - Array of account information after simulation
- `units_consumed` - Number of compute units consumed
- `return_data` - Return data from the transaction (if any)

## Example

```bash
curl -X POST -H 'Content-Type: application/json' -d '
{
    "jsonrpc":"2.0",
    "id":1,
    "method":"simulate_transaction",
    "params":[{
        "version": 0,
        "signatures": [],
        "message": {
            "signers": [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]],
            "instructions": [
                {
                    "program_id": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
                    "accounts": [
                        {
                            "pubkey": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
                            "is_signer": true,
                            "is_writable": true
                        }
                    ],
                    "data": [1,2,3,4]
                }
            ]
        }
    }, {
        "commitment": "processed",
        "sig_verify": false
    }]
}' http://localhost:9002/
```

## Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "err": null,
    "logs": [
      "Program 11111111111111111111111111111111 invoke [1]",
      "Program 11111111111111111111111111111111 success"
    ],
    "accounts": [
      {
        "pubkey": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
        "lamports": 1000000000,
        "owner": [80,82,242,228,43,246,248,133,88,238,139,124,88,96,107,32,71,40,52,251,90,42,66,176,66,32,147,203,137,211,253,40],
        "data": [1,2,3,4,5],
        "utxo": "txid:vout",
        "is_executable": false
      }
    ],
    "units_consumed": 5000,
    "return_data": null
  },
  "id": 1
}
```

## Error Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "err": {
      "InstructionError": [0, "Custom", 1]
    },
    "logs": [
      "Program 11111111111111111111111111111111 invoke [1]",
      "Program 11111111111111111111111111111111 failed: custom program error: 0x1"
    ],
    "accounts": null,
    "units_consumed": 2000,
    "return_data": null
  },
  "id": 1
}
```

## Notes

- This method does not modify the blockchain state
- Signatures are not required for simulation (can be empty array)
- Useful for testing transaction logic before submission
- Can help estimate compute unit consumption
- Returns detailed execution logs for debugging
- Account states reflect the result after transaction execution
