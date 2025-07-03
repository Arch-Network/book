#!/bin/bash
set -e

# Check for required dependencies
check_dependency() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Error: Required dependency '$1' is not installed"
        case "$1" in
            jq)
                echo "Please install jq using one of the following commands:"
                echo "  - For Debian/Ubuntu: sudo apt-get install jq"
                echo "  - For RedHat/CentOS: sudo yum install jq"
                echo "  - For macOS: brew install jq"
                ;;
            *)
                echo "Please install $1 before continuing"
                ;;
        esac
        exit 1
    fi
}

# Check for sudo privileges upfront
if ! [ -w "/usr/local/bin" ]; then
    echo "Error: Installation requires sudo privileges"
    exit 1
fi

# Check for required dependencies
check_dependency "jq"
check_dependency "curl"

# Determine operating system and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Get the latest version tag if VERSION is not set
if [ -z "$VERSION" ]; then
    if ! VERSION=$(curl -sSfL https://api.github.com/repos/Arch-Network/arch-node/releases/latest | jq -r .tag_name); then
        echo "Error: Failed to fetch latest version information"
        exit 1
    fi
    if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
        echo "Error: Invalid version information received from GitHub API"
        exit 1
    fi
fi

# Create temporary directory with cleanup
TMP_DIR=$(mktemp -d)
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Download URL based on OS and architecture
BINARY_NAME="arch-cli"
DOWNLOAD_BINARY_NAME="arch-cli"

# Map uname architecture to our release architecture names
case "$ARCH" in
    x86_64)
        RELEASE_ARCH="x86_64-unknown-linux-gnu"
        ;;
    aarch64|arm64)
        if [ "$OS" = "darwin" ]; then
            RELEASE_ARCH="aarch64-apple-darwin"
        else
            RELEASE_ARCH="aarch64-unknown-linux-gnu"
        fi
        ;;
    *)
        echo "Error: Unsupported architecture: $ARCH"
        exit 1
        ;;
esac


# Construct and validate download URL
DOWNLOAD_URL="https://github.com/Arch-Network/arch-node/releases/download/${VERSION}/${DOWNLOAD_BINARY_NAME}-${RELEASE_ARCH}"

echo "Downloading Arch Network CLI (arch-cli) version ${VERSION}..."

# Attempt download with better error handling
if ! curl -sSfL "$DOWNLOAD_URL" -o "$TMP_DIR/${BINARY_NAME}"; then
    echo "Error: Failed to download arch-cli binary from ${DOWNLOAD_URL}"
    echo "Please check:"
    echo "  - Your internet connection"
    echo "  - That version ${VERSION} exists in the releases"
    echo "  - That your architecture (${RELEASE_ARCH}) is supported"
    echo ""
    echo "Available releases: https://github.com/Arch-Network/arch-node/releases"
    exit 1
fi

# Verify download
if [ ! -s "$TMP_DIR/${BINARY_NAME}" ]; then
    echo "Error: Downloaded file is empty"
    echo "Please verify the version and architecture are correct:"
    echo "Version: ${VERSION}"
    echo "Architecture: ${RELEASE_ARCH}"
    exit 1
fi

# Install into /usr/local/bin with improved error messages
INSTALL_DIR="/usr/local/bin"
if ! sudo mv "$TMP_DIR/${BINARY_NAME}" "$INSTALL_DIR/"; then
    echo "Error: Failed to move binary to ${INSTALL_DIR}"
    echo "Please check your permissions and disk space"
    exit 1
fi

if ! sudo chmod +x "$INSTALL_DIR/${BINARY_NAME}"; then
    echo "Error: Failed to make binary executable"
    echo "Please check your permissions"
    exit 1
fi

# Verify installation
echo "Verifying installation..."
if ! "$INSTALL_DIR/${BINARY_NAME}" --version >/dev/null 2>&1; then
    echo "Warning: Binary installed but version check failed"
    echo "You may need to restart your terminal or add ${INSTALL_DIR} to your PATH"
else
    echo "Installation verified successfully!"
fi

echo "Arch Network CLI (arch-cli) ${VERSION} installed successfully to ${INSTALL_DIR}"
echo "You can now run 'arch-cli --version' to verify the installation"
