# Drops

The drops page displays all the registered tokens and allows anyone to claim or purchase one instance.

Create `./pages/drops.tsx` with a basic component inside. The content will be a simple list of tokens, so we'll reuse the previously created TokenList component:&#x20;

```tsx
import React, { useCallback, useState } from 'react'
import { TokenList } from '../components/Token'
import { CallResult } from '@completium/archetype-ts-types'
import { Alert, Button, Snackbar, Typography } from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import RedeemIcon from '@mui/icons-material/Redeem'
import { useTzombiesContext } from '../components/providers/TzombiesProvider'

const Drops = () => {
​const Extra = useCallback(() => <></>, [])
  return (
    <>
      <Typography variant="h4">Drops</Typography>
      <TokenList
        tokens={[]}
        actions={() => <React.Fragment/>}
        onClick={() => {}}
        extra={Extra}
      />
    </>
  )
}

export default Drops
```

In the three pages we'll add a Snackbar for success and error message display, as well as a loading state when an operation is pending.&#x20;

```tsx
const [minted, setMinted] = useState<CallResult>()
const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string>()

return ( 
    <>
        <Snackbar open={!!minted} onClose={() => setMinted(undefined)}>
        <Alert severity={"success"}>Minted in {minted?.operation_hash}</Alert>
        </Snackbar>
        <Snackbar open={!!error} onClose={() => setError(undefined)}>
          <Alert severity={"error"}>Error: {error}</Alert>
        </Snackbar>
        */ <Typography variant ... */
```

Add state and the free claim callback:&#x20;

```tsx
const { freeClaim, fetchInventory, tokenInfo } = useTzombiesContext()

const handleClaim = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        const result = await freeClaim(id)
        setMinted(result)
        fetchInventory()
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? JSON.stringify(e))
      } finally {
        setLoading(false)
      }
    },
    [freeClaim, fetchInventory]
  )
```

And for the token custom actions, we'll define the claim button (we'll implement the "buy for 2ꜩ" callback later)

```tsx
const ClaimButton = useCallback(
  (id: number) => (
    <>
      {id === 1 ? (
        <Button
          disabled={loading}
          onClick={() => {}}
          startIcon={<AddShoppingCartIcon />}
        >
          {loading ? "In progress..." : "Buy for 2ꜩ"}
        </Button>
      ) : (
        <Button
          disabled={loading}
          onClick={() => handleClaim(id)}
          startIcon={<RedeemIcon />}
        >
          {loading ? "In progress..." : "Claim for free"}
        </Button>
      )}
    </>
  ),
  [handleClaim, loading]
)
```

We can now populate the `TokenList` props:&#x20;

```tsx
<TokenList
    tokens={[...(tokenInfo?.keys() ?? [])]}
    actions={ClaimButton}
    onClick={handleClaim}
    extra={Extra}
/>
```

And export the component:

```tsx
export default Drops
```

At this point, your Drops page (at localhost:3000/drops) should look like this:

<figure><img src="../../.gitbook/assets/Screenshot 2023-07-14 at 5.39.12 PM.png" alt=""><figcaption></figcaption></figure>

If you have restarted your sandbox since deploying your contracts and registering the NFT metadata in the [Smart Contracts Section](broken-reference), you will need to complete those steps again in order for the tokens to be visible on the drops page. A summary of the required steps for setup can be found in the [project README](https://github.com/lgaroche/zombies/tree/main#readme). Complete the steps up to and including [Register NFTs](https://github.com/lgaroche/zombies/tree/main#register-nfts) to get your drops page to work. You will also have to update your .env.local file with the correct contract addresses.

At this point, you may notice that after signing in with a user wallet you recieve 404 errors in you console. These errors are caused by calls to the blockchain RPC that are rejected. For example, if the connected wallet has not given the market operator permissions, requests to the market will be rejected with a 404 error. If a wallet is connected, our providers make calls to the chain in their useEffect blocks, using this wallet address as an input argument. If this wallet doesn't own any of the relevant NFTs, or hasn't set permissions for our market, these 404 errors will occur.
