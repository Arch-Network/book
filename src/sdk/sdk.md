# SDK Reference

The Arch Network ecosystem provides two distinct SDKs for building applications. Each SDK serves different use cases and development environments. This page will help you choose the right SDK for your project.

## Available SDKs

### 1. TypeScript SDK (by Saturn)

The **TypeScript SDK** is developed and maintained by Saturn (@saturnbtc) and provides a comprehensive JavaScript/TypeScript interface for interacting with the Arch Network.

**Package**: `@saturnbtcio/arch-sdk`  
**Repository**: [arch-typescript-sdk](https://github.com/saturnbtc/arch-typescript-sdk)  
**Language**: TypeScript/JavaScript  
**Best for**: 
- Frontend applications (React, Vue, Angular)
- Node.js backend services
- Web3 applications
- Rapid prototyping
- JavaScript/TypeScript developers

### 2. Rust SDK

The **Rust SDK** is the native SDK included in the main Arch Network repository. It provides low-level access to all network features and is used for building high-performance applications and programs.

**Package**: `arch_sdk`  
**Repository**: Part of [arch-network](https://github.com/Arch-Network/arch-network)  
**Language**: Rust  
**Best for**:
- On-chain programs (smart contracts)
- High-performance applications
- System-level integrations
- Validator/node development
- Rust developers

## Choosing the Right SDK

### Use the TypeScript SDK when:
- Building web applications or dApps
- Working with Node.js backends
- Integrating Arch Network into existing JavaScript projects
- You need quick development cycles
- Your team is more familiar with JavaScript/TypeScript

### Use the Rust SDK when:
- Writing on-chain programs for Arch Network
- Building high-performance applications
- Developing system-level tools or validators
- You need maximum control and efficiency
- Your team is comfortable with Rust

## Quick Start Comparison

### TypeScript SDK Installation
```bash
npm install @saturnbtcio/arch-sdk
# or
yarn add @saturnbtcio/arch-sdk
```

### Rust SDK Installation
```toml
# In your Cargo.toml
[dependencies]
arch_sdk = "0.5.4"
```

### Basic Connection Example

**TypeScript SDK:**
```typescript
import { Connection, Keypair } from '@saturnbtcio/arch-sdk';

const connection = new Connection('http://localhost:9002');
const keypair = Keypair.generate();

const isReady = await connection.isNodeReady();
console.log('Node ready:', isReady);
```

**Rust SDK:**
```rust
use arch_sdk::{Connection, Keypair};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::new("http://localhost:9002");
    let keypair = Keypair::new();
    
    let is_ready = connection.is_node_ready().await?;
    println!("Node ready: {}", is_ready);
    
    Ok(())
}
```

## Documentation Structure

### TypeScript SDK Documentation
- [Getting Started with TypeScript SDK](typescript/getting-started.md)
- [TypeScript API Reference](typescript/api-reference.md)
- [TypeScript Examples](typescript/examples.md)
- [Web3 Integration Guide](typescript/web3-integration.md)

### Rust SDK Documentation  
- [Getting Started with Rust SDK](rust/getting-started.md)
- [Rust API Reference](rust/api-reference.md)
- [Program Development Guide](rust/program-development.md)
- [Rust Examples](rust/examples.md)

### Shared Concepts
These concepts apply to both SDKs:
- [Pubkey](pubkey.md) - Public key type for identifying accounts
- [Account](account.md) - Account structure and management
- [Instructions and Messages](instructions-and-messages.md) - Transaction building
- [Runtime Transaction](runtime-transaction.md) - Transaction format
- [Processed Transaction](processed-transaction.md) - Transaction results
- [Signature](signature.md) - Digital signatures

## Feature Comparison

| Feature | TypeScript SDK | Rust SDK |
|---------|---------------|----------|
| Language | TypeScript/JavaScript | Rust |
| Installation | npm/yarn | Cargo |
| Async Support | Promises/async-await | Tokio async |
| Program Development | Client-side only | Full support |
| Browser Support | ✅ Full | ❌ No |
| Node.js Support | ✅ Full | ✅ Full |
| Performance | Good | Excellent |
| Type Safety | TypeScript types | Rust type system |
| Bundle Size | ~200KB | N/A |
| Learning Curve | Moderate | Steep |

## Migration Between SDKs

While both SDKs interact with the same Arch Network, they have different APIs and patterns. Here are key differences to consider:

### Connection Management
- **TypeScript**: Uses promise-based async patterns
- **Rust**: Uses Tokio-based async runtime

### Error Handling
- **TypeScript**: Try-catch with custom error types
- **Rust**: Result<T, E> pattern with detailed error types

### Data Serialization
- **TypeScript**: JSON and Buffer-based serialization
- **Rust**: Borsh and custom serialization

## Getting Help

### TypeScript SDK Support
- **Issues**: [Saturn SDK GitHub Issues](https://github.com/saturnbtc/arch-typescript-sdk/issues)
- **Documentation**: [TypeScript SDK Docs](typescript/getting-started.md)
- **Examples**: [TypeScript Examples](https://github.com/saturnbtc/arch-typescript-sdk/tree/main/examples)

### Rust SDK Support
- **Issues**: [Arch Network GitHub Issues](https://github.com/arch-network/arch-network/issues)
- **Documentation**: [Rust SDK Docs](rust/getting-started.md)
- **Examples**: [Rust Examples](https://github.com/arch-network/arch-network/examples)

### General Support
- **Discord**: [Arch Network Discord](https://discord.gg/archnetwork)
- **Forum**: [Arch Network Forum](https://forum.arch.network)
- **Stack Overflow**: Tag with `arch-network`

## Next Steps

Choose your SDK and get started:

- **[Get Started with TypeScript SDK →](typescript/getting-started.md)**
- **[Get Started with Rust SDK →](rust/getting-started.md)**

For a general introduction to Arch Network concepts, visit our [Getting Started Guide](../getting-started/quick-start.md).
