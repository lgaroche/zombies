# Marketplace provider

The `MarketProvider` follows the same principles as the `TzombiesProvider`. This page will cover only the specifics for this provider. If you would like to view the full code, it is available on the [repository](https://github.com/lgaroche/zombies/blob/main/components/providers/MarketProvider.tsx).

## Provider base

The props:&#x20;

```tsx
interface ListingParameters {
  tokenId: number
  amount: number
  price: number
  expiry: Date
}

interface Listing {
  saleId: number
  seller: Address
  parameters: ListingParameters
}

interface MarketProviderContextProps {
  market?: Market
  isApproved: boolean
  listings: Listing[]
  approve: () => Promise<void>
  revoke: () => Promise<void>
  list_for_sale: (params: ListingParameters) => Promise<CallResult | undefined>
  remove_listing: (listing: Listing) => Promise<CallResult | undefined>
  buy: (listing: Listing, amount: number) => Promise<CallResult | undefined>
  fetchMarketplaceApproval: () => Promise<void>
  fetchListings: () => Promise<void>
}
```

* `market` is the marketplace contract instance
* `isApproved` and sales is the provider's state
* `approve`, `revoke` control the marketplace operator status for the connected wallet
* `list_for_sale`, remove\_listing and `buy` are the contract entry points
* `fetchMarketplaceApproval` and fetchListings update the state

As for the FA2 contract provider, we initialize it at load:&#x20;

```tsx
useEffect(() => {
  if (!Tezos) {
    return
  }
  setMarket(new Market(process.env.NEXT_PUBLIC_MARKET_ADDRESS))
}, [Tezos])
```

## Fetch approval

This one is a simple contract read.&#x20;

```tsx
const fetchMarketplaceApproval = useCallback(async () => {
  if (!account || !fa2) {
    setIsApproved(false)
    return
  }
  const arg = new operator_for_all_key(
    new Address(process.env.NEXT_PUBLIC_MARKET_ADDRESS!),
    new Address(account.address)
  )
  const approved = await fa2.get_operator_for_all_value(arg)
  setIsApproved(!!approved)
}, [account, fa2])
```

## Fetch sales

This one is a bit more tricky. If you [remember](../../smart-contracts/marketplace-contract/), the marketplace contract does not (and cannot) check all aspects of valid orders, as it is loosely coupled with the token contract. We need to filter out empty or expired orders.&#x20;

We have a counter: `next_order_id.` We'll use it to iterate over the orders.&#x20;

<pre class="language-tsx"><code class="lang-tsx">const fetchListings = useCallback(async () => {
<strong>  if (!market || !fa2 || !fa2.address) return
</strong>  const nOrders = await market.get_next_order_id()
  const listings: Listing[] = []
  const inventories: Map&#x3C;Address, UserInventory> = new Map()
  for (let i = 1; i &#x3C; nOrders.to_number(); i++) {
    const order = await market.get_order_value(new Nat(i))
    if (!order) continue
  
    // filter out expired orders
    if (new Date(order.expiry) &#x3C; new Date()) continue
  
    // check how many tokens the seller still has
    if (!inventories.has(order.seller)) {
      inventories.set(order.seller, await fetchFa2Balance(order.seller))
    }
    const amount = inventories
      .get(order.seller)
      ?.get(order.token_id.to_number())
    const qty = Math.min(order.amount.to_number(), amount ?? 0)
    if (qty &#x3C; 1) continue
  
    listings.push({
      saleId: i,
      seller: order.seller,
      parameters: {
        tokenId: order.token_id.to_number(),
        amount: qty,
        price: order.price.to_big_number().toNumber(),
        expiry: order.expiry,
      },
    })
  }
  setListings(listings)
}, [fa2, fetchFa2Balance, market])
</code></pre>

## Fetch on load

As usual, we fetch the state on component load:&#x20;

```tsx
useEffect(() => {
  fetchListings()
}, [fetchListings])

useEffect(() => {
  fetchMarketplaceApproval()
}, [fetchMarketplaceApproval])
```

## Entry points

Each entrypoint is called using the generated bindings.

### approve / revoke

```tsx
const approve = useCallback(async () => {
  if (!fa2 || !market) return
  const arg = new add_for_all(new Address(market.address!))
  await fa2.update_operators_for_all([arg], {})
}, [fa2, market])

const revoke = useCallback(async () => {
  if (!fa2 || !market) return
  const arg = new remove_for_all(new Address(market.address!))
  await fa2.update_operators_for_all([arg], {})
}, [fa2, market])
```

### list\_for\_sale / remove\_listing / buy

```tsx
const list_for_sale = useCallback<
  (params: ListingParameters) => Promise<CallResult | undefined>
>(
  async ({ tokenId, amount, price, expiry }: ListingParameters) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.list_for_sale(
      new Address(fa2.address),
      new Nat(tokenId),
      new Nat(amount),
      new Tez(price),
      expiry,
      {}
    )
  },
  [market, fa2]
)

const remove_listing = useCallback(
  async (listing: Listing) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.remove_listing(new Nat(listing.saleId), {})
  },
  [market, fa2]
)

const buy = useCallback(
  async (listing: Listing, amount: number) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.buy(new Nat(listing.saleId), new Nat(amount), {
      amount: new Tez(listing.parameters.price * amount, 'mutez'),
    })
  },
  [market, fa2]
)
```

## Wrap up

Memoise the value and pass it to the children:&#x20;

<pre class="language-tsx"><code class="lang-tsx"><strong>const value = useMemo(
</strong>  () => ({
    market,
    isApproved,
    listings,
    approve,
    revoke,
    list_for_sale,
    remove_listing,
    buy,
    fetchMarketplaceApproval,
    fetchListings,
  }),
  [
    market,
    isApproved,
    listings,
    approve,
    revoke,
    list_for_sale,
    remove_listing,
    buy,
    fetchMarketplaceApproval,
    fetchListings,
  ]
)

return (
  &#x3C;MarketProviderContext.Provider value={value}>
    {children}
  &#x3C;/MarketProviderContext.Provider>
)
</code></pre>

## Export

Export the component.

<pre class="language-tsx"><code class="lang-tsx"><strong>export { MarketProvider, useMarketProviderContext }
</strong>export type { Listing }
</code></pre>

Include the provider in the App hierarchy, with access to the wallet and Tzombies contexts.
