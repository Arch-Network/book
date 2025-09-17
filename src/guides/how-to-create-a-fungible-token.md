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
    --arch-node-url http://localhost:9002 \
    --titan-url http://127.0.0.1:3030

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
# Create a new token mint with 6 decimals (SPL-style)
# Provide the mint authority and payer; optionally provide a mint keypair
arch-cli token create-mint \
  --decimals 6 \
  --mint-authority ~/DEMO_KEYS/mint_authority.key \
  --mint-keypair-path ~/DEMO_KEYS/mint.key \
  --keypair-path  ~/DEMO_KEYS/payer.key

# Save the mint address (disable colors to parse reliably)
export MINT=$(NO_COLOR=1 arch-cli token show-mint ~/DEMO_KEYS/mint.key | awk -F': ' '/^Address:/{print $2}')
echo "Mint address: $MINT"
```

### Step 5: Create Token Account

```bash
# Create an Associated Token Account (ATA) for the mint authority
arch-cli token create-account \
  --mint "$MINT" \
  --owner ~/DEMO_KEYS/mint_authority.key \
  --keypair-path  ~/DEMO_KEYS/payer.key

# Save the ATA address from the command output
export ATA=$(NO_COLOR=1 arch-cli token create-account \
  --mint "$MINT" \
  --owner ~/DEMO_KEYS/mint_authority.key \
  --keypair-path  ~/DEMO_KEYS/payer.key \
  | awk -F': ' '/^Account Address:/{print $2; exit}')
echo "Token account: $ATA"
```

### Step 6: Mint Initial Supply

```bash
# Mint 1,000,000 raw units (with 6 decimals = 1.000000 tokens)
# Uses positional args for mint address and amount, and auto-creates ATA if needed
arch-cli token mint "$MINT" 1000000 \
  --authority ~/DEMO_KEYS/mint_authority.key \
  --auto-create-ata
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

# Create ATA for recipient (payer funds creation)
arch-cli token create-account \
  --mint "$MINT" \
  --owner ~/DEMO_KEYS/recipient.key \
  --keypair-path  ~/DEMO_KEYS/payer.key

# Get recipient ATA from output
export RECIPIENT_ATA=$(NO_COLOR=1 arch-cli token create-account \
  --mint "$MINT" \
  --owner ~/DEMO_KEYS/recipient.key \
  --keypair-path  ~/DEMO_KEYS/payer.key \
  | awk -F': ' '/^Account Address:/{print $2; exit}')

# Transfer 100,000 raw units (0.100000 with 6 decimals)
# Uses positional args for source, destination, amount; provide the owner keypair
arch-cli token transfer "$ATA" "$RECIPIENT_ATA" 100000 \
  --owner ~/DEMO_KEYS/mint_authority.key
```

### Delegation and Approval

```bash
# Approve a delegate to spend up to 500,000 raw units
# Provide the delegate's base58 public key (32-byte). If you only have a key file,
# run a one-time airdrop with that key to print its public key, then use that value here.
export DELEGATE_PUBKEY=<RECIPIENT_PUBKEY_BASE58>
arch-cli token approve "$ATA" "$DELEGATE_PUBKEY" 500000 \
  --owner ~/DEMO_KEYS/mint_authority.key

# Later, revoke the delegation
arch-cli token revoke "$ATA" \
  --owner ~/DEMO_KEYS/mint_authority.key
```

### Account Control

```bash
# Freeze the account (requires freeze authority)
arch-cli token freeze-account "$ATA" \
  --authority ~/DEMO_KEYS/mint_authority.key

# Thaw the account
arch-cli token thaw-account "$ATA" \
  --authority ~/DEMO_KEYS/freeze_authority.key
```

### Multisignature Operations

```bash
# Create a multisig with 2-of-3 threshold
arch-cli token create-multisig 2 \
  --signers ~/DEMO_KEYS/mint_authority.key,~/DEMO_KEYS/new_mint_authority.key,~/DEMO_KEYS/freeze_authority.key \
  --keypair-path ~/DEMO_KEYS/payer.key

# Show multisig account details
arch-cli token multisig-show <MULTISIG_ADDRESS>

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
# Prepare JSON files and pass their paths to the batch commands
# Example transfers.json: [{"source_account":"<SRC>","destination_account":"<DST>","amount":12345,"owner_keypair_path":"~/DEMO_KEYS/mint_authority.key"}]
arch-cli token batch-transfer ./transfers.json \
  --keypair-path ~/DEMO_KEYS/payer.key

# Example mints.json: [{"mint_address":"<MINT>","account_address":"<DST>","amount":1000000,"authority_keypair_path":"~/DEMO_KEYS/mint_authority.key"}]
arch-cli token batch-mint ./mints.json \
  --keypair-path ~/DEMO_KEYS/payer.key
```

#### Authority Management

```bash
# Set new mint authority
arch-cli token set-authority "$MINT" \
  --authority-type mint \
  --new-authority <NEW_AUTHORITY_PUBKEY_BASE58> \
  --current-authority ~/DEMO_KEYS/mint_authority.key

# Set new freeze authority
arch-cli token set-authority "$MINT" \
  --authority-type freeze \
  --new-authority <NEW_FREEZE_AUTHORITY_BASE58> \
  --current-authority ~/DEMO_KEYS/mint_authority.key
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
arch-cli token close-account "$RECIPIENT_ATA" <DESTINATION_PUBKEY> \
  --owner ~/DEMO_KEYS/mint_authority.key
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

```rust,ignore
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
