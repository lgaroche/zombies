# Market page

Now that we have the `BuyDialog`, we can include it in the market page.&#x20;

Create `./pages/market.tsx` exporting a `Market` component.&#x20;

It will load all active listings from the corresponding context, and display them in a table.&#x20;

The states and contexts:

```tsx
const { account } = useWalletContext()
  const {
    isApproved,
    listings,
    approve,
    revoke,
    remove_listing,
    fetchMarketplaceApproval,
    fetchListings,
  } = useMarketProviderContext()
  const { tokenInfo } = useTzombiesContext()
  const { ipfsUriToGateway } = useMetadataContext()

  const [buySale, setBuySale] = useState<Listing>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()
```

There are callbacks for `approve`, `revoke`, `buy` and `remove_listing`. They all call their respective context methods, and are wrapped into error handling syntax.&#x20;

```tsx
  const handleApprove = useCallback(async () => {
    try {
      setLoading(true)
      await approve()
      await fetchMarketplaceApproval()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [approve, fetchMarketplaceApproval])

  const handleRevoke = useCallback(async () => {
    setLoading(true)
    try {
      await revoke()
      await fetchMarketplaceApproval()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [revoke, fetchMarketplaceApproval])

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await fetchMarketplaceApproval()
      await fetchListings()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [fetchMarketplaceApproval, fetchListings])

  const handleCancel = useCallback(
    async (listing: Listing) => {
      setLoading(true)
      try {
        await remove_listing(listing)
        await fetchListings()
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? JSON.stringify(e))
      } finally {
        setLoading(false)
      }
    },
    [remove_listing, fetchListings]
  )
```

The actual Market component render:&#x20;

```tsx
return (
    <>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={'error'}>Error: {error}</Alert>
      </Snackbar>

      <Typography variant="h4">Marketplace</Typography>
      <Button onClick={handleRefresh}>Refresh</Button>
      {isApproved ? (
        <>
          <p>
            ✅ The marketplace contract is an approved operator for all your
            tokens
          </p>
          <Button disabled={!account} variant="outlined" onClick={handleRevoke}>
            Revoke
          </Button>
        </>
      ) : (
        <>
          <p>ℹ️ The marketplace contract needs to be an approved operator</p>
          <Button
            disabled={!account || loading}
            variant="contained"
            onClick={handleApprove}
          >
            Approve marketplace
          </Button>
        </>
      )}

      <BuyDialog
        onClose={() => {
          setBuySale(undefined)
          handleRefresh()
        }}
        listing={buySale}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Price</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              Seller
            </TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.saleId}>
              <TableCell>
                <Image
                  src={ipfsUriToGateway(
                    tokenInfo.get(listing.parameters.tokenId)?.thumbnailUri ??
                      ''
                  )}
                  alt={tokenInfo.get(listing.parameters.tokenId)?.name ?? ''}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{listing.parameters.amount}</TableCell>
              <TableCell>{listing.parameters.price / 1_000_000} ꜩ</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {listing.seller.toString() === account?.address
                  ? 'you'
                  : listing.seller.toString()}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(listing.parameters.expiry).toRelative()}
              </TableCell>
              <TableCell>
                {listing.seller.toString() !== account?.address ? (
                  <Button
                    variant="outlined"
                    onClick={() => setBuySale(listing)}
                    disabled={loading}
                  >
                    Buy
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    onClick={() => handleCancel(listing)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
```

