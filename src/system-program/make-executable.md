# MakeExecutable

Sets an account as executable, effectively marking it as a [Program].

Fields:
- None.

```rust,ignore
InstructionType::MakeExecutable => unsafe {
    let mut data = account.try_borrow_mut_data()?;
    let data_ptr = data.as_mut_ptr();
    *data_ptr.offset(-49) = 1_u8;
},
```

[Program]: ../program/program.md
