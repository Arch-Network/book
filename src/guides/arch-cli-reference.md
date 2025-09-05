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
    --bitcoin-node-endpoint http://bitcoin-node.test.aws.archnetwork.xyz:49332 \
    --bitcoin-node-username bitcoin \
    --bitcoin-node-password uU1taFBTUvae96UCtA8YxAepYTFszYvYVSXK8xgzBs0 \
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
    --keypair-path <PATH> \
    --decimals <DECIMALS> \
    [--freeze-authority <AUTHORITY>] \
    [--mint-authority <AUTHORITY>]
```

**Arguments:**
- `--keypair-path`: Path to the keypair file for the mint
- `--decimals`: Number of decimal places (0-9)
- `--freeze-authority`: Public key of the freeze authority (optional)
- `--mint-authority`: Public key of the mint authority (optional)

#### Show Mint
Display mint information:

```bash
arch-cli token show-mint <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint

### Account Management

#### Create Account
Create a new token account:

```bash
arch-cli token create-account \
    --keypair-path <PATH> \
    --mint <MINT> \
    [--owner <OWNER>]
```

**Arguments:**
- `--keypair-path`: Path to the keypair file for the account
- `--mint`: Public key of the mint
- `--owner`: Public key of the account owner (defaults to keypair owner)

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
arch-cli token mint \
    --keypair-path <PATH> \
    --mint <MINT> \
    --to <ACCOUNT> \
    --amount <AMOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the mint authority's keypair file
- `--mint`: Public key of the mint
- `--to`: Public key of the destination account
- `--amount`: Amount to mint (in raw units)

#### Transfer Tokens
Transfer tokens between accounts:

```bash
arch-cli token transfer \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <FROM_ACCOUNT> \
    --to <TO_ACCOUNT> \
    --amount <AMOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the owner's keypair file
- `--mint`: Public key of the mint
- `--from`: Public key of the source account
- `--to`: Public key of the destination account
- `--amount`: Amount to transfer (in raw units)

#### Burn Tokens
Burn tokens from an account:

```bash
arch-cli token burn \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <ACCOUNT> \
    --amount <AMOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the owner's keypair file
- `--mint`: Public key of the mint
- `--from`: Public key of the account to burn from
- `--amount`: Amount to burn (in raw units)

### Delegation

#### Approve Delegate
Approve a delegate for spending:

```bash
arch-cli token approve \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <ACCOUNT> \
    --delegate <DELEGATE> \
    --amount <AMOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the owner's keypair file
- `--mint`: Public key of the mint
- `--from`: Public key of the source account
- `--delegate`: Public key of the delegate
- `--amount`: Amount the delegate can spend

#### Revoke Delegate
Revoke delegate authority:

```bash
arch-cli token revoke \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <ACCOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the owner's keypair file
- `--mint`: Public key of the mint
- `--from`: Public key of the account

### Account Control

#### Freeze Account
Freeze a token account:

```bash
arch-cli token freeze-account \
    --keypair-path <PATH> \
    --mint <MINT> \
    --account <ACCOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the freeze authority's keypair file
- `--mint`: Public key of the mint
- `--account`: Public key of the account to freeze

#### Thaw Account
Thaw a frozen account:

```bash
arch-cli token thaw-account \
    --keypair-path <PATH> \
    --mint <MINT> \
    --account <ACCOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the freeze authority's keypair file
- `--mint`: Public key of the mint
- `--account`: Public key of the account to thaw

### Multisignature Operations

#### Create Multisig
Create a multisignature authority:

```bash
arch-cli token create-multisig \
    --keypair-path <PATH> \
    --signers <SIGNERS> \
    --threshold <THRESHOLD>
```

**Arguments:**
- `--keypair-path`: Path to the keypair file for the multisig account
- `--signers`: Comma-separated list of public keys
- `--threshold`: Number of signatures required

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
arch-cli token transfer-checked \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <FROM_ACCOUNT> \
    --to <TO_ACCOUNT> \
    --amount <AMOUNT> \
    --decimals <DECIMALS>

# Approve with decimal verification
arch-cli token approve-checked \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <ACCOUNT> \
    --delegate <DELEGATE> \
    --amount <AMOUNT> \
    --decimals <DECIMALS>

# Mint with decimal verification
arch-cli token mint-to-checked \
    --keypair-path <PATH> \
    --mint <MINT> \
    --to <ACCOUNT> \
    --amount <AMOUNT> \
    --decimals <DECIMALS>

# Burn with decimal verification
arch-cli token burn-checked \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <ACCOUNT> \
    --amount <AMOUNT> \
    --decimals <DECIMALS>
```

#### Authority Management
Set authority on mint or account:

```bash
arch-cli token set-authority \
    --keypair-path <PATH> \
    --mint <MINT> \
    --new-authority <NEW_AUTHORITY> \
    --authority-type <TYPE>
```

**Arguments:**
- `--keypair-path`: Path to the current authority's keypair file
- `--mint`: Public key of the mint or account
- `--new-authority`: Public key of the new authority
- `--authority-type`: Type of authority (mint, freeze, or account)

#### Account Management
Close a token account:

```bash
arch-cli token close-account \
    --keypair-path <PATH> \
    --mint <MINT> \
    --account <ACCOUNT>
```

**Arguments:**
- `--keypair-path`: Path to the owner's keypair file
- `--mint`: Public key of the mint
- `--account`: Public key of the account to close

#### Batch Operations
Perform multiple operations at once:

```bash
# Batch transfer tokens
arch-cli token batch-transfer \
    --keypair-path <PATH> \
    --mint <MINT> \
    --from <FROM_ACCOUNT> \
    --transfers <TRANSFERS>

# Batch mint tokens
arch-cli token batch-mint \
    --keypair-path <PATH> \
    --mint <MINT> \
    --mints <MINTS>
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
