# End to end test

This separate package runs a relatively slow (~1 minute) journey test.

## Configuration

**Note**: your IP must initially be excluded from accessing the configured database.

- `MONGO_URL`: connection string for a database on MongoDB Atlas
- `ATLAS_GROUP_ID`: the group/project ID for the database
- `ATLAS_PUBLIC_KEY`: public key for the Atlas admin API (requires Project Owner role)
- `ATLAS_PRIVATE_KEY`: corresponding private key

These can be provided via a `.env` file in this directory:

```dotenv
MONGO_URL=mongodb+srv://<user>:<pass>@<db>.mongodb.net/?retryWrites=true&w=majority&appName=<app>
ATLAS_GROUP_ID=<groupId>
ATLAS_PUBLIC_KEY=<publicKey>
ATLAS_PRIVATE_KEY=<privateKey>
```
