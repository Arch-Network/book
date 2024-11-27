# Program interaction

Table of Contents:
- [Description]
- [Logic]

## Description
Continuing with our example program, [GraffitiWall], we find an implementation example of how to communicate with a deployed [program] by looking at the frontend code; specifically, we'll look at the [GrafittiWallComponent.tsx] file.

## Logic
```typescript
const client = new RpcConnection((import.meta as any).env.VITE_RPC_URL || 'http://localhost:9002');
const PROGRAM_PUBKEY = (import.meta as any).env.VITE_PROGRAM_PUBKEY;
const WALL_ACCOUNT_PUBKEY = (import.meta as any).env.VITE_WALL_ACCOUNT_PUBKEY;
```

Here we initialize a new RPC connection and pass in the RPC URL that we wish to connect to; in this case, the URL is pulled from the Vite environment variable or defaults to our locally running validator.

We then import the [Pubkey]s of the Graffiti Wall [Program] as well as the Wall Account. The Wall Account stores the state of the Graffiti Wall and the Program's pubkey serves as the owner of the Graffiti Wall.

```typescript
class GraffitiMessage {
  constructor(
    public timestamp: number,
    public name: string,
    public message: string
  ) {}

  static schema = new Map([
    [
      GraffitiMessage,
      {
        kind: 'struct',
        fields: [
          ['timestamp', 'i64'],
          ['name', ['u8', 16]],
          ['message', ['u8', 64]]
        ]
      }
    ]
  ]);
}

// Define the schema for the wall containing messages
class GraffitiWall {
  constructor(public messages: GraffitiMessage[]) {}

  static schema = new Map([
    [
      GraffitiWall,
      {
        kind: 'struct',
        fields: [
          ['messages', [GraffitiMessage]]
        ]
      }
    ]
  ]);
}
```

We then define the schemas for handling the Wall's message data- these schemas mirror the data structure that are found within the [Graffiti Wall] program which ensures data uniformity between the application frontend and program backend during serialization/deserialization.

```rust,ignore
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct GraffitiMessage {
    pub timestamp: i64,
    pub name: [u8; 16],
    pub message: [u8; 64],
}
```

Above is the data structure as defined in `src/app/program/src/lib.rs`, our [Program].

```typescript
  const accountPubkey = PubkeyUtil.fromHex(WALL_ACCOUNT_PUBKEY);

  const schema = {
    struct: {
      messages: {
        seq: {
          struct: {
            timestamp: 'i64',
            name: { array: { type: 'u8', len: 16 } },
            message: { array: { type: 'u8', len: 64 } }
          }
        }
      }
    }
  };
```

_We'll skip over the React state management code._

Moving along, we set the `accountPubkey` variable with our previously imported Wall account [Pubkey] converted from hexidecimal and then set a new schema for to handle the Graffiti Wall message data.

```typescript
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
    setError('The Arch Graffiti program has not been deployed to the network yet. Please run `arch-cli deploy`.');
  }
}, []);
```

We then submit our first request to the Arch RPC service: `readAccountInfo`.

We pass the `pubkeyBytes`- which represents the `program_id`, indicating the unique resource location of the [Program] within the Arch Network- as the argument to `readAccountInfo` in order to obtain the [Account] information.

If we are able to read the `accountInfo` successfully, then we can be sure the program was deployed.

```typescript
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
      setError('The wall account has not been created yet. Please run the account creation command.');
    }
  }, []);
```

Similarly, we perform the same check against the Wall account, ensuring that the Graffiti wall has an account provisioned to manage the program's state. Without this state account the program would not have any data to work with; as a reminder, every Arch [Program] is stateless.

```typescript
const fetchWallData = useCallback(async () => {
    try {
        const userAccount = await client.readAccountInfo(accountPubkey);
        if (!userAccount) {
            setError('Account not found.');
            return;
        }
        const wallData = userAccount.data;
        
        console.log(`Wall data: ${wallData}`);
...
```

We then begin to retrieve the Graffiti Wall data from the Wall account.

We make an RPC call to read in the account info just as we did in the previous step, only this time we access the data stored within the [AccountInfo]. As of now, this data is not yet parsed, so it comes back as bytes which will need to be handled.

```typescript
        // If data is empty or invalid length, just set empty messages without error
        if (!wallData || wallData.length < 4) {
            setWallData([]);
            setError(null); // Clear any existing errors
            return;
        }
```

We perform a check against the length of this bytedata to ensure that it is not empty, meaning there is at least some data stored within the Wall account.

```typescript
        // Deserialize the wall data using borsh
        // Read data directly from the buffer
        const messages = [];
        let offset = 0;

        // First 4 bytes are the array length
        const messageCount = new DataView(wallData.buffer).getUint32(offset, true);
        offset += 4;

        for (let i = 0; i < messageCount; i++) {
            // Read timestamp (8 bytes)
            const timestamp = new DataView(wallData.buffer).getBigInt64(offset, true);
            offset += 8;

            // Read name (16 bytes)
            const nameBytes = wallData.slice(offset, offset + 16);
            const name = new TextDecoder().decode(nameBytes.filter(x => x !== 0));
            offset += 16;

            // Read message (64 bytes)
            const messageBytes = wallData.slice(offset, offset + 64);
            const message = new TextDecoder().decode(messageBytes.filter(x => x !== 0));
            offset += 64;

            messages.push(new GraffitiMessage(
                Number(timestamp),
                name,
                message
            ));
        }

        messages.sort((a, b) => b.timestamp - a.timestamp);

        setWallData(messages);
    } catch (error) {
        console.error('Error fetching wall data:', error);
        setError(`Failed to fetch wall data: ${error instanceof Error ? error.message : String(error)}`);
    }
    ...
```

We now need to deserialize the bytedata into a structure that is more manageable, in this case, we'll make use of the GraffitiMessage schema we set earlier.

```typescript
  const handleAddToWall = async () => {
    if (!message.trim() || !name.trim() || !isAccountCreated || !wallet.isConnected) {
      setError("Name and message are required, account must be created, and wallet must be connected.");
      return;
    }
```

We'll again skip over some React state management.

`handleAddToWall` contains the lion's share of the logic for serializing data and submitting this data to the [Program].

```typescript
  const serializeGraffitiData = (name: string, message: string): number[] => {
    // Create fixed-size arrays
    const nameArray = new Uint8Array(16).fill(0);
    const messageArray = new Uint8Array(64).fill(0);
    
    // Convert strings to bytes
    const nameBytes = new TextEncoder().encode(name);
    const messageBytes = new TextEncoder().encode(message);
    
    // Copy bytes into fixed-size arrays (will truncate if too long)
    nameArray.set(nameBytes.slice(0, 16));
    messageArray.set(messageBytes.slice(0, 64));
    
    // Create the params object matching the Rust struct
    const params = {
        name: Array.from(nameArray),
        message: Array.from(messageArray)
    };
    
    // Define the schema for borsh serialization
    const schema = {
        struct: {
            name: { array: { type: 'u8', len: 16 } },
            message: { array: { type: 'u8', len: 64 } }
        }
    };
    
    return Array.from(borsh.serialize(schema, params));
    ...
```

In this anonymous function we pass in our dapp data, `name` and `message` in order to prepare it for submission to the [Program].

We create two new `Uint8` byte arrays and initialize their appropriate lengths (16 and 64, respectively) with placeholder zeros, eventually copying the encoded `name` and `message` data into into fixed-size arrays and storing them within the `params` object. 

We define the schema for the data and serialize the scheme alongside the `params` object which we will use within the following `try` block.

```typescript
    try {
      const data = serializeGraffitiData(name, message);
    
      const instruction: Instruction = {
        program_id: PubkeyUtil.fromHex(PROGRAM_PUBKEY),
        accounts: [
          { 
            pubkey: PubkeyUtil.fromHex(wallet.publicKey!), 
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
...
```

Stepping into our `try` block, we serialize our Graffiti data, in this case including the name of the author as well as the message they wish to post.

We construct an [Instruction] object, containing our `program_id`, serialized data, as well as the accounts involved, in this case, the signing [Pubkey] of our user's wallet as well as the `accountPubkey`, the [Pubkey] of our Wall's account for holding the [Program] state.

```typescript
   const messageObj : Message = {
        signers: [PubkeyUtil.fromHex(wallet.publicKey!)],
        instructions: [instruction],
      };
```

We then construct our [Message] object to hold the needed signers (our user) as well as the previously formed [Instruction].

```typescript
const messageBytes = MessageUtil.serialize(messageObj);
...
const signature = await wallet.signMessage(Buffer.from(MessageUtil.hash(messageObj)).toString('hex'));
```

We then serialize our [Message] and then craft our [Signature].

```typescript
const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64')).slice(2);
console.log(`Signature bytes: ${signatureBytes}`);

const result = await client.sendTransaction({
  version: 0,
  signatures: [signatureBytes],
  message: messageObj,
});
```

We then store our [Signature] within a new `Uint8` array and create a slice from it in order to segregate the last 64-bytes of the base64 decoded [Signature].

```typescript
const result = await client.sendTransaction({
  version: 0,
  signatures: [signatureBytes],
  message: messageObj,
});
```

We then craft our [Transaction] object within the RPC call to `sendTransaction`, passing in our sliced [Signature] and serialized [Message], along with the correct [Transaction] version (`0`), successfully submitting our state change to the Arch Network for processing.

🎨

This concludes the logic walkthrough of the [Program] interaction component of our [GraffitiWall].

<!-- Internal -->
[Description]: #description
[Logic]: #logic
[Program]: ../program/program.md
[Pubkey]: ../program/pubkey.md
[Account]: ../program/account.md
[AccountInfo]: ../program/account.md#accountinfo
[Instruction]: ../program/instructions-and-messages.md#instructions
[Message]: ../program/instructions-and-messages.md#messages
[Signature]: ../sdk/signature.md#signature
[Transaction]: ../sdk/runtime-transaction.md#runtime-transaction

<!-- External -->
[GraffitiWall]: https://github.com/Arch-Network/arch-cli/blob/main/templates/demo/app/program/src/lib.rs 
[GrafittiWallComponent.tsx]: https://github.com/Arch-Network/arch-cli/blob/main/templates/demo/app/frontend/src/components/GraffitiWallComponent.tsx
