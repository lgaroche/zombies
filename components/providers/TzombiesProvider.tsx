import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Tzombies, ledger_key } from "../../contracts/bindings/fa2"
import { useWalletContext } from "./WalletProvider"
import { Address, Nat } from "@completium/archetype-ts-types"
import { type } from "os"

type UserInventory = Map<number, number>
interface TzombiesContextProps {
  fa2?: Tzombies
  inventory: Map<number, number>
  fetchInventory: () => void
  fetchFa2Balance: (address: Address) => Promise<UserInventory>
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  fetchInventory: () => {},
  fetchFa2Balance: async () => new Map(),
})

const useTzombiesContext = () => React.useContext(TzombiesContext)

const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [fa2, setFa2] = useState<Tzombies>()
  const { Tezos, account } = useWalletContext()
  const [registered, setRegistered] = useState<Nat[]>([])
  const [inventory, setInventory] = useState<UserInventory>(new Map())

  const fetchFa2Balance = useCallback<
    (address: Address) => Promise<UserInventory>
  >(
    async (address: Address) => {
      if (!fa2 || registered.length < 1) {
        return new Map()
      }
      const inventory = new Map()
      for (const id of registered) {
        const value = await fa2.get_ledger_value(new ledger_key(address, id))
        inventory.set(id.to_number(), value?.to_number() || 0)
      }
      return inventory
    },
    [fa2, registered]
  )

  const fetchInventory = useCallback(async () => {
    if (!account) {
      setInventory(new Map())
      return
    }
    setInventory(await fetchFa2Balance(new Address(account.address)))
  }, [account, fetchFa2Balance])

  useEffect(() => {
    if (!Tezos) {
      return
    }
    setFa2(new Tzombies(process.env.NEXT_PUBLIC_FA2_ADDRESS))
  }, [Tezos])

  useEffect(() => {
    if (!fa2) {
      return
    }
    fa2.get_registered().then(setRegistered)
  }, [fa2])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const value = useMemo(
    () => ({
      fa2,
      inventory,
      fetchInventory,
      fetchFa2Balance,
    }),
    [fa2, inventory, fetchInventory, fetchFa2Balance]
  )

  return (
    <TzombiesContext.Provider value={value}>
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
export type { UserInventory }
