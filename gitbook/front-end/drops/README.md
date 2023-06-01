# Drops

The drops page displays all the registered tokens and allows anyone to claim or purchase one instance.

Create `./pages/drops.tsx` with a basic component inside. The content will be a simple list of tokens, so we'll reuse the previously created TokenList component:&#x20;

```tsx
import React, { useCallback, useState } from "react"
import { TokenList } from "../components/Token"

const Drops = () => {

  return (
    <>
      <Typography variant="h4">Drops</Typography>
      <TokenList
        tokens={[[]}
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
        ...
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

const Extra = useCallback(() => <></>, [])
```

And export the component:

```tsx
export default Drops
```
