# Building Your First Bitcoin Runes Swap Application

Welcome to this hands-on tutorial! Today, we're going to build a decentralized application that enables users to swap Bitcoin Runes tokens on the Arch Network. By the end of this lesson, you'll understand how to create a secure, trustless swap mechanism for Runes tokens.

## Class Prerequisites
Before we dive in, please ensure you have:
- Completed the [environment setup](../getting-started/environment-setup.md)
- A basic understanding of [Bitcoin Integration](../concepts/bitcoin-integration.md)
- Familiarity with Rust programming language
- Your development environment ready with the Arch Network CLI installed

## Lesson 1: Understanding the Basics

### What are Runes?
Before we write any code, let's understand what we're working with. Runes is a Bitcoin protocol for fungible tokens, similar to how BRC-20 works. Each Rune token has a unique identifier and can be transferred between Bitcoin addresses.

### What are we building?
We're creating a swap program that will:
1. Allow users to create swap offers ("I want to trade X amount of Rune A for Y amount of Rune B")
2. Enable other users to accept these offers
3. Let users cancel their offers if they change their mind
4. Ensure all swaps are atomic (they either complete fully or not at all)

## Lesson 2: Setting Up Our Project

Let's start by creating our project structure. Open your terminal and run:

```bash
# Create a new directory for your project
mkdir runes-swap
cd runes-swap

# Initialize a new Rust project
cargo init --lib

# Your project structure should look like this:
# runes-swap/
# ├── Cargo.toml
# ├── src/
# │   └── lib.rs
```

## Lesson 3: Defining Our Data Structures

Now, let's define the building blocks of our swap program. In programming, it's crucial to plan our data structures before implementing functionality.

```rust,ignore
use arch_program::{
    account::AccountInfo,
    entrypoint,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    utxo::UtxoMeta,
    borsh::{BorshDeserialize, BorshSerialize},
};

/// This structure represents a single swap offer in our system
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SwapOffer {
    // Unique identifier for the offer
    pub offer_id: u64,
    // The public key of the person creating the offer
    pub maker: Pubkey,
    // The Rune ID they want to give
    pub rune_id_give: String,
    // Amount of Runes they want to give
    pub amount_give: u64,
    // The Rune ID they want to receive
    pub rune_id_want: String,
    // Amount of Runes they want to receive
    pub amount_want: u64,
    // When this offer expires (in block height)
    pub expiry: u64,
    // Current status of the offer
    pub status: OfferStatus,
}
```

Let's break down why we chose each field:
- `offer_id`: Every offer needs a unique identifier so we can reference it later
- `maker`: We store who created the offer to ensure only they can cancel it
- `rune_id_give/want`: These identify which Runes are being swapped
- `amount_give/want`: The quantities of each Rune in the swap
- `expiry`: Offers shouldn't live forever, so we add an expiration

## Lesson 4: Implementing the Swap Logic

Now that we understand our data structures, let's implement the core swap functionality. We'll start with creating an offer:

```rust,ignore
fn process_create_offer(
    accounts: &[AccountInfo],
    instruction: SwapInstruction,
) -> Result<(), ProgramError> {
    // Step 1: Get all the accounts we need
    let account_iter = &mut accounts.iter();
    let maker = next_account_info(account_iter)?;
    let offer_account = next_account_info(account_iter)?;
    
    // Step 2: Verify the maker has the Runes they want to swap
    if let SwapInstruction::CreateOffer { 
        rune_id_give, 
        amount_give,
        rune_id_want,
        amount_want,
        expiry 
    } = instruction {
        // Security check: Ensure the maker owns enough Runes
        verify_rune_ownership(maker, &rune_id_give, amount_give)?;
        
        // Step 3: Create and store the offer
        let offer = SwapOffer {
            offer_id: get_next_offer_id(offer_account)?,
            maker: *maker.key,
            rune_id_give,
            amount_give,
            rune_id_want,
            amount_want,
            expiry,
            status: OfferStatus::Active,
        };
        
        store_offer(offer_account, &offer)?;
    }

    Ok(())
}
```

### Understanding the Create Offer Process
1. First, we extract the accounts passed to our program
2. We verify that the maker actually owns the Runes they want to trade
3. We create a new `SwapOffer` with an Active status
4. Finally, we store this offer in the program's state

## Lesson 5: Testing Our Program

Testing is crucial in blockchain development because once deployed, your program can't be easily changed. Let's write comprehensive tests for our swap program.

```rust,ignore
#[cfg(test)]
mod tests {
    use super::*;
    use arch_program::test_utils::{create_test_account, create_test_pubkey};

    /// Helper function to create a test offer
    fn create_test_offer() -> SwapOffer {
        SwapOffer {
            offer_id: 1,
            maker: create_test_pubkey(),
            rune_id_give: "RUNE1".to_string(),
            amount_give: 100,
            rune_id_want: "RUNE2".to_string(),
            amount_want: 200,
            expiry: 1000,
            status: OfferStatus::Active,
        }
    }

    #[test]
    fn test_create_offer() {
        // Arrange: Set up our test accounts
        let maker = create_test_account();
        let offer_account = create_test_account();
        
        // Act: Create an offer
        let result = process_create_offer(
            &[maker.clone(), offer_account.clone()],
            SwapInstruction::CreateOffer {
                rune_id_give: "RUNE1".to_string(),
                amount_give: 100,
                rune_id_want: "RUNE2".to_string(),
                amount_want: 200,
                expiry: 1000,
            },
        );
        
        // Assert: Check the result
        assert!(result.is_ok());
        // Add more assertions here to verify the offer was stored correctly
    }
}
```

### Understanding Our Test Structure
We follow the "Arrange-Act-Assert" pattern:
1. Arrange: Set up the test environment and data
2. Act: Execute the functionality we're testing
3. Assert: Verify the results match our expectations

## Lesson 6: Implementing Offer Acceptance

Now let's implement the logic for accepting an offer. This is where atomic swaps become crucial:

```rust,ignore
fn process_accept_offer(
    accounts: &[AccountInfo],
    instruction: SwapInstruction,
) -> Result<(), ProgramError> {
    // Step 1: Get all required accounts
    let account_iter = &mut accounts.iter();
    let taker = next_account_info(account_iter)?;
    let maker = next_account_info(account_iter)?;
    let offer_account = next_account_info(account_iter)?;
    
    if let SwapInstruction::AcceptOffer { offer_id } = instruction {
        // Step 2: Load and validate the offer
        let mut offer = load_offer(offer_account)?;
        require!(
            offer.status == OfferStatus::Active,
            ProgramError::InvalidAccountData
        );
        require!(
            offer.offer_id == offer_id,
            ProgramError::InvalidArgument
        );
        
        // Step 3: Verify the taker has the required Runes
        verify_rune_ownership(taker, &offer.rune_id_want, offer.amount_want)?;
        
        // Step 4: Perform the atomic swap
        // Transfer Runes from maker to taker
        transfer_runes(
            maker,
            taker,
            &offer.rune_id_give,
            offer.amount_give,
        )?;
        
        // Transfer Runes from taker to maker
        transfer_runes(
            taker,
            maker,
            &offer.rune_id_want,
            offer.amount_want,
        )?;
        
        // Step 5: Update offer status
        offer.status = OfferStatus::Completed;
        store_offer(offer_account, &offer)?;
    }
    
    Ok(())
}
```

### Understanding Atomic Swaps
An atomic swap ensures that either:
- Both transfers complete successfully, or
- Neither transfer happens at all

This is crucial for preventing partial swaps where one party could lose their tokens.

## Lesson 7: Implementing Offer Cancellation

Finally, let's implement the ability to cancel offers:

```rust,ignore
fn process_cancel_offer(
    accounts: &[AccountInfo],
    instruction: SwapInstruction,
) -> Result<(), ProgramError> {
    let account_iter = &mut accounts.iter();
    let maker = next_account_info(account_iter)?;
    let offer_account = next_account_info(account_iter)?;
    
    if let SwapInstruction::CancelOffer { offer_id } = instruction {
        // Load the offer
        let mut offer = load_offer(offer_account)?;
        
        // Security checks
        require!(
            offer.maker == *maker.key,
            ProgramError::InvalidAccountData
        );
        require!(
            offer.status == OfferStatus::Active,
            ProgramError::InvalidAccountData
        );
        require!(
            offer.offer_id == offer_id,
            ProgramError::InvalidArgument
        );
        
        // Update offer status
        offer.status = OfferStatus::Cancelled;
        store_offer(offer_account, &offer)?;
    }
    
    Ok(())
}
```

## Deploying Your Runes Swap Program

After you've written and tested your program, it's time to deploy it to the Arch Network:

```bash
# Build the program
cargo build-sbf

# Deploy the program to the Arch Network
arch-cli deploy target/deploy/runes_swap.so
```

Make sure you have a validator node running before deployment:

```bash
# Start a local validator
arch-cli validator-start
```

## Conclusion

Congratulations! You've built a complete Runes swap program. This program demonstrates several important blockchain concepts:
1. Atomic transactions
2. State management
3. Security checks
4. Program testing

Remember to always:
- Test thoroughly before deployment
- Consider edge cases
- Implement proper error handling
- Add detailed documentation

## Next Steps

To further improve your program, consider adding:
1. A UI for interacting with the swap program
2. More sophisticated offer matching
3. Order book functionality
4. Price oracle integration
5. Additional security features

Questions? Feel free to ask in the comments below!

## Implementation Details

### Runes Transfer Implementation

Let's look at the implementation of the `transfer_runes` function used in our swap program:

```rust,ignore
/// Transfers Runes tokens from one account to another
/// 
/// # Arguments
/// * `from` - The account sending the Runes
/// * `to` - The account receiving the Runes
/// * `rune_id` - The identifier of the Rune to transfer
/// * `amount` - The amount of Runes to transfer
/// 
/// # Returns
/// * `Result<(), ProgramError>` - Success or error code
fn transfer_runes(
    from: &AccountInfo,
    to: &AccountInfo,
    rune_id: &str,
    amount: u64,
) -> Result<(), ProgramError> {
    // Step 1: Get Bitcoin script pubkey for both accounts
    let from_script = get_account_script_pubkey(from.key)?;
    let to_script = get_account_script_pubkey(to.key)?;
    
    // Step 2: Create a Bitcoin transaction for the Rune transfer
    let mut tx = Transaction {
        version: Version::TWO,
        lock_time: LockTime::ZERO,
        input: vec![],
        output: vec![],
    };
    
    // Step 3: Get UTXOs associated with the sender
    let utxos = get_account_utxos(from)?;
    
    // Step 4: Find UTXOs with the specified Rune
    let rune_utxos = utxos.iter()
        .filter(|utxo| has_rune(utxo, rune_id))
        .collect::<Vec<_>>();
    
    // Step 5: Verify sender has enough of the rune
    let total_runes = rune_utxos.iter()
        .map(|utxo| get_rune_amount(utxo, rune_id))
        .sum::<u64>();
    
    require!(
        total_runes >= amount,
        ProgramError::InsufficientRuneBalance
    );
    
    // Step 6: Select UTXOs for the transfer
    let selected_utxos = select_utxos_for_transfer(
        &rune_utxos, 
        rune_id,
        amount
    )?;
    
    // Step 7: Add inputs from selected UTXOs
    for utxo in &selected_utxos {
        tx.input.push(TxIn {
            previous_output: OutPoint::new(utxo.txid.into(), utxo.vout),
            script_sig: Script::new(),
            sequence: Sequence::MAX,
            witness: Witness::new(),
        });
    }
    
    // Step 8: Calculate total input amount
    let total_input_amount = selected_utxos.iter()
        .map(|utxo| utxo.amount)
        .sum::<u64>();
    
    // Step 9: Create output with rune transfer
    let runes_data = create_runes_data(rune_id, amount);
    tx.output.push(TxOut {
        value: DUST_LIMIT, // Minimum amount for a valid output
        script_pubkey: to_script.clone(),
    });
    
    // Step 10: Add change output if needed
    if total_input_amount > DUST_LIMIT {
        // Return change to sender
        let change_amount = total_input_amount - DUST_LIMIT;
        let change_runes = total_runes - amount;
        
        // Create change output with remaining runes
        if change_amount > 0 {
            let change_data = create_runes_data(rune_id, change_runes);
            tx.output.push(TxOut {
                value: change_amount,
                script_pubkey: from_script.clone(),
            });
        }
    }
    
    // Step 11: Create transaction signing request
    let tx_to_sign = TransactionToSign {
        tx_bytes: &bitcoin::consensus::serialize(&tx),
        inputs_to_sign: &selected_utxos.iter()
            .enumerate()
            .map(|(i, utxo)| InputToSign {
                index: i as u32,
                signer: *from.key,
            })
            .collect::<Vec<_>>(),
    };
    
    // Step 12: Submit transaction for signing by the Arch runtime
    set_transaction_to_sign(&[from.clone(), to.clone()], tx_to_sign)?;
    
    Ok(())
}

/// Gets UTXOs associated with an account
fn get_account_utxos(account: &AccountInfo) -> Result<Vec<UtxoMeta>, ProgramError> {
    // In a real implementation, this would query the Arch state
    // to get UTXOs associated with the account
    // This is a simplified placeholder implementation
    
    // For tutorial purposes, we simulate fetching UTXOs
    Ok(vec![])
}

/// Checks if a UTXO contains a specific Rune
fn has_rune(utxo: &UtxoMeta, rune_id: &str) -> bool {
    // In a real implementation, this would parse the Bitcoin
    // transaction data to check for Rune presence
    // This is a simplified placeholder for the tutorial
    
    true // For tutorial purposes
}

/// Gets the amount of a specific Rune in a UTXO
fn get_rune_amount(utxo: &UtxoMeta, rune_id: &str) -> u64 {
    // In a real implementation, this would parse the Bitcoin
    // transaction data to get the Rune amount
    // This is a simplified placeholder for the tutorial
    
    1000 // For tutorial purposes
}

/// Creates Rune-specific data for transaction outputs
fn create_runes_data(rune_id: &str, amount: u64) -> Vec<u8> {
    // In a real implementation, this would create the proper
    // script or OP_RETURN data to encode Rune information
    // This is a simplified placeholder for the tutorial
    
    vec![] // For tutorial purposes
}

/// Selects appropriate UTXOs for a Rune transfer
fn select_utxos_for_transfer(
    utxos: &[&UtxoMeta],
    rune_id: &str,
    amount: u64,
) -> Result<Vec<UtxoMeta>, ProgramError> {
    // In a real implementation, this would implement a UTXO
    // selection algorithm optimized for Rune transfers
    // This is a simplified placeholder for the tutorial
    
    // Simply clone the first UTXO for the tutorial
    if let Some(utxo) = utxos.first() {
        Ok(vec![(*utxo).clone()])
    } else {
        Err(ProgramError::InsufficientFunds)
    }
}
```

The `transfer_runes` function implements the core logic for transferring Runes tokens between accounts. It:

1. Gets the Bitcoin script pubkeys for the sender and receiver
2. Creates a new Bitcoin transaction
3. Finds UTXOs containing the desired Rune
4. Selects appropriate UTXOs for the transfer
5. Creates outputs with proper Rune encoding
6. Handles change output for remaining Runes
7. Sets up the transaction for signing by the Arch runtime

### Rune Ownership Verification

Let's also look at the implementation of the `verify_rune_ownership` function:

```rust,ignore
/// Verifies that an account owns sufficient Runes
/// 
/// # Arguments
/// * `account` - The account to check
/// * `rune_id` - The identifier of the Rune to verify
/// * `required_amount` - The amount of Runes required
/// 
/// # Returns
/// * `Result<(), ProgramError>` - Success or error code
fn verify_rune_ownership(
    account: &AccountInfo,
    rune_id: &str,
    required_amount: u64,
) -> Result<(), ProgramError> {
    // Step 1: Get UTXOs associated with the account
    let utxos = get_account_utxos(account)?;
    
    // Step 2: Filter UTXOs that contain the specified Rune
    let rune_utxos = utxos.iter()
        .filter(|utxo| has_rune(utxo, rune_id))
        .collect::<Vec<_>>();
    
    // Step 3: Calculate total Runes owned
    let total_owned = rune_utxos.iter()
        .map(|utxo| get_rune_amount(utxo, rune_id))
        .sum::<u64>();
    
    // Step 4: Verify the account has enough Runes
    if total_owned < required_amount {
        msg!(
            "Insufficient Rune balance. Required: {}, Available: {}",
            required_amount,
            total_owned
        );
        return Err(ProgramError::InsufficientRuneBalance);
    }
    
    Ok(())
}
```

This function validates that an account owns a sufficient amount of a specific Rune by:
1. Getting the account's UTXOs
2. Filtering those containing the specified Rune
3. Calculating the total Rune amount owned
4. Verifying the account has enough to meet the required amount