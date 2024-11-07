# `WriteBytes`

Writes bytes to an array.

Fields:
- `offset`: `usize`
- `len`: `usize`
- `data`: `Vec<u8>`

```rust,ignore
InstructionType::WriteBytes { offset, len, data } => {
    let original_data_len = unsafe { account.original_data_len() };
    if offset + len > original_data_len {
        account.realloc(offset + len, true)?;
    }
    let mut data_slice = account.try_borrow_mut_data()?;
    data_slice[offset..(offset + len)].copy_from_slice(&data);
}
```
