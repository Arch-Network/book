# Arch Network Development Guides

This section provides comprehensive guides for building, testing, and deploying Arch Network programs. Whether you're just starting out or building complex applications, these guides will help you develop robust and efficient programs.

## Getting Started Guides

### [Understanding Arch Programs](./understanding-arch-programs.md)
Learn the fundamental concepts, architecture, and development patterns for Arch Network programs. This guide covers the complete foundation you need before building your first program.

**Covers:** Program structure, Bitcoin integration, state management, error handling, and development best practices.

### [Writing Your First Program](./writing-your-first-program.md)
A comprehensive step-by-step tutorial for creating, deploying, and testing a complete counter program with advanced features.

**Covers:** Project setup, program logic, Bitcoin transactions, security patterns, and comprehensive testing.

### [Comprehensive Testing Guide](./testing-guide.md)
Master testing strategies for Arch Network programs with unit tests, integration tests, security tests, and performance testing.

**Covers:** Test environment setup, multi-layer testing, security testing, CI/CD integration, and debugging techniques.

## Configuration & Setup

### [Local Validator with Bitcoin Testnet4](./how-to-configure-local-validator-bitcoin-testnet4.md)
Configure your development environment to work with Bitcoin testnet4 for testing ordinals, runes, and advanced Bitcoin features.

**Covers:** Testnet4 setup, validator configuration, ordinals support, runes protocol, and production considerations.

## Program Examples & Tutorials

### [Fungible Token Program](./how-to-create-a-fungible-token.md)
Build a complete fungible token implementation compatible with standard token interfaces.

**What you'll build:** Token minting, transfers, allowances, and metadata management.

### [Oracle Program](./how-to-write-oracle-program.md)
Create a price oracle program that fetches and stores external data on-chain.

**What you'll build:** Price feeds, data validation, timestamp management, and trusted data sources.

### [Runes Swap Program](./how-to-build-runes-swap.md)
Implement a decentralized exchange for trading Bitcoin runes and ordinals.

**What you'll build:** AMM functionality, liquidity pools, runes integration, and swap mechanisms.

### [Lending Protocol](./how-to-build-lending-protocol.md)
Build a complete DeFi lending platform with collateralized loans and interest rates.

**What you'll build:** Collateral management, loan origination, interest calculations, and liquidation mechanisms.

## Recommended Learning Path

### For Beginners
1. **[Understanding Arch Programs](./understanding-arch-programs.md)** - Learn the fundamentals
2. **[Writing Your First Program](./writing-your-first-program.md)** - Build your first complete program
3. **[Testing Guide](./testing-guide.md)** - Learn to test thoroughly
4. **[Fungible Token](./how-to-create-a-fungible-token.md)** - Build a practical program

### For Intermediate Developers
1. **[Oracle Program](./how-to-write-oracle-program.md)** - External data integration
2. **[Local Validator Setup](./how-to-configure-local-validator-bitcoin-testnet4.md)** - Advanced testing environments
3. **[Runes Swap](./how-to-build-runes-swap.md)** - Bitcoin-native features

### For Advanced Developers
1. **[Lending Protocol](./how-to-build-lending-protocol.md)** - Complex DeFi mechanics
2. **All testing guides** - Production-ready development practices

## Quick Reference

| Guide | Difficulty | Time | Key Concepts |
|-------|------------|------|--------------|
| Understanding Arch Programs | Beginner | 30 min | Architecture, concepts |
| Writing Your First Program | Beginner | 2-3 hours | Complete development cycle |
| Testing Guide | Intermediate | 1-2 hours | Testing strategies |
| Testnet4 Setup | Intermediate | 30 min | Advanced configuration |
| Fungible Token | Intermediate | 3-4 hours | Token standards |
| Oracle Program | Intermediate | 2-3 hours | External data |
| Runes Swap | Advanced | 4-6 hours | DEX mechanics |
| Lending Protocol | Advanced | 6-8 hours | DeFi protocols |

## Development Tips

### Before You Start
- **Set up your environment** following the [Quick Start Guide](../getting-started/quick-start.md)
- **Understand Bitcoin basics** if you're new to Bitcoin development
- **Review Rust fundamentals** if you're not familiar with Rust

### Best Practices
- **Start simple** - Begin with basic programs before building complex systems
- **Test thoroughly** - Use the comprehensive testing strategies from our guides
- **Follow security patterns** - Always validate inputs and handle errors gracefully
- **Document your code** - Future you (and your team) will thank you

### Getting Help
- **Join our [Discord](https://discord.gg/archnetwork)** for real-time support
- **Check the [API Reference](../rpc/rpc.md)** for detailed documentation
- **Review [Core Concepts](../concepts/architecture.md)** for architectural guidance
- **File issues** on [GitHub](https://github.com/Arch-Network/arch-node/issues) for bugs

## Contributing

Found an issue or want to improve these guides? We welcome contributions!

- **Report bugs** or unclear instructions
- **Suggest improvements** to existing guides
- **Propose new guides** for topics we haven't covered
- **Share your programs** as examples for the community

## What's Next?

Choose your path based on your experience level and goals:

- **New to Arch?** Start with [Understanding Arch Programs](./understanding-arch-programs.md)
- **Ready to code?** Jump into [Writing Your First Program](./writing-your-first-program.md)
- **Building tokens?** Check out the [Fungible Token](./how-to-create-a-fungible-token.md) guide
- **Interested in DeFi?** Try the [Lending Protocol](./how-to-build-lending-protocol.md) guide

Happy building! 🚀
