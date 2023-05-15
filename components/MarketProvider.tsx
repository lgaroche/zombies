import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Zombie_market } from "../contracts/bindings/market"
import { useWalletContext } from "./WalletProvider"
import { useTzombiesContext } from "./TzombiesProvider"
import { Address } from "@completium/archetype-ts-types"
import {
  add_for_all,
  operator_for_all_key,
  remove_for_all,
} from "../contracts/bindings/fa2"

interface MarketProviderContextProps {
  market?: Zombie_market
  isApproved: boolean
  approve: () => Promise<void>
  revoke: () => Promise<void>
  fetchMarketplaceApproval: () => Promise<void>
}

const MarketProviderContext = React.createContext<MarketProviderContextProps>({
  isApproved: false,
  approve: async () => {},
  revoke: async () => {},
  fetchMarketplaceApproval: async () => {},
})

const useMarketProviderContext = () => React.useContext(MarketProviderContext)

const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { fa2 } = useTzombiesContext()
  const { Tezos, account } = useWalletContext()
  const [market, setMarket] = useState<Zombie_market>()
  const [isApproved, setIsApproved] = useState<boolean>(false)

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

  const value = useMemo(
    () => ({
      market,
      isApproved,
      approve,
      revoke,
      fetchMarketplaceApproval,
    }),
    [market, isApproved, approve, revoke, fetchMarketplaceApproval]
  )

  return (
    <MarketProviderContext.Provider value={value}>
      {children}
    </MarketProviderContext.Provider>
  )
}

export { MarketProvider, useMarketProviderContext }
