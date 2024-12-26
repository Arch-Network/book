# Building Your First Bitcoin Runes Swap Application

Welcome to this hands-on tutorial! Today, we're going to build a decentralized application that enables users to swap Bitcoin Runes tokens on the Arch Network. By the end of this lesson, you'll understand how to create a secure, trustless swap mechanism for Runes tokens.

## Class Prerequisites
Before we dive in, please ensure you have:
- Completed the [environment setup](../getting-started/environment-setup.md)
- A basic understanding of [Bitcoin Integration](../concepts/bitcoin-integration.md)
- Familiarity with Rust programming language
- Your development environment ready with the Arch CLI installed

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
# Create a new Arch project
arch-cli project create --name runes-swap
cd runes-swap

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

## Final Steps: Building and Deploying

Now that we've implemented our swap program, let's build and deploy it:

```bash
# Build the program
cargo build-bpf

# Deploy to your local test validator
arch-cli program deploy target/deploy/runes_swap.so
```

### Testing the Deployed Program

Here's a simple script to test our deployed program:

```typescript
import { Connection, PublicKey, Transaction } from '@archway/web3.js';
import { RunesSwapProgram } from './program';

async function testSwap() {
    // Connect to local test validator
    const connection = new Connection('http://localhost:8899', 'confirmed');
    
    // Create a new swap offer
    const offer = await RunesSwapProgram.createOffer({
        runeIdGive: 'RUNE1',
        amountGive: 100,
        runeIdWant: 'RUNE2',
        amountWant: 200,
        expiry: Date.now() + 3600000, // 1 hour from now
    });
    
    console.log('Created offer:', offer);
}

testSwap().catch(console.error);
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