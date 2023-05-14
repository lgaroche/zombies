import React, { useCallback, useEffect, useState } from "react"
import {
  Tzombies,
  ledger_key,
  operator_for_all_key,
} from "../contracts/bindings/fa2"
import { Zombie_market } from "../contracts/bindings/market"
import { useWalletContext } from "./WalletProvider"
import { Address } from "@completium/archetype-ts-types"

interface TzombiesContextProps {
  fa2?: Tzombies
  market?: Zombie_market
  inventory: Map<number, number>
  isApproved: boolean
  fetchInventory: () => void
  fetchApproval: () => void
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  isApproved: false,
  fetchInventory: () => {},
  fetchApproval: () => {},
})

const useTzombiesContext = () => React.useContext(TzombiesContext)

const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [fa2, setFa2] = useState<Tzombies>()
  const [market, setMarket] = useState<Zombie_market>()
  const { Tezos, account } = useWalletContext()
  const [inventory, setInventory] = useState<Map<number, number>>(new Map())
  const [isApproved, setIsApproved] = useState<boolean>(false)

  const fetchInventory = useCallback(() => {
    const fetchInner = async () => {
      if (!fa2 || !account) {
        setInventory(new Map())
        return
      }

      const registered = await fa2.get_registered()

      const inventory = new Map<number, number>()
      for (const id of registered) {
        const value = await fa2.get_ledger_value(
          new ledger_key(new Address(account.address), id)
        )
        inventory.set(id.to_number(), value?.to_number() || 0)
      }

      console.log("inventory", inventory)
      setInventory(inventory)
    }
    fetchInner()
  }, [fa2, account])

  const fetchApproval = useCallback(() => {
    const fetchInner = async () => {
      if (!market || !account || !fa2 || !market.address) {
        setIsApproved(false)
        return
      }
      const arg = new operator_for_all_key(
        new Address(market.address),
        new Address(account.address)
      )
      const approved = await fa2.get_operator_for_all_value(arg)
      setIsApproved(!!approved)
    }
    fetchInner()
  }, [account, fa2, market])

  useEffect(() => {
    if (!Tezos) {
      return
    }

    if (!fa2) {
      setFa2(new Tzombies(process.env.NEXT_PUBLIC_FA2_ADDRESS))
    }

    if (!market) {
      setMarket(new Zombie_market(process.env.NEXT_PUBLIC_MARKET_ADDRESS))
    }
  }, [fa2, market, Tezos])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    fetchApproval()
  }, [fetchApproval])

  return (
    <TzombiesContext.Provider
      value={{
        fa2,
        inventory,
        market,
        isApproved,
        fetchInventory,
        fetchApproval,
      }}
    >
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
