# The Arch Book

![Build Status](https://github.com/arch-network/book/actions/workflows/ci.yml/badge.svg)

### Requirements

Building the book requires [mdBook].

To install it:

[mdBook]: https://github.com/rust-lang/mdBook

```bash
# latest
cargo install mdbook

# specific version
cargo install mdbook --locked --version <version_num>
```

### Build
```bash
mdbook build
```

### Serve
```bash
mdbook serve --open
```

### Contributing
See [CONTRIBUTING.md][contrib].

[contrib]: https://github.com/arch-network/book/blob/main/CONTRIBUTING.md
