# Account

Accounts are the fundamental data storage unit in the Arch Network. They hold state, store data, and define ownership relationships. Understanding accounts is crucial for building applications on Arch.

## Overview

Every piece of data on the Arch Network is stored in an account. Accounts can hold:
- **Program code** (executable accounts)
- **Application data** (data accounts)
- **User balances** (token accounts)
- **Configuration settings** (configuration accounts)

## Account Structure

### AccountInfo

The `AccountInfo` struct provides a view into an account during program execution:

```rust
#[derive(Clone)]
#[repr(C)]
pub struct AccountInfo<'a> {
    pub key: &'a Pubkey,           // Account's public key (address)
    pub utxo: &'a UtxoMeta,        // Associated UTXO metadata
    pub data: Rc<RefCell<&'a mut [u8]>>, // Account data
    pub owner: &'a Pubkey,         // Program that owns this account
    pub is_signer: bool,           // Whether account signed the transaction
    pub is_writable: bool,         // Whether account data can be modified
    pub is_executable: bool,       // Whether account contains executable code
}
```

### AccountMeta

The `AccountMeta` struct describes how an account is used in a transaction:

```rust
#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
#[repr(C)]
pub struct AccountMeta {
    pub pubkey: Pubkey,    // Account's public key
    pub is_signer: bool,   // Must the account sign the transaction?
    pub is_writable: bool, // Can the account's data be modified?
}
```

## Creating Accounts

### Using the SDK

```typescript
import { Connection, Keypair, SystemProgram } from '@saturnbtcio/arch-sdk';

// Generate a new account keypair
const newAccount = Keypair.generate();

// Create account instruction
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: newAccount.publicKey,
  lamports: 1000000, // Rent-exempt balance
  space: 256,        // Account data size
  programId: myProgramId
});

// Send transaction
const transaction = new Transaction()
  .add(createAccountInstruction);

const signature = await connection.sendAndConfirmTransaction(
  transaction,
  [payer, newAccount]
);
```

### Using the Faucet (Development)

```typescript
// Create and fund account with faucet (testnet/devnet only)
const newAccount = Keypair.generate();

const transaction = await connection.createAccountWithFaucet(
  newAccount.publicKey
);

console.log('Account created and funded:', newAccount.publicKey.toBase58());
```

## Reading Account Data

### Get Account Information

```typescript
// Get basic account info
const accountInfo = await connection.getAccountInfo(publicKey);

if (accountInfo) {
  console.log('Owner:', accountInfo.owner.toBase58());
  console.log('Balance:', accountInfo.lamports);
  console.log('Data length:', accountInfo.data.length);
  console.log('Is executable:', accountInfo.executable);
}
```

### Get Multiple Accounts

```typescript
// Get multiple accounts at once
const accounts = await connection.getMultipleAccountsInfo([
  publicKey1,
  publicKey2,
  publicKey3
]);

accounts.forEach((account, index) => {
  if (account) {
    console.log(`Account ${index}:`, account.owner.toBase58());
  } else {
    console.log(`Account ${index}: Not found`);
  }
});
```

### Query Program Accounts

```typescript
// Get all accounts owned by a program
const programAccounts = await connection.getProgramAccounts(programId);

// With filters
const filteredAccounts = await connection.getProgramAccounts(programId, {
  filters: [
    {
      dataSize: 165 // Only accounts with exactly 165 bytes
    },
    {
      memcmp: {
        offset: 0,
        bytes: '3Mc6vR'  // Base58 encoded bytes to match at offset 0
      }
    }
  ]
});
```

## Account Ownership

### System Program Accounts

By default, all accounts are owned by the System Program:

```typescript
import { SystemProgram } from '@saturnbtcio/arch-sdk';

// Check if account is owned by system program
const isSystemAccount = accountInfo.owner.equals(SystemProgram.programId);
```

### Program-Owned Accounts

Programs can own accounts to store their data:

```typescript
// Check if account is owned by your program
const isOwnedByMyProgram = accountInfo.owner.equals(myProgramId);

// Transfer ownership (only the current owner can do this)
const transferInstruction = SystemProgram.assign({
  accountPubkey: accountPublicKey,
  programId: newOwnerProgramId
});
```

## Working with Account Data

### Serialization

```typescript
// Serialize data to store in account
import { serialize, deserialize } from 'borsh';

// Define your data structure
class MyAccountData {
  constructor(public value: number, public name: string) {}
  
  static schema = new Map([
    [MyAccountData, {
      kind: 'struct',
      fields: [
        ['value', 'u64'],
        ['name', 'string']
      ]
    }]
  ]);
}

// Serialize for storage
const data = new MyAccountData(42, 'Hello');
const serialized = serialize(MyAccountData.schema, data);

// Deserialize from account
const deserialized = deserialize(MyAccountData.schema, accountData);
```

### Updating Account Data

```rust
// In your program
use arch_sdk::{AccountInfo, ProgramResult};

pub fn update_account_data(
    account_info: &AccountInfo,
    new_value: u64
) -> ProgramResult {
    // Check ownership
    if account_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Check if writable
    if !account_info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Update data
    let mut data = account_info.data.borrow_mut();
    // ... update data
    
    Ok(())
}
```

## Account Security

### Validation

```typescript
// Always validate account ownership
function validateAccountOwnership(
  account: AccountInfo,
  expectedOwner: Pubkey
): boolean {
  return account.owner.equals(expectedOwner);
}

// Check account signatures
function validateAccountSignature(
  account: AccountInfo,
  requiredSigner: Pubkey
): boolean {
  return account.is_signer && account.key.equals(requiredSigner);
}
```

### Access Control

```rust
// Program-side validation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let account_info = &accounts[0];
    
    // Verify ownership
    if account_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Verify signer
    if !account_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Verify writable
    if !account_info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Process the instruction
    Ok(())
}
```

## Common Patterns

### Account Initialization

```typescript
// Initialize account with default data
const initializeInstruction = new Instruction({
  programId: myProgramId,
  accounts: [
    { pubkey: newAccount.publicKey, isSigner: true, isWritable: true },
    { pubkey: payer.publicKey, isSigner: true, isWritable: false }
  ],
  data: Buffer.from([0]) // Initialize instruction
});
```

### Account Closure

```typescript
// Close account and reclaim rent
const closeInstruction = new Instruction({
  programId: myProgramId,
  accounts: [
    { pubkey: accountToClose.publicKey, isSigner: true, isWritable: true },
    { pubkey: destination.publicKey, isSigner: false, isWritable: true }
  ],
  data: Buffer.from([255]) // Close instruction
});
```

## Error Handling

```typescript
try {
  const accountInfo = await connection.getAccountInfo(publicKey);
  
  if (!accountInfo) {
    throw new Error('Account not found');
  }
  
  if (!accountInfo.executable) {
    throw new Error('Account is not executable');
  }
  
} catch (error) {
  if (error instanceof AccountNotFoundError) {
    console.error('Account does not exist');
  } else {
    console.error('Error fetching account:', error);
  }
}
```

## Best Practices

### Security
- **Always validate ownership**: Check that accounts are owned by expected programs
- **Verify signatures**: Ensure required accounts have signed the transaction
- **Check permissions**: Verify accounts have appropriate read/write permissions
- **Validate data**: Always validate account data before processing

### Performance
- **Batch account queries**: Use `getMultipleAccountsInfo` for multiple accounts
- **Use filters**: Apply filters when querying program accounts
- **Cache account data**: Cache frequently accessed account information
- **Monitor account changes**: Subscribe to account changes for real-time updates

### Development
- **Use TypeScript**: Take advantage of type safety for account structures
- **Document account layouts**: Clearly document your account data structures
- **Test edge cases**: Test with empty accounts, invalid data, etc.
- **Handle errors gracefully**: Provide meaningful error messages

## Examples

For complete examples working with accounts, see:
- **[Account Management](https://github.com/Arch-Network/arch-examples/tree/main/examples/account)** - Creating and managing accounts
- **[Data Storage](https://github.com/Arch-Network/arch-examples/tree/main/examples/storage)** - Storing and retrieving data
- **[Token Accounts](https://github.com/Arch-Network/arch-examples/tree/main/examples/token)** - Working with token accounts

## Source Code

The account implementation is available in the [Arch Examples Repository](https://github.com/Arch-Network/arch-examples/blob/main/program/src/account.rs). 