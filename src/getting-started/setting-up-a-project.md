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
Loading config for network: development
  → Loading configuration from /Users/jr/Library/Application Support/arch-cli/config.toml
  ✓ Loaded network-specific configuration for development
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
  ⚠ Directory is not empty. Do you want to use this existing project folder? (y/N)
y
  ✓ Using existing project folder
  ✓ Created arch-data directory at "/Users/jr/Library/Application Support/arch-cli/arch-data"
  ✓ Copied default configuration to "/Users/jr/Library/Application Support/arch-cli/config.toml"
  ✓ Updated configuration with project directory
  ✓ New Arch Network app initialized successfully!
```

## Create a new project
To create a new project, the `arch-cli` offers a `project create` directive that will setup a new project directory in the location set in the `config.toml`.

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
  ✓ Created project directory at "/Users/jr/Documents/ArchNetwork/projects/my_app"
```

You will find all of the necessary crates for development (eg, `/program`, `/sdk` and `/bip322`) available at the root of `/ArchNetwork`. 

In this way, all projects will be able to access the necessary Arch dependencies without needing to manage them within each project.

Example:
```bash
ArchNetwork/
├─ bip322/
├─ program/
├─ projects/
│  ├─ my_app/
├─ sdk/
```
