# Requirements

The following dependencies are needed to proceed. Install these before moving to the next step.

- [Rust](https://www.rust-lang.org/)
- [Docker](https://www.docker.com/)
- A C++ Compiler (gcc/clang)
- [RISC0 Toolchain](https://www.risczero.com/) (instructions below)

### Install Rust
First, to work with Arch smart contracts, you will need Rust installed on your machine. If you don't have it, you can find installation instructions on [the Rust website](https://www.rust-lang.org/tools/install).

It is assumed that you are working with a stable Rust channel throughout this book.

### Install Docker
Next, Docker is required to run Arch's containerized node infrastructure locally. The desktop client can be installed from [the Docker website](https://www.docker.com/products/docker-desktop/).

### Install RISC0-Toolchain
Next, to compile Arch smart contracts, the [risc0](https://www.risczero.com/) Rust toolchain must be installed.

The Arch Network harnesses the power of the RISC0 Zero-Knowledge Virtual Machine (zkVM) to execute programs securely and privately, ensuring that all computation proofs are verified by a robust network of verifier nodes.

Execute the following commands to install the toolchain on your local system.

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
