# Arch CLI Reference Guide

This comprehensive guide covers all available commands and options in the Arch Network CLI tool.

## Table of Contents

- [Global Options](#global-options)
- [Configuration Management](#configuration-management)
- [Validator Management](#validator-management)
- [Account Operations](#account-operations)
- [Program Deployment](#program-deployment)
- [Transaction Operations](#transaction-operations)
- [Block and Network Info](#block-and-network-info)
- [APL Token Operations](#apl-token-operations)
- [Orchestration Commands](#orchestration-commands)
- [Error Reference](#error-reference)

## Global Options

These options can be used with any command:

```bash
# Specify network mode
arch-cli --network-mode devnet|testnet|mainnet|localnet

# Use configuration profile
arch-cli --profile <PROFILE_NAME>

# Show help
arch-cli --help

# Show version
arch-cli --version
```

> Note: All user-facing identifiers in arch-cli (addresses, public keys, transaction IDs, block hashes) are base58.

**Network Modes:**
- `devnet`: Development network (default)
- `testnet`: Test network
- `mainnet`: Production network
- `localnet`: Local development network

## Configuration Management

### Create Profile
Create a new configuration profile for connecting to Bitcoin and Arch Network nodes:

```bash
arch-cli config create-profile <NAME> \
    --bitcoin-node-endpoint <URL> \
    --bitcoin-node-username <USERNAME> \
    --bitcoin-node-password <PASSWORD> \
    --bitcoin-network <NETWORK> \
    --arch-node-url <URL>
```

**Arguments:**
- `<NAME>`: Name of the profile
- `--bitcoin-node-endpoint`: Bitcoin node endpoint URL (e.g., "http://127.0.0.1:18443")
- `--bitcoin-node-username`: Bitcoin node RPC username
- `--bitcoin-node-password`: Bitcoin node RPC password
- `--bitcoin-network`: Bitcoin network ("mainnet", "testnet", or "regtest")
- `--arch-node-url`: Arch Network node URL

**Example:**
```bash
arch-cli config create-profile testnet \
    --bitcoin-node-endpoint http://bitcoin-rpc.test.arch.network:80 \
    --bitcoin-node-username bitcoin \
    --bitcoin-node-password 0F_Ed53o4kR7nxh3xNaSQx-2M3TY16L55mz5y9fjdrk \
    --bitcoin-network testnet \
    --arch-node-url http://localhost:9002
```

### List Profiles
List all available configuration profiles:

```bash
arch-cli config list-profiles
```

### Show Profile
Display detailed information about a specific profile:

```bash
arch-cli config show-profile <NAME>
```

### Update Profile
Update an existing profile's settings:

```bash
arch-cli config update-profile <NAME> \
    [--bitcoin-node-endpoint <URL>] \
    [--bitcoin-node-username <USERNAME>] \
    [--bitcoin-node-password <PASSWORD>] \
    [--bitcoin-network <NETWORK>] \
    [--arch-node-url <URL>]
```

All update arguments are optional. Only specified fields will be updated.

### Delete Profile
Delete a configuration profile:

```bash
arch-cli config delete-profile <NAME>
```

**Note:** The default profile cannot be deleted.

### Set Default Profile
Set which profile is used by default:

```bash
arch-cli config set-default-profile <NAME>
```

## Account Operations

### Create Account
Create a new account:

```bash
arch-cli account create \
    --keypair-path <PATH> \
    --owner <OWNER> \
    --lamports <LAMPORTS> \
    --space <SPACE>
```

**Arguments:**
- `--keypair-path`: Path to the keypair file
- `--owner`: Public key of the program that will own the account
- `--lamports`: Initial balance in lamports
- `--space`: Account size in bytes

### Fund Account
Fund an existing account using the faucet:

```bash
arch-cli account airdrop \
    --keypair-path <PATH> \
    [--lamports <LAMPORTS>]
```

**Arguments:**
- `--keypair-path`: Path to the keypair file
- `--lamports`: Amount to airdrop (default: 1000000000 lamports)

### Change Account Owner
Change the owner of an account:

```bash
arch-cli account change-owner \
    --keypair-path <PATH> \
    --account <ACCOUNT> \
    --new-owner <NEW_OWNER>
```

**Arguments:**
- `--keypair-path`: Path to the payer's keypair file
- `--account`: Public key of the account to change
- `--new-owner`: Public key of the new owner

### Assign UTXOs
Assign UTXOs to an account:

```bash
arch-cli account assign-utxo \
    --keypair-path <PATH> \
    --utxo <UTXO> \
    --account <ACCOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the keypair file
- `--utxo`: UTXO identifier
- `--account`: Public key of the account

## Program Deployment

### Deploy Program
Deploy a compiled program to the network:

```bash
arch-cli deploy <PROGRAM_PATH>
```

**Arguments:**
- `<PROGRAM_PATH>`: Path to the directory containing the compiled program (.so file)

Notes:
- If keypairs are missing, you can use `--generate-if-missing` to auto-generate them.
- By default (non-mainnet), the deploy command automatically creates and funds the authority account if it does not exist, or funds it if its balance is insufficient for deployment. On mainnet, auto-funding is disabled and the authority must be pre-funded. You can disable auto-funding explicitly with `--no-autofund`.

**Example:**
```bash
arch-cli deploy examples/helloworld/
```

## Transaction Operations

### Get Transaction
Retrieve transaction information:

```bash
arch-cli tx get <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID (base58, 32 bytes)

### Confirm Transaction
Check if a transaction is confirmed:

```bash
arch-cli tx confirm <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID (base58, 32 bytes)

### Log Program Messages
Log program messages for a transaction:

```bash
arch-cli tx log-program-messages <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID (base58, 32 bytes)

## Block and Network Info

### Get Block
Retrieve block information:

```bash
arch-cli get-block <BLOCK_HASH>
```

**Arguments:**
- `<BLOCK_HASH>`: Block hash (base58, 32 bytes)

### Get Block Height
Get the current block height:

```bash
arch-cli get-block-height
```

### Get Group Key
Fetch the network's account address:

```bash
arch-cli get-group-key <PUBKEY>
```

**Arguments:**
- `<PUBKEY>`: Public key to use for group key calculation

### Show Account
Display account information:

```bash
arch-cli show <ACCOUNT_ADDRESS>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to display

## APL Token Operations

The Arch CLI provides comprehensive token management capabilities for APL (Arch Program Library) tokens. All token commands support the same global options as other CLI commands.

### Mint Management

#### Create Mint
Create a new token mint:

```bash
arch-cli token create-mint \
  --decimals <DECIMALS> \
  --mint-authority <MINT_AUTHORITY_KEYPAIR_PATH> \
  [--freeze-authority <FREEZE_AUTHORITY_KEYPAIR_PATH>] \
  [--mint-keypair-path <MINT_KEYPAIR_PATH>] \
  --keypair-path <PAYER_KEYPAIR_PATH>
```

**Arguments:**
- `--decimals`: Number of decimal places (0-9)
- `--mint-authority`: Keypair path for the mint authority
- `--freeze-authority`: Keypair path for the freeze authority (optional)
- `--mint-keypair-path`: Keypair path for the mint account (optional; if omitted, generated in-memory)
- `--keypair-path`: Keypair path for the fee payer

#### Show Mint
Display mint information:

```bash
arch-cli token show-mint <MINT_ADDRESS_OR_MINT_KEYPAIR_PATH>
```

**Arguments:**
- `<MINT_ADDRESS_OR_MINT_KEYPAIR_PATH>`: Base58 mint address (32 bytes) or a keypair file path from which the address is derived

### Account Management

#### Create Account
Create a new token account (Associated Token Account for an owner and mint):

```bash
arch-cli token create-account \
  --mint <MINT_ADDRESS> \
  --owner <OWNER_KEYPAIR_PATH> \
  --keypair-path <PAYER_KEYPAIR_PATH>
```

**Arguments:**
- `--mint`: Base58 public key of the mint (32 bytes)
- `--owner`: Keypair path for the wallet that will own the token account
- `--keypair-path`: Keypair path for the fee payer

#### Show Account
Display token account information:

```bash
arch-cli token show-account <ACCOUNT_ADDRESS>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the token account

### Token Operations

#### Mint Tokens
Mint tokens to an account:

```bash
arch-cli token mint <MINT_ADDRESS> <AMOUNT> \
  --authority <MINT_AUTHORITY_KEYPAIR_PATH> \
  [--account-address <ACCOUNT_ADDRESS>] \
  [--auto-create-ata] \
  [--multisig <MULTISIG_ADDRESS>] \
  [--signers <SIGNER1_KEYPAIR_PATH,SIGNER2_KEYPAIR_PATH,...>] \
  [--keypair-path <FEE_PAYER_KEYPAIR_PATH>]
```

**Arguments:**
- `<MINT_ADDRESS>`: Base58 public key of the mint (32 bytes)
- `<AMOUNT>`: Amount to mint (raw units)
- `--authority`: Keypair path for the mint authority
- `--account-address`: Base58 token account address; if omitted, mints to the mint authority's ATA
- `--auto-create-ata`: Create the ATA if it does not exist
- `--multisig`: Base58 multisig authority address (when mint authority is multisig)
- `--signers`: Comma-separated list of signer keypair paths for multisig
- `--keypair-path`: Fee payer keypair path (optional)

#### Transfer Tokens
Transfer tokens between accounts:

```bash
arch-cli token transfer <SOURCE_ACCOUNT> <DESTINATION_ACCOUNT> <AMOUNT> \
  --owner <OWNER_KEYPAIR_PATH> \
  [--multisig <MULTISIG_ADDRESS>] \
  [--signers <SIGNER1_KEYPAIR_PATH,SIGNER2_KEYPAIR_PATH,...>] \
  [--keypair-path <FEE_PAYER_KEYPAIR_PATH>]
```

**Arguments:**
- `<SOURCE_ACCOUNT>`: Base58 token account address
- `<DESTINATION_ACCOUNT>`: Base58 token account address
- `<AMOUNT>`: Amount to transfer (raw units)
- `--owner`: Keypair path for the source account owner
- `--multisig`, `--signers`, `--keypair-path`: As described above

#### Burn Tokens
Burn tokens from an account:

```bash
arch-cli token burn <ACCOUNT_ADDRESS> <AMOUNT> \
  --owner <OWNER_KEYPAIR_PATH> \
  [--multisig <MULTISIG_ADDRESS>] \
  [--signers <SIGNER1_KEYPAIR_PATH,SIGNER2_KEYPAIR_PATH,...>] \
  [--keypair-path <FEE_PAYER_KEYPAIR_PATH>]
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `<AMOUNT>`: Amount to burn (raw units)
- `--owner`: Keypair path for the account owner

### Delegation

#### Approve Delegate
Approve a delegate for spending:

```bash
arch-cli token approve <ACCOUNT_ADDRESS> <DELEGATE_ADDRESS> <AMOUNT> \
  --owner <OWNER_KEYPAIR_PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `<DELEGATE_ADDRESS>`: Base58 public key of the delegate (32 bytes)
- `<AMOUNT>`: Allowance (raw units)
- `--owner`: Keypair path for the account owner

#### Revoke Delegate
Revoke delegate authority:

```bash
arch-cli token revoke <ACCOUNT_ADDRESS> \
  --owner <OWNER_KEYPAIR_PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `--owner`: Keypair path for the account owner

### Account Control

#### Freeze Account
Freeze a token account:

```bash
arch-cli token freeze-account <ACCOUNT_ADDRESS> \
  --authority <FREEZE_AUTHORITY_KEYPAIR_PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `--authority`: Keypair path for the freeze authority

#### Thaw Account
Thaw a frozen account:

```bash
arch-cli token thaw-account <ACCOUNT_ADDRESS> \
  --authority <FREEZE_AUTHORITY_KEYPAIR_PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `--authority`: Keypair path for the freeze authority

### Multisignature Operations

#### Create Multisig
Create a multisignature authority:

```bash
arch-cli token create-multisig <M_OF_N> \
  --signers <SIGNER1_KEYPAIR_PATH,SIGNER2_KEYPAIR_PATH,...> \
  --keypair-path <PAYER_KEYPAIR_PATH>
```

**Arguments:**
- `<M_OF_N>`: Number of signatures required
- `--signers`: Comma-separated list of signer keypair paths
- `--keypair-path`: Fee payer keypair path

#### Sign Multisig
Sign a transaction with multisig:

```bash
arch-cli token multisig-sign \
    --keypair-path <PATH> \
    --multisig <MULTISIG> \
    --transaction <TRANSACTION>
```

**Arguments:**
- `--keypair-path`: Path to the signer's keypair file
- `--multisig`: Public key of the multisig account
- `--transaction`: Transaction to sign

#### Execute Multisig
Execute a signed multisig transaction:

```bash
arch-cli token multisig-execute \
    --keypair-path <PATH> \
    --multisig <MULTISIG> \
    --transaction <TRANSACTION>
```

**Arguments:**
- `--keypair-path`: Path to the executor's keypair file
- `--multisig`: Public key of the multisig account
- `--transaction`: Signed transaction to execute

#### Show Multisig
Display multisig account information:

```bash
arch-cli token multisig-show <MULTISIG_ADDRESS>
```

**Arguments:**
- `<MULTISIG_ADDRESS>`: Public key of the multisig account

### Utility Commands

#### Balance
Display token balance:

```bash
arch-cli token balance <ACCOUNT_ADDRESS>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the token account

#### Supply
Display mint supply:

```bash
arch-cli token supply <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint

#### List Accounts
List token accounts for a mint:

```bash
arch-cli token accounts <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint

#### List Mints
List all mints:

```bash
arch-cli token mints
```

#### Amount Conversion
Convert between raw and UI amounts:

```bash
# Convert raw amount to UI format
arch-cli token amount-to-ui <MINT_ADDRESS> <RAW_AMOUNT>

# Convert UI amount to raw format
arch-cli token ui-to-amount <MINT_ADDRESS> <UI_AMOUNT>
```

### Advanced Token Features

#### Checked Operations
Perform operations with decimal verification:

```bash
# Transfer with decimal verification
arch-cli token transfer-checked <SOURCE_ACCOUNT> <DESTINATION_ACCOUNT> <AMOUNT> <DECIMALS> \
  --owner <OWNER_KEYPAIR_PATH>

# Approve with decimal verification
arch-cli token approve-checked <ACCOUNT_ADDRESS> <DELEGATE_ADDRESS> <AMOUNT> <DECIMALS> \
  --owner <OWNER_KEYPAIR_PATH>

# Mint with decimal verification
arch-cli token mint-to-checked <MINT_ADDRESS> <ACCOUNT_ADDRESS> <AMOUNT> <DECIMALS> \
  --authority <MINT_AUTHORITY_KEYPAIR_PATH>

# Burn with decimal verification
arch-cli token burn-checked <ACCOUNT_ADDRESS> <AMOUNT> <DECIMALS> \
  --owner <OWNER_KEYPAIR_PATH>
```

#### Authority Management
Set authority on a mint or account:

```bash
arch-cli token set-authority <TARGET_ADDRESS> \
  --authority-type <mint|freeze|account_owner|close_account> \
  --new-authority <NEW_AUTHORITY_BASE58|none> \
  --current-authority <CURRENT_AUTHORITY_KEYPAIR_PATH>
```

**Arguments:**
- `<TARGET_ADDRESS>`: Base58 mint or account address
- `--authority-type`: Type of authority to set
- `--new-authority`: Base58 address of new authority, or `none`
- `--current-authority`: Keypair path for the current authority

#### Account Management
Close a token account:

```bash
arch-cli token close-account <ACCOUNT_ADDRESS> <DESTINATION_PUBKEY> \
  --owner <OWNER_KEYPAIR_PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Base58 token account address
- `<DESTINATION_PUBKEY>`: Base58 public key to receive reclaimed lamports
- `--owner`: Keypair path for the account owner

#### Batch Operations
Perform multiple operations at once:

```bash
# Batch transfer tokens (JSON file path)
arch-cli token batch-transfer <TRANSFERS_JSON_PATH> \
  --keypair-path <PAYER_KEYPAIR_PATH>

# Batch mint tokens (JSON file path)
arch-cli token batch-mint <MINTS_JSON_PATH> \
  --keypair-path <PAYER_KEYPAIR_PATH>
```

## Orchestration Commands

### Start Local Environment
Start the complete local development environment:

```bash
arch-cli orchestrate start [--local <PATH>] [--no-bitcoind]
```

**Arguments:**
- `--local <PATH>`: Path to local source code for building images
- `--no-bitcoind`: Skip starting local Bitcoin node (use remote RPC)

**Examples:**
```bash
# Start with remote Bitcoin RPC
arch-cli orchestrate start

# Start with local source code
arch-cli orchestrate start --local "$(pwd)"

# Start without local bitcoind
arch-cli orchestrate start --local "$(pwd)" --no-bitcoind
```

### Stop Local Environment
Stop all local services:

```bash
arch-cli orchestrate stop
```

### Validator Management
Manage the local validator service:

```bash
# Start only the validator
arch-cli orchestrate validator-start

# Stop only the validator
arch-cli orchestrate validator-stop

# Restart only the validator
arch-cli orchestrate validator-restart

# Show validator status
arch-cli orchestrate validator-status
```

### Reset Environment
Reset the development environment:

```bash
# Reset entire environment
arch-cli orchestrate reset

# Reset only validator
arch-cli orchestrate validator-reset
```

### Bitcoin Mining
Mine Bitcoin blocks in regtest mode:

```bash
arch-cli orchestrate mine-blocks [--num-blocks <COUNT>]
```

**Arguments:**
- `--num-blocks <COUNT>`: Number of blocks to mine (default: 1)

**Examples:**
```bash
# Mine 1 block
arch-cli orchestrate mine-blocks

# Mine 10 blocks
arch-cli orchestrate mine-blocks --num-blocks 10
```

## Error Reference

### General Errors
- `Invalid length`: Input data is not the correct length (usually for base58 strings encoding 32 bytes)
- `Failed to process result: <operation>`: Failed to process RPC response
- `Failed to change account owner`: Failed to change the account's owner

### Profile Errors
- `Profile not found`: The specified profile does not exist
- `Invalid URL format`: The provided URL is not properly formatted
- `Invalid Bitcoin network`: Bitcoin network must be one of: mainnet, testnet, regtest
- `Cannot delete default profile`: The default profile cannot be deleted

### Deploy Command Errors
- `Invalid deploy path '<PATH>'`: The specified directory does not exist
- `No .so file found in <PATH>`: No compiled program file found in the deploy directory
- `Keypair file '<PROGRAM_NAME>-keypair.json' not found in <PATH>`: Missing keypair file

### Account Creation Errors
- `Missing required fields`: One or more required fields are missing
- `Failed to create account`: General account creation failure
- `Faucet funding failed`: Could not fund the account using the faucet

### Token Operation Errors
- `Invalid mint address`: The specified mint address is not valid
- `Insufficient balance`: Account does not have enough tokens for the operation
- `Invalid authority`: The provided authority is not valid for this operation
- `Multisig validation failed`: Multisig operation validation failed

### Orchestration Errors
- `Docker not running`: Docker daemon is not running
- `Port already in use`: Required ports are already occupied
- `Image build failed`: Failed to build Docker image from local source
- `Service startup failed`: Failed to start one or more services

## Best Practices

### Configuration Profiles
1. **Use descriptive names**: Name profiles based on their purpose (e.g., `dev-local`, `testnet-remote`)
2. **Match network modes**: Ensure profile's Bitcoin network matches your CLI network mode
3. **Secure credentials**: Store sensitive information in profiles rather than command line
4. **Environment variables**: Use `ARCH_PROFILE` for automation scripts

### Token Operations
1. **Verify decimals**: Always use the correct decimal places for your mint
2. **Check authorities**: Ensure you have the correct authority for operations
3. **Use multisig**: Implement multisig for high-value operations
4. **Batch operations**: Use batch commands for multiple similar operations

### Development Workflow
1. **Local development**: Use `orchestrate start --local` for testing local changes
2. **Profile management**: Create separate profiles for different environments
3. **Reset when needed**: Use `orchestrate reset` to start with a clean state

### Security Considerations
1. **Key management**: Store keypairs securely and never share private keys
2. **Network isolation**: Use appropriate network modes for different use cases
3. **Authority limits**: Limit authority access to only what's necessary
4. **Regular updates**: Keep arch-cli and dependencies updated

## Troubleshooting

### Common Issues

#### Validator Won't Start
```bash
# Check if ports are available
netstat -an | grep 9002

# Check Docker status
docker ps -a

# Reset environment
arch-cli orchestrate reset
```

#### Token Operations Fail
```bash
# Verify mint exists
arch-cli token show-mint <MINT_ADDRESS>

# Check account balance
arch-cli token balance <ACCOUNT_ADDRESS>

# Verify authority
arch-cli token show-account <ACCOUNT_ADDRESS>
```

#### Profile Issues
```bash
# List all profiles
arch-cli config list-profiles

# Check profile details
arch-cli config show-profile <NAME>

# Test profile connection
arch-cli --profile <NAME> get-block-height
```

### Getting Help

- **Discord Community**: [https://discord.gg/archnetwork](https://discord.gg/archnetwork)
- **GitHub Issues**: [https://github.com/Arch-Network/arch-node/issues](https://github.com/Arch-Network/arch-node/issues)
- **Documentation**: [https://docs.arch.network](https://docs.arch.network)

## Version Compatibility

This guide covers arch-cli version 0.5.6 and later. For older versions, please refer to the appropriate release documentation.

**Minimum Requirements:**
- Rust: 1.84.1+
- Solana CLI: 2.2.14+
- Docker: 20.10+ (for orchestration features)
- OS: Linux, macOS, or Windows (WSL2)

## Quick Reference

### Common Commands
```bash
# Create and configure profile
arch-cli config create-profile dev --bitcoin-node-endpoint http://127.0.0.1:18443 --bitcoin-node-username bitcoin --bitcoin-node-password password --bitcoin-network regtest --arch-node-url http://localhost:9002

# Start local environment
arch-cli orchestrate start --local "$(pwd)"

# Create token mint
arch-cli token create-mint --keypair-path ~/my-keypair.json --decimals 6

# Deploy program
arch-cli deploy examples/helloworld/

# Check account
arch-cli show <ACCOUNT_ADDRESS>
```

### Environment Variables
- `ARCH_PROFILE`: Set default profile
- `NETWORK_MODE`: Set default network mode
- `PUBKEY`: Set default public key for some commands
