# Accounts

Accounts are a fundamental data structure in Arch that store state and are owned by [programs]. Each account has a unique address ([pubkey]) and contains data that can be modified by its owner program.

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
- The program that has exclusive rights to modify the account's data
- Only the owner program can debit the account and modify its data
- The owner can assign a new owner to the account

#### 2. Lamports
- The native token balance stored in the account
- Used for transaction fees and rent
- Can be transferred between accounts

#### 3. Data
- Program-specific data stored as a byte array
- Structure and interpretation determined by the owner program
- Size affects the account's rent cost

#### 4. Executable
- Boolean flag indicating if the account contains program code
- Executable accounts cannot be modified after deployment
- Only the loader program can set this flag

#### 5. Rent Epoch
- The epoch when the account will need to pay rent
- Accounts must maintain minimum balance for rent exemption
- Rent is based on data size and execution status

### Account Types:

1. **Program Accounts**
   - Contains executable program code
   - Created through program deployment
   - Immutable after deployment

2. **Data Accounts**
   - Stores program-specific state
   - Created and managed by programs
   - Mutable according to program logic

3. **Native Accounts**
   - System-level accounts (e.g., System Program)
   - Handle basic operations
   - Have special privileges

### Account Creation:

1. **System Program**
   - Creates new accounts
   - Allocates space
   - Assigns owner
   - Transfers initial lamports

2. **Program-Derived Accounts (PDAs)**
   - Deterministic addresses
   - No private key
   - Controlled by programs
   - Used for program state

### Security Model:

1. **Ownership**
   - Only owner can modify data
   - Only owner can debit lamports
   - Owner can reassign ownership

2. **Permissions**
   - Read access is public
   - Write access requires owner authorization
   - Execution requires executable flag

3. **Rent**
   - Prevents state bloat
   - Ensures resource efficiency
   - Exemption through minimum balance

### Best Practices:

1. **Account Management**
   - Validate account ownership
   - Check account permissions
   - Handle rent properly
   - Use appropriate account types

2. **Data Safety**
   - Validate all data modifications
   - Handle serialization carefully
   - Check account sizes
   - Maintain data integrity

3. **Program Design**
   - Use PDAs when appropriate
   - Minimize account creation
   - Optimize for rent costs
   - Follow security principles

### Common Operations:

1. **Creation**
```rust
SystemInstruction::CreateAccount {
    lamports: u64,
    space: u64,
    owner: Pubkey,
}
```

2. **Transfer**
```rust
SystemInstruction::Transfer {
    lamports: u64,
}
```

3. **Allocation**
```rust
SystemInstruction::Allocate {
    space: u64,
}
```

4. **Assignment**
```rust
SystemInstruction::Assign {
    owner: Pubkey,
}
```

<!-- Internal -->
[programs]: ./program.md
[pubkey]: ./pubkey.md 