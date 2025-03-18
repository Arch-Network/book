# Building, deploying and interfacing

Now that all of the dependencies are installed and we have successfully started our [development stack], we can finally discuss program development, including compiling, deploying and interacting with it.

This guide will walk you through a sample program that functions as a graffiti wall, where each message written to the wall contains a timestamp, name, and note.

You can find sample program code in the [arch-examples repository](https://github.com/Arch-Network/arch-examples).

### Build
In order to compile the program, we'll make use of the `cargo-build-sbf` binary, a tool that comes with the [Solana-CLI] that installs the toolchain needed to produce Executable and Linkable Format (ELF) files which consist of [eBPF] bytecode.

Navigate to your program directory:
```bash
cd your-program-directory
```

Build the program:
```bash
cargo build-sbf
```

You will find the generated shared object file at: `./target/deploy/your_program_name.so`

_If you are experiencing issues with this step, we recommend returning to review the [requirements] page or hopping in our [Discord dev-chat] channel for support._

### Deploy
In this step, we will be submitting a transaction to store our program's logic on the Arch Network.

> Note: make sure you have a validator running before deploying the program. If you don't, run `arch-cli validator start`

```bash
arch-cli deploy target/deploy/your_program_name.so
```

Copy the Program ID from the output as you will need this again later. 

The Program ID can be thought of as a uniform resource locator (URL) for your deployed program on the Arch Network.

### Create an Account
An account is used to store the state for your application.

You'll need to create an account that your program can control. This can be done using the system program through an RPC call:

```bash
# This is a simplified example
# You'll need to construct, sign, and encode a transaction according to the Arch Network protocol
curl -X POST http://localhost:9002 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"sendTransaction",
    "params":[{
      "signature":"your_signature",
      "message":{
        "accountKeys":["your_pubkey", "your_program_id"],
        "instructions":[{
          "programId":"system_program_id",
          "accounts":["your_pubkey", "new_account_pubkey"],
          "data":"encoded_create_account_data"
        }]
      }
    }]
  }'
```

### Create a frontend application
To interact with your program, you'll need to create a frontend application that can send instructions to your program and display the results.

Here's a basic example of a React component that interacts with a graffiti wall program:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RpcConnection, MessageUtil, PubkeyUtil, Instruction, Message } from '@saturnbtcio/arch-sdk';
import { useWallet } from '../hooks/useWallet';
import * as borsh from 'borsh';

// Environment variables for configuration
const client = new RpcConnection('/api');
const PROGRAM_PUBKEY = import.meta.env.VITE_PROGRAM_PUBKEY;
const WALL_ACCOUNT_PUBKEY = import.meta.env.VITE_WALL_ACCOUNT_PUBKEY;

// Message data structure
interface GraffitiMessage {
  timestamp: number;
  name: string;
  message: string;
}

function GraffitiWall() {
  // State management
  const wallet = useWallet();
  const [error, setError] = useState(null);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isProgramDeployed, setIsProgramDeployed] = useState(false);
  const [wallData, setWallData] = useState([]);
  
  // Form state
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Convert account pubkey once
  const accountPubkey = PubkeyUtil.fromHex(WALL_ACCOUNT_PUBKEY);
  
  // Check if the program is deployed on the network
  const checkProgramDeployed = useCallback(async () => {
    try {
      const pubkeyBytes = PubkeyUtil.fromHex(PROGRAM_PUBKEY);
      const accountInfo = await client.readAccountInfo(pubkeyBytes);
      if (accountInfo) {
        setIsProgramDeployed(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error checking program:', error);
      setError('The Arch Graffiti program has not been deployed to the network yet.');
    }
  }, []);

  // Check if the wall account exists
  const checkAccountCreated = useCallback(async () => {
    try {
      const pubkeyBytes = PubkeyUtil.fromHex(WALL_ACCOUNT_PUBKEY);
      const accountInfo = await client.readAccountInfo(pubkeyBytes);
      if (accountInfo) {
        setIsAccountCreated(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error checking account:', error);
      setIsAccountCreated(false);
      setError('The wall account has not been created yet.');
    }
  }, []);

  // Fetch and parse wall messages
  const fetchWallData = useCallback(async () => {
    try {
      const accountInfo = await client.readAccountInfo(accountPubkey);
      
      if (!accountInfo || !accountInfo.data) {
        setWallData([]);
        return;
      }

      const data = accountInfo.data;

      // Read header (first 8 bytes)
      const header = {
        message_count: new DataView(data.buffer).getUint32(0, true),
        max_messages: new DataView(data.buffer).getUint32(4, true)
      };

      const messages = [];
      const HEADER_SIZE = 8;
      const MESSAGE_SIZE = 8 + 64 + 64; // timestamp + name + message

      // Read messages
      for (let i = 0; i < header.message_count; i++) {
        const offset = HEADER_SIZE + (i * MESSAGE_SIZE);
        
        // Read timestamp (8 bytes)
        const timestamp = Number(new DataView(data.buffer).getBigInt64(offset, true));
        
        // Read name (64 bytes)
        const nameBytes = data.slice(offset + 8, offset + 8 + 64);
        const name = new TextDecoder().decode(nameBytes.filter(x => x !== 0));
        
        // Read message (64 bytes)
        const messageBytes = data.slice(offset + 8 + 64, offset + 8 + 64 + 64);
        const message = new TextDecoder().decode(messageBytes.filter(x => x !== 0));

        messages.push({ timestamp, name, message });
      }

      setWallData(messages);
      setError(null);
    } catch (error) {
      console.error('Error fetching wall data:', error);
      setError('Failed to fetch wall data');
    }
  }, []);

  // Initialize component
  useEffect(() => {
    checkProgramDeployed();
    checkAccountCreated();
  }, [checkAccountCreated, checkProgramDeployed]);

  // Set up polling for wall data
  useEffect(() => {
    if (!isAccountCreated) return;

    fetchWallData();
    const interval = setInterval(fetchWallData, 5000);
    return () => clearInterval(interval);
  }, [isAccountCreated, fetchWallData]);

  // Message handlers
  const handleNameChange = (e) => {
    setName(e.target.value);
    setIsFormValid(e.target.value.trim() !== '' && message.trim() !== '');
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setIsFormValid(name.trim() !== '' && e.target.value.trim() !== '');
  };

  const handleAddToWall = async () => {
    if (!message.trim() || !name.trim() || !isAccountCreated || !wallet.isConnected) {
      setError("Name and message are required, account must be created, and wallet must be connected.");
      return;
    }

    try {
      const data = serializeGraffitiData(name, message);

      const instruction = {
        program_id: PubkeyUtil.fromHex(PROGRAM_PUBKEY),
        accounts: [
          { 
            pubkey: PubkeyUtil.fromHex(wallet.publicKey), 
            is_signer: true, 
            is_writable: false 
          },
          { 
            pubkey: accountPubkey, 
            is_signer: false, 
            is_writable: true 
          },
        ],
        data: new Uint8Array(data),
      };

      const messageObj = {
        signers: [PubkeyUtil.fromHex(wallet.publicKey)],
        instructions: [instruction],
      };

      const messageHash = MessageUtil.hash(messageObj);
      const signature = await wallet.signMessage(Buffer.from(messageHash).toString('hex'));
      
      const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64')).slice(2);

      await client.sendTransaction({
        version: 0,
        signatures: [signatureBytes],
        message: messageObj,
      });

      // Refresh the wall data
      await fetchWallData();
      
      // Reset form
      setMessage('');
      setName('');
    } catch (error) {
      console.error('Error adding to wall:', error);
      setError(`Failed to add to wall: ${error.message}`);
    }
  };

  const serializeGraffitiData = (name, message) => {
    // Create fixed-size arrays
    const nameArray = new Uint8Array(64).fill(0);
    const messageArray = new Uint8Array(64).fill(0);
    
    // Convert strings to bytes
    const nameBytes = new TextEncoder().encode(name);
    const messageBytes = new TextEncoder().encode(message);
    
    // Copy bytes into fixed-size arrays (will truncate if too long)
    nameArray.set(nameBytes.slice(0, 64));
    messageArray.set(messageBytes.slice(0, 64));
    
    // Create the params object matching the Rust struct
    const params = {
        name: Array.from(nameArray),
        message: Array.from(messageArray)
    };
    
    // Define the schema for borsh serialization
    const schema = {
        struct: {
            name: { array: { type: 'u8', len: 64 } },
            message: { array: { type: 'u8', len: 64 } }
        }
    };
    
    return Array.from(borsh.serialize(schema, params));
  };
  
  return (
    <div>
      <h1>Graffiti Wall</h1>
      
      {!wallet.isConnected ? (
        <div>
          <p>Please connect your wallet to interact with the Graffiti Wall</p>
          <button onClick={() => wallet.connect()}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          <p>Connected: {wallet.publicKey}</p>
          <button onClick={wallet.disconnect}>Disconnect</button>
        </div>
      )}
      
      {!isAccountCreated ? (
        <div>
          <h3>Account Setup Required</h3>
          <p>To participate in the Graffiti Wall, please create an account using the Arch CLI.</p>
        </div>
      ) : (
        <div>
          <div>
            <h3>Add to Wall</h3>
            <input 
              type="text" 
              placeholder="Your name (max 64 bytes)" 
              value={name} 
              onChange={handleNameChange}
              required
            />
            <textarea 
              placeholder="Your message (max 64 bytes)" 
              value={message} 
              onChange={handleMessageChange}
              required
            />
            <button 
              onClick={handleAddToWall}
              disabled={!isFormValid}
            >
              Add to the Wall
            </button>
          </div>
          
          <div>
            <h3>Wall Messages</h3>
            <div>
              {[...wallData].reverse().map((item, index) => (
                <div key={index}>
                  <p><strong>{new Date(item.timestamp * 1000).toLocaleString()}</strong></p>
                  <p><strong>{item.name}:</strong> {item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraffitiWall;
```

Once you've created your frontend application, you can start it using your preferred development server (e.g., `npm run dev` or `yarn dev`) and interact with your deployed program.

<!-- Internal -->
[development stack]: ../getting-started/starting-stack.md#choose-a-track
[Solana-CLI]: ../getting-started/requirements.md#install-solana-cli
[requirements]: ../getting-started/requirements.md

<!-- External -->
[eBPF]: https://ebpf.io/
[Discord dev-chat]: https://discord.com/channels/1241112027963986001/1270921925991989268
