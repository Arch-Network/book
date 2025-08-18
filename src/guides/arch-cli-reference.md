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
arch-cli --network-mode devnet|testnet|mainnet

# Use configuration profile
arch-cli --profile <PROFILE_NAME>

# Show help
arch-cli --help

# Show version
arch-cli --version
```

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

## Validator Management

### Start Validator
Start a local validator node:

```bash
arch-cli validator-start [OPTIONS]
```

**Common Options:**
- `--data-dir <PATH>`: Data directory for validator
- `--network-mode <MODE>`: Network mode (devnet, testnet, mainnet)
- `--rpc-bind-ip <IP>`: RPC bind IP address
- `--rpc-bind-port <PORT>`: RPC bind port
- `--titan-endpoint <URL>`: Titan HTTP endpoint
- `--titan-socket-endpoint <HOST:PORT>`: Titan TCP endpoint
- `--max-tx-pool-size <SIZE>`: Maximum transaction pool size
- `--full-snapshot-reccurence <COUNT>`: Snapshot frequency
- `--max-snapshots <COUNT>`: Maximum snapshots to keep

**Example:**
```bash
arch-cli validator-start \
    --network-mode testnet \
    --data-dir ./.arch_data \
    --rpc-bind-ip 127.0.0.1 \
    --rpc-bind-port 9002 \
    --titan-endpoint https://titan-public-http.test.arch.network \
    --titan-socket-endpoint titan-public-tcp.test.arch.network:3030
```

## Account Operations

### Create Account
Create a new account:

```bash
arch-cli account create --keypair-path <PATH> [--airdrop]
```

**Arguments:**
- `--keypair-path <PATH>`: Path to save the generated keypair file
- `--airdrop`: Whether to airdrop 1 ARCH to the new account

**Example:**
```bash
arch-cli account create --keypair-path ./my-account.json --airdrop
```

### Fund Account
Fund an existing account using the faucet:

```bash
arch-cli account airdrop \
    [--keypair-path <PATH> | --account <PUBKEY> | --pubkey <PUBKEY>] \
    --amount <LAMPORTS>
```

**Arguments:**
- `--keypair-path <PATH>`: Path to the keypair file to fund
- `--account <PUBKEY>`: Account public key to fund (hex format)
- `--pubkey <PUBKEY>`: Account public key to fund (hex format, alias for --account)
- `--amount <LAMPORTS>`: Amount to airdrop (default: 1,000,000,000)

**Examples:**
```bash
# Fund by keypair file
arch-cli account airdrop --keypair-path ./my-account.json --amount 1000000000

# Fund by public key
arch-cli account airdrop --pubkey 02a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c7 --amount 1000000000
```

### Change Account Owner
Change the owner of an account:

```bash
arch-cli account change-owner <ACCOUNT_ADDRESS> <NEW_OWNER> <PAYER_KEYPAIR>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Address of the account to change ownership of
- `<NEW_OWNER>`: New owner's public key
- `<PAYER_KEYPAIR>`: Payer's keypair path

### Assign UTXO
Assign UTXOs to an account:

```bash
arch-cli account assign-utxo <ACCOUNT_PUBKEY>
```

**Arguments:**
- `<ACCOUNT_PUBKEY>`: Public key of the account to assign UTXOs to

## Program Deployment

### Deploy Program
Deploy a compiled program to the Arch Network:

```bash
arch-cli deploy [<ELF_PATH>] [--generate-if-missing] [--fund-authority]
```

**Arguments:**
- `<ELF_PATH>` (Optional): Path to the directory containing the ELF file and keypair
- `--generate-if-missing`: Automatically generate program and authority keypair files
- `--fund-authority`: Fund the authority account using the faucet

**Example:**
```bash
arch-cli deploy ./target/deploy/program.so --generate-if-missing --fund-authority
```

## Transaction Operations

### Confirm Transaction
Check the status of a transaction:

```bash
arch-cli tx confirm <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID to confirm (32-byte hex string)

### Get Transaction
Get transaction details:

```bash
arch-cli tx get <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID to retrieve

### Log Program Messages
View program messages from a transaction:

```bash
arch-cli tx log-program-messages <TX_ID>
```

**Arguments:**
- `<TX_ID>`: Transaction ID to log

## Block and Network Info

### Get Block
Retrieve information about a specific block:

```bash
arch-cli get-block <BLOCK_HASH>
```

**Arguments:**
- `<BLOCK_HASH>`: Block hash to retrieve (32-byte hex string)

### Get Block Height
Get the current block height:

```bash
arch-cli get-block-height
```

### Get Group Key
Fetch the network's group verifying key:

```bash
arch-cli get-group-key <PUBKEY>
```

**Arguments:**
- `<PUBKEY>`: Public key (not used in current implementation but kept for compatibility)

### Show Account/Program
Display information about an account or program:

```bash
arch-cli show <ADDRESS>
```

**Arguments:**
- `<ADDRESS>`: Address of the account or program to show

## APL Token Operations

### Token Mint Management

#### Create Mint
Create a new token mint:

```bash
arch-cli token create-mint \
    --decimals <DECIMALS> \
    --mint-authority <PATH> \
    --keypair-path <PATH> \
    [--freeze-authority <PATH>] \
    [--mint-keypair-path <PATH>]
```

**Arguments:**
- `--decimals <DECIMALS>`: Number of decimal places (0-9)
- `--mint-authority <PATH>`: Keypair path for mint authority
- `--keypair-path <PATH>`: Keypair path for transaction signing
- `--freeze-authority <PATH>`: Optional keypair path for freeze authority
- `--mint-keypair-path <PATH>`: Optional keypair path for the mint account

#### Show Mint
Display mint information:

```bash
arch-cli token show-mint <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint to display

### Token Account Management

#### Create Token Account
Create a new token account:

```bash
arch-cli token create-account \
    --mint <MINT> \
    --owner <PATH> \
    --keypair-path <PATH>
```

**Arguments:**
- `--mint <MINT>`: Public key of the mint
- `--owner <PATH>`: Keypair path for account owner
- `--keypair-path <PATH>`: Keypair path for transaction signing

#### Show Token Account
Display token account information:

```bash
arch-cli token show-account <ACCOUNT_ADDRESS>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the token account

### Basic Token Operations

#### Mint Tokens
Mint tokens to an account:

```bash
arch-cli token mint <MINT_ADDRESS> <AMOUNT> \
    --authority <PATH> \
    --keypair-path <PATH> \
    [--account-address <ADDRESS>] \
    [--auto-create-ata] \
    [--multisig <ADDRESS>] \
    [--signers <PATHS>]
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint
- `<AMOUNT>`: Amount to mint (raw amount)
- `--authority <PATH>`: Keypair path for mint authority
- `--keypair-path <PATH>`: Keypair path for transaction signing
- `--account-address <ADDRESS>`: Public key of destination account (optional)
- `--auto-create-ata`: Whether to auto-create Associated Token Account
- `--multisig <ADDRESS>`: Multisig authority address
- `--signers <PATHS>`: Keypair paths for multisig signers

#### Transfer Tokens
Transfer tokens between accounts:

```bash
arch-cli token transfer <SOURCE_ACCOUNT> <DESTINATION_ACCOUNT> <AMOUNT> \
    --owner <PATH> \
    --keypair-path <PATH> \
    [--multisig <ADDRESS>] \
    [--signers <PATHS>]
```

**Arguments:**
- `<SOURCE_ACCOUNT>`: Public key of source account
- `<DESTINATION_ACCOUNT>`: Public key of destination account
- `<AMOUNT>`: Amount to transfer (raw amount)
- `--owner <PATH>`: Keypair path for account owner
- `--keypair-path <PATH>`: Keypair path for transaction signing
- `--multisig <ADDRESS>`: Multisig owner address
- `--signers <PATHS>`: Keypair paths for multisig signers

#### Burn Tokens
Burn tokens from an account:

```bash
arch-cli token burn <ACCOUNT_ADDRESS> <AMOUNT> \
    --owner <PATH> \
    --keypair-path <PATH> \
    [--multisig <ADDRESS>] \
    [--signers <PATHS>]
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to burn from
- `<AMOUNT>`: Amount to burn (raw amount)
- `--owner <PATH>`: Keypair path for account owner
- `--keypair-path <PATH>`: Keypair path for transaction signing
- `--multisig <ADDRESS>`: Multisig owner address
- `--signers <PATHS>`: Keypair paths for multisig signers

### Advanced Token Features

#### Multisig Operations

##### Create Multisig
Create a multisignature authority:

```bash
arch-cli token create-multisig <M> --signers <PATHS> --keypair-path <PATH>
```

**Arguments:**
- `<M>`: Number of required signers
- `--signers <PATHS>`: Keypair paths for signers
- `--keypair-path <PATH>`: Keypair path for transaction signing

##### Sign Multisig Transaction
Sign a transaction with multisig:

```bash
arch-cli token multisig-sign <MULTISIG_ADDRESS> <TRANSACTION> --keypair-path <PATH>
```

**Arguments:**
- `<MULTISIG_ADDRESS>`: Public key of the multisig account
- `<TRANSACTION>`: Transaction to sign (base64 encoded)
- `--keypair-path <PATH>`: Keypair path for the signer

##### Execute Multisig Transaction
Execute a signed multisig transaction:

```bash
arch-cli token multisig-execute <MULTISIG_ADDRESS> <TRANSACTION> \
    --signers <PATHS> \
    --keypair-path <PATH>
```

**Arguments:**
- `<MULTISIG_ADDRESS>`: Public key of the multisig account
- `<TRANSACTION>`: Transaction to execute (base64 encoded)
- `--signers <PATHS>`: Keypair paths for signers
- `--keypair-path <PATH>`: Keypair path for transaction signing

##### Show Multisig
Display multisig account information:

```bash
arch-cli token multisig-show <MULTISIG_ADDRESS>
```

**Arguments:**
- `<MULTISIG_ADDRESS>`: Public key of the multisig account

#### Authority Management

##### Approve Delegate
Approve a delegate for spending:

```bash
arch-cli token approve <ACCOUNT_ADDRESS> <DELEGATE_ADDRESS> <AMOUNT> --owner <PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to approve
- `<DELEGATE_ADDRESS>`: Public key of the delegate
- `<AMOUNT>`: Amount to approve
- `--owner <PATH>`: Keypair path for account owner

##### Revoke Delegate
Revoke delegate authority:

```bash
arch-cli token revoke <ACCOUNT_ADDRESS> --owner <PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to revoke
- `--owner <PATH>`: Keypair path for account owner

##### Freeze/Thaw Account
Freeze or thaw a token account:

```bash
# Freeze account
arch-cli token freeze-account <ACCOUNT_ADDRESS> --authority <PATH>

# Thaw account
arch-cli token thaw-account <ACCOUNT_ADDRESS> --authority <PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to freeze/thaw
- `--authority <PATH>`: Keypair path for freeze authority

#### Utility Commands

##### Check Balance
Display token balance:

```bash
arch-cli token balance <ACCOUNT_ADDRESS>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the token account

##### Check Supply
Display mint supply:

```bash
arch-cli token supply <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint

##### List Accounts
List token accounts for a mint:

```bash
arch-cli token accounts <MINT_ADDRESS>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint

##### List Mints
List all mints:

```bash
arch-cli token mints
```

##### Amount Conversion
Convert between raw and UI amounts:

```bash
# Convert raw amount to UI format
arch-cli token amount-to-ui <MINT_ADDRESS> <AMOUNT>

# Convert UI amount to raw format
arch-cli token ui-to-amount <MINT_ADDRESS> <UI_AMOUNT>
```

**Arguments:**
- `<MINT_ADDRESS>`: Public key of the mint
- `<AMOUNT>`: Raw amount to convert
- `<UI_AMOUNT>`: UI amount to convert

#### Checked Operations
For operations with decimal verification:

```bash
# Transfer with decimal verification
arch-cli token transfer-checked <SOURCE> <DESTINATION> <AMOUNT> <DECIMALS> --owner <PATH>

# Approve with decimal verification
arch-cli token approve-checked <ACCOUNT> <DELEGATE> <AMOUNT> <DECIMALS> --owner <PATH>

# Mint with decimal verification
arch-cli token mint-to-checked <MINT> <ACCOUNT> <AMOUNT> <DECIMALS> --authority <PATH>

# Burn with decimal verification
arch-cli token burn-checked <ACCOUNT> <AMOUNT> <DECIMALS> --owner <PATH>
```

#### Authority Management

##### Set Authority
Set authority on mint or account:

```bash
arch-cli token set-authority <TARGET_ADDRESS> \
    --authority-type <TYPE> \
    --current-authority <PATH> \
    [--new-authority <ADDRESS>]
```

**Arguments:**
- `<TARGET_ADDRESS>`: Public key of the mint or account
- `--authority-type <TYPE>`: Type of authority to set
- `--current-authority <PATH>`: Keypair path for current authority
- `--new-authority <ADDRESS>`: New authority address (optional, use "none" to disable)

#### Account Management

##### Close Account
Close a token account:

```bash
arch-cli token close-account <ACCOUNT_ADDRESS> <DESTINATION_ADDRESS> --owner <PATH>
```

**Arguments:**
- `<ACCOUNT_ADDRESS>`: Public key of the account to close
- `<DESTINATION_ADDRESS>`: Public key of the destination for remaining SOL
- `--owner <PATH>`: Keypair path for account owner

#### Batch Operations

##### Batch Transfer
Batch transfer tokens:

```bash
arch-cli token batch-transfer <TRANSFERS_FILE> --keypair-path <PATH>
```

**Arguments:**
- `<TRANSFERS_FILE>`: JSON file containing transfer operations
- `--keypair-path <PATH>`: Keypair path for transaction signing

##### Batch Mint
Batch mint tokens:

```bash
arch-cli token batch-mint <MINTS_FILE> --keypair-path <PATH>
```

**Arguments:**
- `<MINTS_FILE>`: JSON file containing mint operations
- `--keypair-path <PATH>`: Keypair path for transaction signing

## Orchestration Commands

### Start Full Environment
Start the complete local devnet (bitcoind, titan, local_validator):

```bash
arch-cli orchestrate start [OPTIONS]
```

**Options:**
- `--local <PATH>`: Use local arch-network source code instead of remote image
- `--force-rebuild`: Force rebuild of the local validator Docker image
- `--rebuild-titan`: Force rebuild of the Titan Docker image
- `--titan-image <IMAGE>`: Specify which Titan Docker image to use
- `--no-bitcoind`: Skip starting bitcoind, use profile's Bitcoin RPC

**Examples:**
```bash
# Start with default images
arch-cli orchestrate start

# Start with local source code
arch-cli orchestrate start --local "$(pwd)"

# Start with custom Titan image
arch-cli orchestrate start --titan-image ghcr.io/arch-network/titan:latest

# Start without bitcoind (use profile's Bitcoin RPC)
arch-cli orchestrate start --no-bitcoind
```

### Stop Environment
Stop the local devnet:

```bash
arch-cli orchestrate stop
```

### Reset Environment
Reset the entire environment:

```bash
arch-cli orchestrate reset
```

This stops all services, removes all Docker volumes, and deletes local data directories.

### Fine-Grained Control

#### Validator Only Operations
```bash
# Start only the local_validator service
arch-cli orchestrate validator-start

# Stop only the local_validator service
arch-cli orchestrate validator-stop

# Restart only the local_validator service
arch-cli orchestrate validator-restart

# Check validator status
arch-cli orchestrate validator-status

# Reset only the local_validator
arch-cli orchestrate validator-reset
```

#### Bitcoin Mining
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
- `Invalid length`: Input data is not the correct length (usually for 32-byte hex strings)
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

This guide covers arch-cli version 1.85.0 and later. For older versions, please refer to the appropriate release documentation.

**Minimum Requirements:**
- Rust: 1.84.1+
- Solana CLI: 2.2.14+
- Docker: 20.10+ (for orchestration features)
- OS: Linux, macOS, or Windows (WSL2)
