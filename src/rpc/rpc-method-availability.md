# RPC Method Availability and Parameter Formats

This document provides a comprehensive overview of which RPC methods are available in the `validator` vs `local_validator` crates, along with their correct parameter formats.

## Method Availability

### Available in Both Crates

The following RPC methods are available in both `validator` and `local_validator` crates:

- `is_node_ready` - No parameters
- `get_account_address` - Single byte array parameter
- `request_airdrop` - Single Pubkey parameter
- `create_account_with_faucet` - Single Pubkey parameter
- `read_account_info` - Single Pubkey parameter
- `get_multiple_accounts` - Single array of Pubkeys parameter
- `send_transaction` - Single RuntimeTransaction parameter
- `send_transactions` - Single array of RuntimeTransactions parameter
- `get_block_count` - No parameters
- `get_best_block_hash` - No parameters
- `get_best_finalized_block_hash` - No parameters
- `get_block_hash` - Single u64 parameter (block height)
- `get_block` - Array with block hash string and optional filter
- `get_block_by_height` - Array with block height u64 and optional filter
- `get_processed_transaction` - Single string parameter (transaction ID)
- `get_program_accounts` - Array with program_id Pubkey and optional filters
- `recent_transactions` - Single TransactionListParams object
- `get_transactions_by_block` - Single BlockTransactionsParams object
- `get_transactions_by_ids` - Single TransactionsByIdsParams object
- `get_version` - No parameters
- `get_network_pubkey` - No parameters

### Available Only in Validator Crate

The following RPC methods are **only available** in the `validator` crate:

- `get_peers` - No parameters
- `get_current_state` - No parameters

### Available Only in Local Validator Crate

The following RPC methods are available only in the `local_validator` crate (development/debug helpers):

- `get_arch_txid_from_btc_txid` - Single string parameter (Bitcoin transaction ID)
- `get_transaction_report` - Single string parameter (transaction ID)
- `get_latest_tx_using_account` - Single string parameter (account public key)
- `get_all_accounts` - No parameters

### Deprecated or Not Exposed

The following legacy methods are not currently exposed via RPC in the validator:

- `start_dkg`
- `reset_network`

## Parameter Format Patterns

### Single Parameter Methods

Methods that use `params.parse::<Type>()` expect a single parameter of the specified type:

- **String parameters**: `"value"` (not `["value"]`)
- **Number parameters**: `123` (not `[123]`)
- **Byte array parameters**: `[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]` (not `[[1,2,3,...]]`)
- **Object parameters**: `{"key": "value"}` (not `[{"key": "value"}]`)

### Array Parameter Methods

Methods that use `parse_block_params` or similar expect an array with specific structure:

- **Block methods**: `["block_hash_string", optional_filter_object]`
- **Program accounts**: `[program_id_pubkey, optional_filters_object]`

### No Parameter Methods

Methods that use `_params` expect no parameters and should be called with `"params": []` or omit the params field entirely.

## Examples

### Correct: Single String Parameter
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "get_processed_transaction",
    "params": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

### Correct: Single Byte Array Parameter
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "get_account_address",
    "params": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
}
```

### Correct: Array with Block Hash and Filter
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "get_block",
    "params": [
        "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
        {"include_transactions": "signatures"}
    ]
}
```

### Correct: No Parameters
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "get_block_count",
    "params": []
}
```

## Notes

- The `validator` crate is designed for production network nodes
- The `local_validator` crate is designed for local development and testing
- Most RPC methods are available in both crates for consistency
- Methods like `get_peers` and `get_current_state` are only available in the validator crate as they require network state information
- All parameter formats follow JSON-RPC 2.0 specification
- When in doubt, check the method implementation in the source code to confirm the expected parameter format
