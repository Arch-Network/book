# Requirements

The following dependencies are needed to proceed. Install these before moving to the next step.

- [Docker](https://www.docker.com/)
- [Rust](https://www.rust-lang.org/)
- A C++ Compiler (gcc/clang)
- [RISC0 Toolchain](https://www.risczero.com/) (instructions below)

### Install Rust
First, to work with Arch smart contracts, you will need Rust installed on your machine. If you don't have it, you can find installation instructions on [the Rust website](https://www.rust-lang.org/tools/install).

It is assumed that you are working with a stable Rust channel throughout this book.

### Install RISC0-Toolchain

Next, to compile Arch smart contracts, the [risc0](https://www.risczero.com/) Rust toolchain must be installed. 

Execute the following commands to install the toolchain to your local system.

```bash
cargo install cargo-binstall
cargo binstall -y cargo-risczero@0.21.0
cargo risczero install
```

### Clone the arch-local repository

Finally, we'll be using a repository specifically made to demonstrate Arch's capabilities and get started quickly. This repo contains a local Arch Network development environment, as well as some example programs that we'll touch on later in this book.

```bash
git clone https://github.com/arch-Network/arch-local && cd arch-local
```
