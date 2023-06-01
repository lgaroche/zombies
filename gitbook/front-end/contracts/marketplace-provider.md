# Marketplace provider

The `MarketProvider` follows the same principles as the `TzombiesProvider`. This page will go over the specifics only for this provider.

## Provider base

The props:&#x20;

```tsx
interface SellParameters {
  tokenId: number
  amount: number
  price: number
  expiry: Date
}

interface Sale {
  saleId: number
  seller: Address
  parameters: SellParameters
}

interface MarketProviderContextProps {
  market?: Market
  isApproved: boolean
  sales: Sale[]
  approve: () => Promise<void>
  revoke: () => Promise<void>
  sell: (params: SellParameters) => Promise<CallResult | undefined>
  cancel: (sale: Sale) => Promise<CallResult | undefined>
  buy: (sale: Sale, amount: number) => Promise<CallResult | undefined>
  fetchMarketplaceApproval: () => Promise<void>
  fetchSales: () => Promise<void>
}
```

* `market` is the marketplace contract instance
* `isApproved` and sales is the provider's state
* `approve`, `revoke` control the marketplace operator status for the connected wallet
* `sell`, `cancel` and `buy` are the contract entry points
* `fetchMarketplaceApproval` and `fetchSales` update the state

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

This one is a bit more tricky. If you remember, the marketplace contract does not (and cannot) check all aspects of valid orders. We need to filter out empty or expired orders.&#x20;

We have a counter: `next_order_id`, we'll use it to iterate over the orders.&#x20;

```tsx
const fetchSales = useCallback(async () => {
  if (!market || !fa2 || !fa2.address) return
  const nOrders = await market.get_next_order_id()
  const sales: Sale[] = []
  const inventories: Map<Address, UserInventory> = new Map()
  for (let i = 1; i < nOrders.to_number(); i++) {
    const order = await market.get_order_value(new Nat(i))
    if (!order) continue

    // filter out expired orders
    if (new Date(order.expiry) < new Date()) continue

    // check how many tokens the seller still has
    if (!inventories.has(order.seller)) {
      inventories.set(order.seller, await fetchFa2Balance(order.seller))
    }
    const amount = inventories
      .get(order.seller)
      ?.get(order.token_id.to_number())
    const qty = Math.min(order.amount.to_number(), amount ?? 0)
    if (qty < 1) continue

    sales.push({
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
  setSales(sales)
}, [fa2, fetchFa2Balance, market])
```

## Fetch on load

As usual, we fetch the state on component load:&#x20;

```tsx
useEffect(() => {
  fetchSales()
}, [fetchSales])

useEffect(() => {
  fetchMarketplaceApproval()
}, [fetchMarketplaceApproval])
```

## Entry points

Each entrypoint is called using the generated bindings.

### Approve / Revoke

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

### Sell / Cancel / Buy

```tsx
const sell = useCallback<
  (params: SellParameters) => Promise<CallResult | undefined>
>(
  async ({ tokenId, amount, price, expiry }: SellParameters) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.sell(
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

const cancel = useCallback(
  async (sale: Sale) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.cancel(new Nat(sale.saleId), {})
  },
  [market, fa2]
)

const buy = useCallback(
  async (sale: Sale, amount: number) => {
    if (!market || !fa2 || !fa2.address) return
    return await market.buy(new Nat(sale.saleId), new Nat(amount), {
      amount: new Tez(sale.parameters.price * amount, "mutez"),
    })
  },
  [market, fa2]
)
```

## Wrap up

Memoise the value and pass it to the children:&#x20;

```tsx
const value = useMemo(
  () => ({
    market,
    isApproved,
    sales,
    approve,
    revoke,
    sell,
    cancel,
    buy,
    fetchMarketplaceApproval,
    fetchSales,
  }),
  [
    market,
    isApproved,
    sales,
    approve,
    revoke,
    sell,
    cancel,
    buy,
    fetchMarketplaceApproval,
    fetchSales,
  ]
)

return (
  <MarketProviderContext.Provider value={value}>
    {children}
  </MarketProviderContext.Provider>
)
```

## Export

Export the component, and incude it in the App hierarchy.

```tsx
export { MarketProvider, useMarketProviderContext }
export type { Sale }
```
