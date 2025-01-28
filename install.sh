#!/bin/bash
set -e

# Check for sudo privileges upfront
if ! [ -w "/usr/local/bin" ]; then
    echo "Error: Installation requires sudo privileges"
    exit 1
fi

# Determine operating system and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Get the latest version tag if VERSION is not set
if [ -z "$VERSION" ]; then
    VERSION=$(curl -sSfL https://api.github.com/repos/Arch-Network/arch-node/releases/latest | jq -r .tag_name)
fi

# Create temporary directory with cleanup
TMP_DIR=$(mktemp -d)
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Download URL based on OS and architecture
BINARY_NAME="cli"

# Map uname architecture to our release architecture names
case "$ARCH" in
    x86_64)
        RELEASE_ARCH="x86_64-unknown-linux-gnu"
        ;;
    aarch64)
        RELEASE_ARCH="aarch64-apple-darwin"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

DOWNLOAD_URL="https://github.com/Arch-Network/arch-node/releases/download/${VERSION}/${BINARY_NAME}-${RELEASE_ARCH}"

echo "Downloading ${BINARY_NAME} version ${VERSION}..."
if ! curl -sSfL "$DOWNLOAD_URL" -o "$TMP_DIR/${BINARY_NAME}"; then
    echo "Error: Failed to download binary"
    exit 1
fi

# Verify download
if [ ! -s "$TMP_DIR/${BINARY_NAME}" ]; then
    echo "Error: Downloaded file is empty"
    exit 1
fi

# Install into /usr/local/bin
INSTALL_DIR="/usr/local/bin"
if ! sudo mv "$TMP_DIR/${BINARY_NAME}" "$INSTALL_DIR/"; then
    echo "Error: Failed to move binary to ${INSTALL_DIR}"
    exit 1
fi

if ! sudo chmod +x "$INSTALL_DIR/${BINARY_NAME}"; then
    echo "Error: Failed to make binary executable"
    exit 1
fi

echo "${BINARY_NAME} ${VERSION} installed successfully to ${INSTALL_DIR}"