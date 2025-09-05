# Creating APL Tokens on Arch Network

This guide shows you how to create and manage fungible tokens on Arch Network using the built-in **APL (Arch Program Library) Token Program**. APL tokens are based on Solana's SPL token standard and provide a robust foundation for creating and managing tokens on Arch Network.

## What You'll Learn

By the end of this guide, you'll understand how to:
- **Create token mints** using the Arch CLI
- **Initialize token accounts** for holding tokens
- **Mint tokens** to accounts
- **Transfer tokens** between accounts
- **Approve delegations** for spending tokens
- **Burn tokens** and manage token lifecycle
- **Use advanced features** like multisig, freezing, and batch operations

## Overview
> Note: All arch-cli addresses, public keys, transaction IDs, and block hashes are base58 (32 bytes for IDs/pubkeys).


The APL Token Program is Arch Network's native token standard, providing:
- **SPL Token Compatibility**: Based on Solana's proven token standard
- **Bitcoin Integration**: All operations are recorded on Bitcoin
- **Comprehensive Features**: Minting, transferring, burning, delegation, freezing
- **Multisig Support**: Multiple signature authorities for enhanced security
- **CLI Integration**: Full command-line interface for token management

## Prerequisites

Before starting, ensure you have:
- **Rust 1.84.1+** and Cargo installed ([Install Rust](https://rustup.rs/))
- **Arch Network CLI** - [Download Latest](https://github.com/Arch-Network/arch-network/releases/latest)
- **Docker** - Required for local development
- **Running development environment** (see [Quick Start Guide](../getting-started/quick-start.md))

## APL Token Program ID

The APL Token Program has a fixed program ID:
```text
AplToken111111111111111111111111
```

## Quick Start: Create Your First Token

### Step 1: Start Local Environment

```bash
# Start local development environment
arch-cli orchestrate start

# Verify services are running
arch-cli orchestrate validator-status
arch-cli get-block-height
```

### Step 2: Create Configuration Profile

```bash
# Create a profile for local development
arch-cli config create-profile local \
    --bitcoin-node-endpoint http://127.0.0.1:18443 \
    --bitcoin-node-username bitcoin \
    --bitcoin-node-password bitcoinpass \
    --bitcoin-network regtest \
    --arch-node-url http://localhost:9002

# Set as default profile
arch-cli config set-default-profile local
```

### Step 3: Generate Demo Keys

```bash
# Create directory for demo keys
mkdir -p ~/DEMO_KEYS

# Generate keys for different roles
openssl rand -out ~/DEMO_KEYS/payer.key 32
openssl rand -out ~/DEMO_KEYS/mint_authority.key 32
openssl rand -out ~/DEMO_KEYS/mint.key 32

# Fund the payer account
arch-cli account airdrop --keypair-path ~/DEMO_KEYS/payer.key
```

### Step 4: Create Token Mint

```bash
# Create a new token mint with 6 decimals
arch-cli token create-mint \
    --keypair-path ~/DEMO_KEYS/mint.key \
    --decimals 6

# Save the mint address
export MINT=$(arch-cli token show-mint ~/DEMO_KEYS/mint.key | grep "Mint:" | awk '{print $2}')
echo "Mint address: $MINT"
```

### Step 5: Create Token Account

```bash
# Create an Associated Token Account (ATA) for the mint authority
arch-cli token create-account \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT"

# Save the ATA address
export ATA=$(arch-cli token show-account ~/DEMO_KEYS/mint_authority.key | grep "Address:" | awk '{print $2}')
echo "Token account: $ATA"
```

### Step 6: Mint Initial Supply

```bash
# Mint 1,000,000 tokens (1,000,000 raw units with 6 decimals = 1.000000 tokens)
arch-cli token mint \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --to "$ATA" \
    --amount 1000000
```

### Step 7: Verify Your Token

```bash
# Check mint information
arch-cli token show-mint "$MINT"

# Check account balance
arch-cli token balance "$ATA"

# Check mint supply
arch-cli token supply "$MINT"
```

## Advanced Token Operations

### Transferring Tokens

```bash
# Create a recipient account
openssl rand -out ~/DEMO_KEYS/recipient.key 32

# Create ATA for recipient
arch-cli token create-account \
    --keypair-path ~/DEMO_KEYS/recipient.key \
    --mint "$MINT"

# Get recipient ATA
export RECIPIENT_ATA=$(arch-cli token show-account ~/DEMO_KEYS/recipient.key | grep "Address:" | awk '{print $2}')

# Transfer 100,000 tokens (0.100000 with 6 decimals)
arch-cli token transfer \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --from "$ATA" \
    --to "$RECIPIENT_ATA" \
    --amount 100000
```

### Delegation and Approval

```bash
# Approve a delegate to spend up to 500,000 tokens
arch-cli token approve \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --from "$ATA" \
    --delegate ~/DEMO_KEYS/recipient.key \
    --amount 500000

# Later, revoke the delegation
arch-cli token revoke \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --from "$ATA"
```

### Account Control

```bash
# Freeze the account (requires freeze authority)
arch-cli token freeze-account \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --account "$ATA"

# Thaw the account
arch-cli token thaw-account \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --account "$ATA"
```

### Multisignature Operations

```bash
# Create a multisig with 2-of-3 threshold
arch-cli token create-multisig \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --signers "key1,key2,key3" \
    --threshold 2

# Save multisig address
export MULTISIG=$(arch-cli token multisig-show <MULTISIG_ADDRESS> | grep "Address:" | awk '{print $2}')

# Sign a transaction with multisig
arch-cli token multisig-sign \
    --keypair-path ~/DEMO_KEYS/key1.key \
    --multisig "$MULTISIG" \
    --transaction <TRANSACTION_DATA>

# Execute the signed transaction
arch-cli token multisig-execute \
    --keypair-path ~/DEMO_KEYS/key2.key \
    --multisig "$MULTISIG" \
    --transaction <SIGNED_TRANSACTION>
```

### Advanced Features

#### Checked Operations (Decimal Verification)

```bash
# Transfer with decimal verification
arch-cli token transfer-checked \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --from "$ATA" \
    --to "$RECIPIENT_ATA" \
    --amount 100000 \
    --decimals 6

# Mint with decimal verification
arch-cli token mint-to-checked \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --to "$ATA" \
    --amount 500000 \
    --decimals 6
```

#### Batch Operations

```bash
# Batch transfer to multiple accounts
arch-cli token batch-transfer \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --from "$ATA" \
    --transfers '[{"to":"account1","amount":100000},{"to":"account2","amount":200000}]'

# Batch mint to multiple accounts
arch-cli token batch-mint \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --mints '[{"to":"account1","amount":100000},{"to":"account2","amount":200000}]'
```

#### Authority Management

```bash
# Set new mint authority
arch-cli token set-authority \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --new-authority <NEW_AUTHORITY_PUBKEY> \
    --authority-type mint

# Set new freeze authority
arch-cli token set-authority \
    --keypair-path ~/DEMO_KEYS/mint_authority.key \
    --mint "$MINT" \
    --new-authority <NEW_FREEZE_AUTHORITY> \
    --authority-type freeze
```

## Utility Commands

### Information and Queries

```bash
# List all mints
arch-cli token mints

# List all accounts for a mint
arch-cli token accounts "$MINT"

# Convert amounts between raw and UI format
arch-cli token amount-to-ui "$MINT" 1000000  # Raw to UI
arch-cli token ui-to-amount "$MINT" 1.5      # UI to raw
```

### Account Lifecycle

```bash
# Close a token account (reclaims rent)
arch-cli token close-account \
    --keypair-path ~/DEMO_KEYS/recipient.key \
    --mint "$MINT" \
    --account "$RECIPIENT_ATA"
```

## Programmatic Token Creation

For developers who want to create tokens programmatically, here's how to use the APL token program directly:

### Project Setup

```bash
# Create project directory
mkdir arch-token-example
cd arch-token-example

# Initialize Rust project
cargo init --bin
```

### Dependencies

**Cargo.toml**
```toml
[package]
name = "arch_token_example"
version = "0.1.0"
edition = "2021"

[dependencies]
arch_sdk = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
arch_program = { git = "https://github.com/Arch-Network/arch-network", branch = "dev" }
apl-token = { git = "https://github.com/Arch-Network/arch-network", branch = "dev", features = ["no-entrypoint"] }
apl-associated-token-account = { git = "https://github.com/Arch-Network/arch-network", branch = "dev", features = ["no-entrypoint"] }
borsh = { version = "1.5.1", features = ["derive"] }
```

### Create Token Programmatically

```rust
use apl_token::{
    instruction,
    state::{Mint, Account},
};
use arch_sdk::{ArchRpcClient, generate_new_keypair};
use arch_program::pubkey::Pubkey;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = ArchRpcClient::new("http://localhost:9002");

    // Generate keypairs
    let (mint_keypair, mint_pubkey, _) = generate_new_keypair("regtest");
    let (authority_keypair, authority_pubkey, _) = generate_new_keypair("regtest");

    // Create mint account
    let mint_rent = client.get_minimum_balance_for_rent_exemption(Mint::LEN).await?;
    
    // Initialize mint
    let init_mint_ix = instruction::initialize_mint(
        &apl_token::id(),
        &mint_pubkey,
        &authority_pubkey,
        None, // No freeze authority
        6,    // Decimals
    )?;

    // Create and send transaction
    let signature = client.send_and_confirm_transaction_with_spinner(
        &[&mint_keypair, &authority_keypair],
        &[init_mint_ix],
        &mint_pubkey,
    ).await?;

    println!("Mint created: {}", mint_pubkey);
    println!("Transaction: {}", signature);

    Ok(())
}
```

## Best Practices

### Security
1. **Separate Authorities**: Use different keypairs for mint authority, freeze authority, and payer
2. **Multisig for High-Value Operations**: Implement multisig for minting and authority changes
3. **Freeze Authority**: Only set freeze authority if you need the ability to freeze accounts
4. **Key Management**: Store private keys securely and never share them

### Token Design
1. **Decimal Precision**: Choose appropriate decimals (6-9 is common)
2. **Supply Planning**: Plan your initial supply and minting schedule
3. **Metadata**: Consider adding off-chain metadata for name, symbol, and logo
4. **Access Control**: Design your authority structure carefully

### Development Workflow
1. **Local Testing**: Always test on local environment first
2. **Profile Management**: Use different profiles for different environments
3. **Transaction Monitoring**: Monitor transactions and verify state changes
4. **Error Handling**: Implement proper error handling in your applications

## Troubleshooting

### Common Issues

**Insufficient Balance:**
```bash
# Check account balance
arch-cli token balance <ACCOUNT_ADDRESS>

# Fund account if needed
arch-cli account airdrop --keypair-path <KEYPAIR_PATH>
```

**Invalid Authority:**
```bash
# Check mint authorities
arch-cli token show-mint <MINT_ADDRESS>

# Check account owner
arch-cli token show-account <ACCOUNT_ADDRESS>
```

**Transaction Failures:**
```bash
# Check transaction status
arch-cli tx confirm <SIGNATURE>

# View program logs
arch-cli tx log-program-messages <SIGNATURE>
```

### Getting Help

- **Discord Community**: [https://discord.gg/archnetwork](https://discord.gg/archnetwork)
- **GitHub Issues**: [https://github.com/Arch-Network/arch-node/issues](https://github.com/Arch-Network/arch-node/issues)
- **Documentation**: [https://docs.arch.network](https://docs.arch.network)

## Next Steps

- **Advanced Token Features**: Explore [APL Token Program](../apl/token-program.md) for detailed program information
- **Program Development**: Learn about [Writing Your First Program](writing-your-first-program.md)
- **Testing**: Understand [Testing Strategies](testing-guide.md)
- **Deployment**: Deploy to [Testnet and Mainnet](../getting-started/bitcoin-and-titan-setup.md)

---

**Congratulations!** You've successfully created and managed APL tokens on Arch Network. You now have the foundation to build sophisticated token-based applications that integrate seamlessly with Bitcoin.
