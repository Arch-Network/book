# UTXO (Unspent Transaction Output)

UTXO (Unspent Transaction Output) is a fundamental concept in Arch's transaction model that represents the output of a [transaction] which can be spent in future transactions. UTXOs work alongside accounts to provide a hybrid model that combines the benefits of both UTXO-based and account-based systems.

### Overview

In the UTXO model, transactions consume previous transaction outputs (inputs) and create new outputs that can be spent by future transactions. This differs from an account-based model where balances are stored directly in accounts. The UTXO model is particularly useful for parallel transaction processing and enhanced privacy features.

### UTXO Structure

```rust
#[derive(Clone, Debug, PartialEq, Eq)]
#[repr(C)]
pub struct UtxoMeta([u8; 36]);  // 32 bytes for txid + 4 bytes for vout
```

### Key Characteristics:

1. **Immutability**: Each UTXO can only be spent once and in its entirety
2. **No Partial Spending**: UTXOs must be consumed completely in a transaction
3. **Change Outputs**: When a UTXO is spent for less than its full value, a new UTXO is created with the remaining balance
4. **Privacy Benefits**: Each transaction creates new UTXOs, making it harder to track transaction history

### Components:

#### 1. Transaction Input
- References to previous transaction outputs (UTXOs)
- Proof of ownership (typically a signature using the owner's [pubkey])
- The complete UTXO must be consumed
- Validated through [instructions] in the transaction

#### 2. Transaction Output
- Amount being transferred
- Locking script (conditions that must be met to spend the output)
- Creates new UTXOs
- Stored in accounts with specific data structure

### UTXO Creation Process:

1. **Bitcoin UTXO Creation**
   ```rust
   // Create Bitcoin UTXO
   let txid = rpc.send_to_address(
       &account_address,
       Amount::from_sat(3000),
       None, None, None, None, None, None,
   );
   ```

2. **Account Creation**
   ```rust
   // Create Arch account with UTXO reference
   SystemInstruction::new_create_account_instruction(
       txid.try_into().unwrap(),
       vout,
       account_pubkey,
   )
   ```

3. **UTXO Metadata**
   - UTXO information is stored in a 36-byte format
   - First 32 bytes: Transaction ID (txid)
   - Last 4 bytes: Output Index (vout)

### Example Flow:

1. Alice has a UTXO worth 100 tokens
2. Alice wants to send 70 tokens to Bob
3. The transaction:
   - Input: Alice's 100 token UTXO
   - Outputs:
     - 70 tokens to Bob (new UTXO)
     - 30 tokens back to Alice (change UTXO)

### Benefits:

1. **Parallelization**: UTXOs can be processed in parallel since each can only be spent once
2. **Deterministic**: Transaction validation is straightforward through [instruction] processing
3. **Privacy**: Enhanced transaction privacy through UTXO creation
4. **Scalability**: Easier to scale due to parallel processing capabilities

### Considerations:

1. **State Management**: More complex to manage state compared to account-based models
2. **Storage**: Requires tracking all unspent outputs in accounts
3. **Change Management**: Need to handle change outputs efficiently
4. **User Experience**: May be more complex for users to understand

### Integration with Arch:

UTXOs in Arch are implemented through a combination of Bitcoin UTXOs and Arch accounts:
- Bitcoin UTXO holds the actual value
- Arch account references the UTXO using UtxoMeta
- Programs interact with UTXOs through [instructions]

The process typically involves:

1. **Creation**
   - Bitcoin transaction creates UTXO
   - System instruction creates corresponding account
   - UTXO metadata is stored in account

2. **Consumption**
   - Validates UTXO ownership through [instruction] processing
   - Creates new UTXOs for recipients
   - Handles change outputs if necessary

3. **Validation**
   - Checks performed through [program] logic
   - Ensures proper ownership and signatures
   - Verifies transaction integrity

### Security Considerations:

1. **Double Spending**
   - Prevented by UTXO consumption rules
   - Validated through [program] checks
   - Enforced by consensus

2. **Ownership Verification**
   - Uses [pubkey] for authentication
   - Requires proper signatures
   - Validated in [instructions]

<!-- Internal -->
[program]: ./program.md
[pubkey]: ./pubkey.md
[instructions]: ./instructions-and-messages.md
[instruction]: ./instructions-and-messages.md
[transaction]: ./transaction.md
