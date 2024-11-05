# CreateAccount

Create a new account.

Fields:
- `utxo`: [UtxoMeta]

```rust,ignore
InstructionType::CreateAccount(utxo) => {
    // add check that account is_signer and is_writable
    if *account.utxo != UtxoMeta::from_slice(&[0; 36]) {
        // checks that the account utxo has not been initialized otherwise AccountAlreadyInitialized
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    msg!("accounts {:?}", accounts);
    msg!("utxo {:?}", utxo);
    if validate_utxo_ownership(&utxo, account.key) {
        account.set_utxo(&utxo);
    } else {
        return Err(ProgramError::IncorrectAuthority);
    }
}
```

[UtxoMeta]: ../program/utxo.md
