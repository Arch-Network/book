# AssignOwnership

Sets a [Pubkey] to be the owner of an account.

Fields:
- `owner`: [Pubkey]

```rust,ignore
InstructionType::AssignOwnership(owner) => {
    account.set_owner(&owner);
}
```

[Pubkey]: ../program/pubkey.md
