# Accounts

Accounts are a fundamental data structure in Arch that store state and are owned by [programs]. Each account has a unique address ([pubkey]) and contains data that can be modified by its owner program. Accounts serve as the primary storage mechanism for both program code and program state.

### Account Structure

```rust
pub struct Account {
    /// The program that owns this account
    pub owner: Pubkey,
    /// Number of lamports assigned to this account
    pub lamports: u64,
    /// Data held in this account
    pub data: Vec<u8>,
    /// Whether this account can process instructions
    pub executable: bool,
    /// The epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

### Key Components:

#### 1. Owner
- The [program] that has exclusive rights to modify the account's data
- Only the owner program can debit the account and modify its data
- The owner can assign a new owner to the account through [instructions]
- Initial owner is set during account creation

#### 2. Lamports
- The native token balance stored in the account
- Used for transaction fees and rent
- Can be transferred between accounts via [instructions]
- Minimum balance required for rent exemption

#### 3. Data
- Program-specific data stored as a byte array
- Structure and interpretation determined by the owner [program]
- Size affects the account's rent cost
- Can store [UTXO]s, program state, or other data

#### 4. Executable
- Boolean flag indicating if the account contains program code
- Executable accounts cannot be modified after deployment
- Only the loader program can set this flag
- Required for [program] accounts

#### 5. Rent Epoch
- The epoch when the account will need to pay rent
- Accounts must maintain minimum balance for rent exemption
- Rent is based on data size and execution status
- Helps prevent state bloat

### Account Types:

1. **Program Accounts**
   - Contains executable [program] code
   - Created through program deployment
   - Immutable after deployment
   - Processes [instructions]

2. **Data Accounts**
   - Stores program-specific state
   - Created and managed by [programs]
   - Mutable according to program logic
   - Can store [UTXO]s or other data

3. **Native Accounts**
   - System-level accounts (e.g., System Program)
   - Handle basic operations
   - Have special privileges
   - Core part of the protocol

### Account Creation:

1. **System Program**
   - Creates new accounts through [instructions]
   - Allocates space for data
   - Assigns owner [program]
   - Transfers initial lamports
   - Sets rent parameters

2. **Program-Derived Accounts (PDAs)**
   - Deterministic addresses derived from seeds
   - No private key (controlled by [programs])
   - Used for program state and [UTXO]s
   - Created through program logic

### Security Model:

1. **Ownership**
   - Only owner can modify data through [instructions]
   - Only owner can debit lamports
   - Owner can reassign ownership
   - Prevents unauthorized access

2. **Permissions**
   - Read access is public
   - Write access requires owner authorization
   - Execution requires executable flag
   - Enforced by runtime

3. **Rent**
   - Prevents state bloat
   - Ensures resource efficiency
   - Exemption through minimum balance
   - Automatically collected

### Best Practices:

1. **Account Management**
   - Validate account ownership before [instructions]
   - Check account permissions
   - Handle rent properly
   - Use appropriate account types
   - Close unused accounts

2. **Data Safety**
   - Validate all data modifications
   - Handle serialization carefully
   - Check account sizes
   - Maintain data integrity
   - Use proper encoding

3. **Program Design**
   - Use PDAs when appropriate
   - Minimize account creation
   - Optimize for rent costs
   - Follow security principles
   - Plan for upgrades

### Common Operations:

1. **Creation**
```rust
SystemInstruction::CreateAccount {
    lamports: u64,  // Initial balance
    space: u64,     // Data size
    owner: Pubkey,  // Program ID
}
```

2. **Transfer**
```rust
SystemInstruction::Transfer {
    lamports: u64,  // Amount to transfer
}
```

3. **Allocation**
```rust
SystemInstruction::Allocate {
    space: u64,  // New data size
}
```

4. **Assignment**
```rust
SystemInstruction::Assign {
    owner: Pubkey,  // New owner
}
```

### Account Lifecycle:

1. **Creation**
   - System program creates account
   - Initial state set
   - Rent reserve allocated

2. **Usage**
   - Program operations
   - State updates
   - Balance changes

3. **Closure**
   - Data cleared
   - Lamports reclaimed
   - Account recycled

<!-- Internal -->
[programs]: ./program.md
[program]: ./program.md
[pubkey]: ./pubkey.md
[instructions]: ./instructions-and-messages.md
[UTXO]: ./utxo.md