import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Zombie_market, order_key } from "../../contracts/bindings/market"
import { useWalletContext } from "./WalletProvider"
import { UserInventory, useTzombiesContext } from "./TzombiesProvider"
import { Nat, Address, Tez, CallResult } from "@completium/archetype-ts-types"
import {
  add_for_all,
  operator_for_all_key,
  remove_for_all,
} from "../../contracts/bindings/fa2"

interface MarketProviderContextProps {
  market?: Zombie_market
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

const MarketProviderContext = React.createContext<MarketProviderContextProps>({
  isApproved: false,
  sales: [],
  approve: async () => {},
  revoke: async () => {},
  sell: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  cancel: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  buy: async () => {
    throw new Error("MarketProviderContext not initialized")
  },
  fetchMarketplaceApproval: async () => {},
  fetchSales: async () => {},
})

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

const useMarketProviderContext = () => React.useContext(MarketProviderContext)

const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { fa2, fetchFa2Balance } = useTzombiesContext()
  const { Tezos, account } = useWalletContext()
  const [market, setMarket] = useState<Zombie_market>()
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    if (!Tezos) {
      return
    }
    setMarket(new Zombie_market(process.env.NEXT_PUBLIC_MARKET_ADDRESS))
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

  const fetchSales = useCallback(async () => {
    if (!market || !fa2 || !fa2.address) return
    const nOrders = await market.get_next_order_id()
    const sales: Sale[] = []
    const inventories: Map<Address, UserInventory> = new Map()
    for (let i = 1; i < nOrders.to_number(); i++) {
      const key = new order_key(new Address(fa2.address), new Nat(i))
      const order = await market.get_order_value(key)
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

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

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
      return await market.cancel(
        [new Address(fa2.address), new Nat(sale.saleId)],
        {}
      )
    },
    [market, fa2]
  )

  const buy = useCallback(
    async (sale: Sale, amount: number) => {
      if (!market || !fa2 || !fa2.address) return
      return await market.buy(
        [new Address(fa2.address), new Nat(sale.saleId)],
        new Nat(amount),
        {
          amount: new Tez(sale.parameters.price * amount, "mutez"),
        }
      )
    },
    [market, fa2]
  )

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
}

export { MarketProvider, useMarketProviderContext }
export type { Sale }
