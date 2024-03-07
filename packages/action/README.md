# Allow Atlas IP

Permit GitHub Actions runners to access MongoDB Atlas.

## Usage

```yaml
- name: Permit runner to access MongoDB Atlas
  uses: textbook/atlas-ip@v1
  with:
    atlas-private-key: ${{ secrets.ATLAS_PRIVATE_KEY }}
    atlas-public-key: ${{ secrets.ATLAS_PUBLIC_KEY }}
    group-id: ${{ vars.ATLAS_GROUP_ID }}
```

### Inputs

- `atlas-public-key`: API public key
- `atlas-private-key`: Corresponding private key
- `group-id`: Unique 24-hexadecimal digit string that identifies the project

### Outputs

- `ip-address`: The public IP address of the runner
