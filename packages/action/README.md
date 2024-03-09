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

- `atlas-public-key`: API public key (must have Project Owner [role](https://www.mongodb.com/docs/atlas/reference/user-roles/#project-roles))
- `atlas-private-key`: Corresponding private key
- `comment` _(optional)_: Description comment to show in the admin panel
    - Defaults to `{owner}/{repo} - {job} - {runId}`
- `group-id`: Unique 24-hexadecimal digit string that identifies the project

### Outputs

- `ip-address`: The public IP address of the runner
