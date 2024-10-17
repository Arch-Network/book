# Setting up a project

## Initialize
The `init` subcommand initializes an Arch Network project with the necessary folder structure, boilerplate code, and Docker configurations for supporting the example application.

```bash
arch-cli init
```

> Note: This step will prompt you to provide a location on your hard drive where you'd like new Arch projects to be created; this location is then stored within the `config.toml` and can be updated accordingly.
> 
> The default location for new Arch projects is within your `/Documents` directory.

If everything initializes smoothly, you'll be presented with output similar to the following:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Initializing new Arch Network app...
Checking required dependencies...
  → Checking docker... ✓
    Detected version: Docker version 27.3.1, build ce1223035a
  → Checking docker-compose... ✓
    Detected version: Docker Compose version 2.29.7
  → Checking node... ✓
    Detected version: v22.9.0
  → Checking solana... ✓
    Detected version: solana-cli 1.18.22 (src:b286211c; feat:4215500110, client:SolanaLabs)
  → Checking cargo... ✓
    Detected version: cargo 1.81.0 (2dbb1af80 2024-08-20)
All required dependencies are installed.
Where would you like to create your Arch Network project?
Default: /Users/jr/Documents/ArchNetwork
Project directory (press Enter for default):
  ℹ Directory does not exist. Do you want to create it? (Y/n)
y
  ✓ Directory created successfully
  ✓ Created demo directory at "/Users/jr/Documents/ArchNetwork/demo"
  ✓ Created arch-data directory at "/Users/jr/Library/Application Support/arch-cli/arch-data"
  ✓ Copied default configuration to "/Users/jr/Library/Application Support/arch-cli/config.toml"
  ✓ Updated configuration with project directory
  ✓ Created demo directory at "/Users/jr/Documents/ArchNetwork/demo"
Copying project files...
 Current directory: "/Users/jr/rust/arch/arch-cli"
  ✓ Copied project files to demo directory
Copying program folder...
  ✓ Copied program folder to demo directory
Building Arch Network program...
  ✓ Arch Network program built successfully
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

Simply issue the following command and pass the name of your project in:
```bash
arch-cli project create --name my_app
```

And the corresponding output:
```bash
Welcome to the Arch Network CLI
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
Creating a new project...
  ✓ Updated configuration with project directory
  ✓ Created project directory at "/Users/jr/Documents/ArchNetwork/my_app"
```

With this, you'll be able to begin modifying your program's business logic. In the next step you'll learn to build, deploy and interact with a program depending on your chosen [development track] setup.

[development track]: ./starting-stack.md#choose-a-track
