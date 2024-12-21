# Instructions and Messages

Instructions and messages are fundamental components of Arch's transaction processing system that enable communication between clients and programs.

### Instructions

An instruction is the basic unit of program execution in Arch. It contains all the information needed for a program to execute a specific operation.

#### Structure
```rust
pub struct Instruction {
    /// Program ID that executes this instruction
    pub program_id: Pubkey,
    /// Accounts required for this instruction
    pub accounts: Vec<AccountMeta>,
    /// Instruction data
    pub data: Vec<u8>,
}
```

#### Components:

1. **Program ID**: The public key of the program that will process the instruction
2. **Accounts**: List of accounts required for the instruction
3. **Instruction Data**: Custom data specific to the instruction

#### Account Metadata
```rust
pub struct AccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
```

- `pubkey`: The account's public key
- `is_signer`: Whether the account must sign the transaction
- `is_writable`: Whether the account's data can be modified

### Messages

A message is a collection of instructions that form a transaction. Messages ensure atomic execution of multiple instructions.

#### Structure
```rust
pub struct Message {
    /// List of account keys referenced by the instructions
    pub account_keys: Vec<Pubkey>,
    /// Recent blockhash
    pub recent_blockhash: Hash,
    /// List of instructions to execute
    pub instructions: Vec<CompiledInstruction>,
}
```

#### Components:

1. **Account Keys**: All unique accounts referenced across instructions
2. **Recent Blockhash**: Used for transaction uniqueness and timeout
3. **Instructions**: List of instructions to execute

### Instruction Processing Flow:

1. Client creates an instruction with:
   - Program ID
   - Required accounts
   - Instruction-specific data

2. Instruction(s) are bundled into a message

3. Message is signed to create a [transaction]

4. Transaction is sent to the network

5. Program processes the instruction:
   - Deserializes instruction data
   - Validates accounts
   - Executes operation
   - Updates account state

### Best Practices:

1. **Account Validation**
   - Always verify account ownership
   - Check account permissions
   - Validate account relationships

2. **Data Serialization**
   - Use consistent serialization format
   - Include version information
   - Handle errors gracefully

3. **Error Handling**
   - Return specific error types
   - Provide clear error messages
   - Handle all edge cases

### Cross-Program Invocation (CPI)

Instructions can invoke other programs through CPI:

1. Create new instruction for target program
2. Pass required accounts
3. Invoke using `invoke` or `invoke_signed`
4. Handle return values and errors

### Security Considerations:

1. **Account Verification**
   - Verify all account permissions
   - Check ownership and signatures
   - Validate account relationships

2. **Data Validation**
   - Sanitize all input data
   - Check buffer lengths
   - Validate numerical ranges

3. **State Management**
   - Maintain atomic operations
   - Handle partial failures
   - Prevent race conditions

<!-- Internal -->
[transaction]: ./transaction.md
