# Instructions and Messages

Instructions and messages are fundamental components of Arch's transaction processing system that enable communication between clients and [programs]. They form the basis for all state changes and interactions within the Arch network.

### Instructions

An instruction is the basic unit of program execution in Arch. It contains all the information needed for a [program] to execute a specific operation. Instructions are processed atomically, meaning they either complete entirely or have no effect.

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

1. **Program ID**: The [pubkey] of the [program] that will process the instruction
2. **Accounts**: List of accounts required for the instruction, with their metadata
3. **Instruction Data**: Custom data specific to the instruction, typically serialized using Borsh or another format

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

A message is a collection of instructions that form a [transaction]. Messages ensure atomic execution of multiple instructions, meaning either all instructions succeed or none take effect.

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
3. **Instructions**: List of instructions to execute in sequence

### Instruction Processing Flow:

1. Client creates an instruction with:
   - [Program] ID to execute the instruction
   - Required accounts with appropriate permissions
   - Instruction-specific data (serialized parameters)

2. Instruction(s) are bundled into a message:
   - Multiple instructions can be atomic
   - Account permissions are consolidated
   - Blockhash is included for uniqueness

3. Message is signed to create a [transaction]:
   - All required signers must sign
   - Transaction size limits apply
   - Fees are calculated

4. Transaction is sent to the network:
   - Validated by validators
   - Processed in parallel when possible
   - Results are confirmed

5. Program processes the instruction:
   - Deserializes instruction data
   - Validates accounts and permissions
   - Executes operation
   - Updates account state

### Best Practices:

1. **Account Validation**
   - Always verify account ownership
   - Check account permissions
   - Validate account relationships
   - Ensure rent requirements are met

2. **Data Serialization**
   - Use consistent serialization format (preferably Borsh)
   - Include version information
   - Handle errors gracefully
   - Validate data lengths

3. **Error Handling**
   - Return specific error types
   - Provide clear error messages
   - Handle all edge cases
   - Implement proper cleanup

### Cross-Program Invocation (CPI)

Instructions can invoke other [programs] through CPI, enabling composability:

1. Create new instruction for target program:
   - Specify program ID
   - Include required accounts
   - Prepare instruction data

2. Pass required accounts:
   - Include all necessary accounts
   - Set proper permissions
   - Handle PDA derivation

3. Invoke using `invoke` or `invoke_signed`:
   - For regular accounts: `invoke`
   - For PDAs: `invoke_signed`
   - Handle return values

4. Handle results:
   - Check return status
   - Process any returned data
   - Handle errors appropriately

### Security Considerations:

1. **Account Verification**
   - Verify all account permissions
   - Check ownership and signatures
   - Validate account relationships
   - Prevent privilege escalation

2. **Data Validation**
   - Sanitize all input data
   - Check buffer lengths
   - Validate numerical ranges
   - Prevent integer overflow

3. **State Management**
   - Maintain atomic operations
   - Handle partial failures
   - Prevent race conditions
   - Ensure consistent state

### Common Patterns:

1. **Initialization**
   - Create necessary accounts
   - Set initial state
   - Assign proper ownership

2. **State Updates**
   - Validate permissions
   - Update account data
   - Maintain invariants

3. **Account Management**
   - Handle rent
   - Close accounts when done
   - Manage PDAs properly

<!-- Internal -->
[program]: ./program.md
[programs]: ./program.md
[pubkey]: ./pubkey.md
[transaction]: ./transaction.md
