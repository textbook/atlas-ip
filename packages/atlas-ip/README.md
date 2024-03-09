# `@textbook/atlas-ip`

Permit IPs to access MongoDB Atlas.

## Usage

```javascript
import Atlas from "@textbook/atlas-ip";

// set up required configuration

const atlas = await Atlas.create({ publicKey, privateKey })
await atlas.permit(groupId, ipAddress, comment);

// do work with MongoDB connection

await atlas.revoke(groupId, ipAddress);
```
