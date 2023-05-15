import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Tzombies, ledger_key } from "../contracts/bindings/fa2"
import { useWalletContext } from "./WalletProvider"
import { Address } from "@completium/archetype-ts-types"

interface TzombiesContextProps {
  fa2?: Tzombies
  inventory: Map<number, number>
  fetchInventory: () => void
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  fetchInventory: () => {},
})

const useTzombiesContext = () => React.useContext(TzombiesContext)

const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [fa2, setFa2] = useState<Tzombies>()
  const { Tezos, account } = useWalletContext()
  const [inventory, setInventory] = useState<Map<number, number>>(new Map())

  const fetchInventory = useCallback(async () => {
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
  }, [fa2, account])

  useEffect(() => {
    if (!Tezos) {
      return
    }
    setFa2(new Tzombies(process.env.NEXT_PUBLIC_FA2_ADDRESS))
  }, [Tezos])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const value = useMemo(
    () => ({
      fa2,
      inventory,
      fetchInventory,
    }),
    [fa2, inventory, fetchInventory]
  )

  return (
    <TzombiesContext.Provider value={value}>
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
