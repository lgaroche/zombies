import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Market } from "../../contracts/bindings/market"
import { useWalletContext } from "./WalletProvider"
import { UserInventory, useTzombiesContext } from "./TzombiesProvider"
import { Nat, Address, Tez, CallResult } from "@completium/archetype-ts-types"
import {
  add_for_all,
  operator_for_all_key,
  remove_for_all,
} from "../../contracts/bindings/fa2"

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

const MarketProviderContext = React.createContext<MarketProviderContextProps>({
  isApproved: false,
  listings: [],
  approve: async () => {},
  revoke: async () => {},
  list_for_sale: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  remove_listing: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  buy: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  fetchMarketplaceApproval: async () => {},
  fetchListings: async () => {},
})

const useMarketProviderContext = () => React.useContext(MarketProviderContext)

const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { fa2, fetchFa2Balance } = useTzombiesContext()
  const { Tezos, account } = useWalletContext()
  const [market, setMarket] = useState<Market>()
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    if (!Tezos) {
      return
    }
    setMarket(new Market(process.env.NEXT_PUBLIC_MARKET_ADDRESS))
  }, [Tezos])

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

  const fetchListings = useCallback(async () => {
    if (!market || !fa2 || !fa2.address) return
    const nOrders = await market.get_next_order_id()
    const listings: Listing[] = []
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

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  useEffect(() => {
    fetchMarketplaceApproval()
  }, [fetchMarketplaceApproval])

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
        amount: new Tez(listing.parameters.price * amount, "mutez"),
      })
    },
    [market, fa2]
  )

  const value = useMemo(
    () => ({
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
    <MarketProviderContext.Provider value={value}>
      {children}
    </MarketProviderContext.Provider>
  )
}

export { MarketProvider, useMarketProviderContext }
export type { Listing }
