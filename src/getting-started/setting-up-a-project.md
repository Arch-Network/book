# Setting up a project

## Initialize
The `init` subcommand initializes an Arch Network project with the necessary folder structure, boilerplate code, and Docker configurations for supporting the example application.

We'll invoke this and setup a new project.

```bash
arch-cli init
```

If everything initializes smoothly, you'll be presented with output similar to the following:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Initializing new Arch Network app...
Checking required dependencies...
  → Checking docker... ✓
    Detected version: Docker version 27.2.0, build 3ab4256958
  → Checking docker-compose... ✓
    Detected version: Docker Compose version 2.29.2
  → Checking node... ✓
    Detected version: v22.8.0
  → Checking solana... ✓
    Detected version: solana-cli 1.18.22 (src:b286211c; feat:4215500110, client:SolanaLabs)
  → Checking cargo... ✓
    Detected version: cargo 1.80.1 (376290515 2024-07-16)
All required dependencies are installed.
  ✓ Created arch-data directory at "/Users/jr/Library/Application Support/arch-cli/arch-data"
  ✓ Copied default configuration to "/Users/jr/Library/Application Support/arch-cli/config.toml"
Building Arch Network program...
Creating project structure...
Creating boilerplate files...
  ℹ Existing program directory found, preserving it
  ℹ Existing frontend directory found, preserving it
  ✓ New Arch Network app initialized successfully!
```

Your project should now have the following structure:
```bash
arch-cli
├── src/
│   └── app/
│       ├── program/
│       │   └── src/
│       │       └── lib.rs
│       ├── backend/
│       │   ├── index.ts
│       │   └── package.json
│       ├── frontend/
│       │   ├── index.html
│       │   ├── index.js
│       │   ├── package.json
│       │   └── .env.example
│       └── keys/
├── Cargo.toml
├── config.toml
├── bitcoin-docker-compose.yml
└── arch-docker-compose.yml
```

## Create a new project
If you'd instead like to create a new project from scratch, the `arch-cli` offers a `project create` directive whereby you can do so.

Simply issue the following command and pass the name of your project in.
```
arch-cli project create --name my_app
```

With this, you'll be able to begin modifying your program's business logic. In the next step you'll learn to build, deploy and interact with a program depending on your chosen [development track] setup.

[development track]: ./starting-stack.md#choose-a-track
