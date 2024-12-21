# UTXO (Unspent Transaction Output)

UTXO (Unspent Transaction Output) is a fundamental concept in Arch's transaction model that represents the output of a transaction which can be spent in future transactions.

### Overview

In the UTXO model, transactions consume previous transaction outputs (inputs) and create new outputs that can be spent by future transactions. This differs from an account-based model where balances are stored directly in accounts.

### Key Characteristics:

1. **Immutability**: Each UTXO can only be spent once and in its entirety
2. **No Partial Spending**: UTXOs must be consumed completely in a transaction
3. **Change Outputs**: When a UTXO is spent for less than its full value, a new UTXO is created with the remaining balance
4. **Privacy Benefits**: Each transaction creates new UTXOs, making it harder to track transaction history

### Components:

#### 1. Transaction Input
- References to previous transaction outputs (UTXOs)
- Proof of ownership (typically a signature)
- The complete UTXO must be consumed

#### 2. Transaction Output
- Amount being transferred
- Locking script (conditions that must be met to spend the output)
- Creates new UTXOs

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
2. **Deterministic**: Transaction validation is straightforward
3. **Privacy**: Enhanced transaction privacy through UTXO creation
4. **Scalability**: Easier to scale due to parallel processing capabilities

### Considerations:

1. **State Management**: More complex to manage state compared to account-based models
2. **Storage**: Requires tracking all unspent outputs
3. **Change Management**: Need to handle change outputs efficiently
4. **User Experience**: May be more complex for users to understand

### Integration with Arch:

UTXOs in Arch are implemented as special [account] types that contain:
- The amount
- Owner's [pubkey]
- Additional metadata for the UTXO

Programs can create and consume UTXOs through [instructions], enabling complex transaction logic while maintaining the benefits of the UTXO model.

<!-- Internal -->
[account]: ./accounts.md
[pubkey]: ./pubkey.md
[instructions]: ./instructions-and-messages.md
