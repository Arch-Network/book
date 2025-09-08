# Pubkey (Public Key)

A `Pubkey` represents a public key in the Arch Network, serving as a unique identifier for accounts, programs, and other entities. It's a fundamental type you'll use throughout your development with the Arch SDK.

## Overview

```rust,ignore
#[derive(Clone, Debug, Eq, PartialEq, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct Pubkey([u8; 32]);
```

A `Pubkey` is a 32-byte (256-bit) value derived from a private key using elliptic curve cryptography. Every account, program, and other entity on the Arch Network has a unique `Pubkey` that serves as its address.

## Creating Public Keys

### From a Private Key

```typescript
import { Keypair } from '@saturnbtcio/arch-sdk';

// Generate a new keypair
const keypair = Keypair.generate();
const publicKey = keypair.publicKey;

// From existing private key
const keypair2 = Keypair.fromSecretKey(secretKeyBytes);
const publicKey2 = keypair2.publicKey;
```

### From a String

```typescript
import { Pubkey } from '@saturnbtcio/arch-sdk';

// From base58 string
const publicKey = new Pubkey('11111111111111111111111111111112');

// From hex string
const publicKey2 = new Pubkey('0x1234567890abcdef...');
```

### From Bytes

```typescript
import { Pubkey } from '@saturnbtcio/arch-sdk';

// From 32-byte array
const bytes = new Uint8Array(32);
// ... fill with your bytes
const publicKey = new Pubkey(bytes);
```

## Common Operations

### Converting to Different Formats

```typescript
// Convert to base58 string
const base58String = publicKey.toBase58();

// Convert to hex string
const hexString = publicKey.toHex();

// Convert to bytes
const bytes = publicKey.toBytes();

// Convert to JSON
const json = publicKey.toJSON();
```

### Comparison

```typescript
// Check equality
const isEqual = publicKey1.equals(publicKey2);

// Compare public keys
const comparison = publicKey1.compare(publicKey2);

// Check if valid
const isValid = Pubkey.isValid(publicKeyString);
```

## Special Public Keys

### System Program
```typescript
import { Pubkey } from '@saturnbtcio/arch-sdk';

// System program public key
const systemProgram = Pubkey.systemProgram();
```

### Token Program
```typescript
// Token program public key
const tokenProgram = Pubkey.tokenProgram();
```

### Associated Token Account Program
```typescript
// Associated token account program public key
const ataProgram = Pubkey.associatedTokenAccountProgram();
```

## Program Derived Addresses (PDAs)

Program Derived Addresses are special public keys that are derived deterministically from a program ID and seeds, but have no corresponding private key.

```typescript
import { Pubkey } from '@saturnbtcio/arch-sdk';

// Create a PDA
const [pda, bump] = Pubkey.findProgramAddressSync(
  [
    Buffer.from('my-seed'),
    userPublicKey.toBuffer(),
    Buffer.from('additional-seed')
  ],
  programId
);

console.log('PDA:', pda.toBase58());
console.log('Bump:', bump);
```

### Using PDAs in Programs

```rust,ignore
use arch_sdk::{Pubkey, ProgramError};

// Derive PDA in program
let (pda, bump) = Pubkey::find_program_address(
    &[
        b"my-seed",
        user_pubkey.as_ref(),
        b"additional-seed"
    ],
    program_id
);

// Verify PDA
if pda != expected_pda {
    return Err(ProgramError::InvalidArgument);
}
```

## Validation

### Input Validation

```typescript
// Validate public key format
function validatePublicKey(input: string): boolean {
  try {
    const pubkey = new Pubkey(input);
    return true;
  } catch (error) {
    return false;
  }
}

// Check if string is valid public key
const isValidKey = Pubkey.isValid(userInput);
```

### Security Considerations

```typescript
// Always validate public keys from user input
function processUserAccount(accountString: string) {
  if (!Pubkey.isValid(accountString)) {
    throw new Error('Invalid public key format');
  }
  
  const publicKey = new Pubkey(accountString);
  // ... process the account
}
```

## Common Patterns

### Account Management

```typescript
// Store public keys in your application
interface UserAccount {
  publicKey: Pubkey;
  balance: number;
  isProgram: boolean;
}

// Create account references
const accounts: UserAccount[] = [
  {
    publicKey: new Pubkey('11111111111111111111111111111112'),
    balance: 1000,
    isProgram: false
  }
];
```

### Transaction Building

```typescript
// Use public keys in transactions
const instruction = new Instruction({
  programId: myProgramId,
  accounts: [
    { pubkey: userPublicKey, isSigner: true, isWritable: true },
    { pubkey: recipientPublicKey, isSigner: false, isWritable: true }
  ],
  data: instructionData
});
```

## Error Handling

```typescript
try {
  const publicKey = new Pubkey(userInput);
} catch (error) {
  if (error instanceof PublicKeyError) {
    console.error('Invalid public key:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

### Security
- **Always validate input**: Never trust user-provided public key strings
- **Use type safety**: Take advantage of TypeScript/Rust type systems
- **Verify ownership**: Check that accounts are owned by expected programs

### Performance
- **Cache public keys**: Avoid recreating the same public key objects
- **Use constants**: Define well-known public keys as constants
- **Batch operations**: Process multiple public keys together when possible

### Development
- **Use meaningful names**: Give public key variables descriptive names
- **Document usage**: Explain what each public key represents
- **Test edge cases**: Test with invalid and edge-case public keys

## Examples

For complete examples using public keys, see:
- **[Hello World](https://github.com/Arch-Network/arch-examples/tree/main/examples/helloworld)** - Basic public key usage
- **[Account Management](https://github.com/Arch-Network/arch-examples/tree/main/examples/account)** - Working with accounts
- **[PDA Examples](https://github.com/Arch-Network/arch-examples/tree/main/examples/pda)** - Program derived addresses

## Source Code

The `Pubkey` implementation is available in the [Arch Examples Repository](https://github.com/Arch-Network/arch-examples/blob/main/program/src/pubkey.rs). 