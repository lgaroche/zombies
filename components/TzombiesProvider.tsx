import React, { useCallback, useEffect, useState } from "react"
import { Tzombies, ledger_key } from "../contracts/fa2"
import { useWalletContext } from "./WalletProvider"
import { Address } from "@completium/archetype-ts-types"

interface TzombiesContextProps {
  contract?: Tzombies
  inventory: Map<number, number>
  fetchInventory: () => void
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  fetchInventory: () => {},
})

const useTzombiesContext = () => React.useContext(TzombiesContext)

const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [contract, setContract] = useState<Tzombies>()
  const { Tezos, account } = useWalletContext()
  const [inventory, setInventory] = useState<Map<number, number>>(new Map())

  const fetchInventory = useCallback(() => {
    const query = async () => {
      if (!contract || !account) {
        return
      }

      const registered = await contract.get_registered()

      const inventory = new Map<number, number>()
      for (const id of registered) {
        const value = await contract.get_ledger_value(
          new ledger_key(new Address(account.address), id)
        )
        inventory.set(id.to_number(), value?.to_number() || 0)
      }

      console.log("inventory", inventory)
      setInventory(inventory)
    }
    query()
  }, [contract, account])

  useEffect(() => {
    if (!Tezos) {
      return
    }

    if (!contract) {
      setContract(new Tzombies(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS))
    } else {
      fetchInventory()
    }
  }, [contract, Tezos, fetchInventory])

  return (
    <TzombiesContext.Provider value={{ contract, inventory, fetchInventory }}>
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
