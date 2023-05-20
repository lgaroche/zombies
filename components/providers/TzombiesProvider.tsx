import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Tzombies,
  ledger_key,
  transfer_destination,
  transfer_param,
} from "../../contracts/bindings/fa2"
import { useWalletContext } from "./WalletProvider"
import { Address, CallResult, Nat } from "@completium/archetype-ts-types"

type UserInventory = Map<number, number>

interface TransferParameters {
  to: string
  tokenId: number
  amount: number
}
interface TzombiesContextProps {
  fa2?: Tzombies
  inventory: Map<number, number>
  transfer: (params: TransferParameters) => Promise<CallResult | undefined>
  fetchInventory: () => void
  fetchFa2Balance: (address: Address) => Promise<UserInventory>
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  transfer: async () => {
    throw new Error("TzombiesContext not initialized")
  },
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

  const transfer = useCallback(
    async (params: TransferParameters) => {
      if (!fa2 || !account) {
        return
      }
      const dest = new transfer_destination(
        new Address(params.to),
        new Nat(params.tokenId),
        new Nat(params.amount)
      )
      const args = new transfer_param(new Address(account.address), [dest])
      return await fa2.transfer([args], {})
    },
    [account, fa2]
  )

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
      transfer,
      fetchInventory,
      fetchFa2Balance,
    }),
    [fa2, inventory, transfer, fetchInventory, fetchFa2Balance]
  )

  return (
    <TzombiesContext.Provider value={value}>
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
export type { UserInventory }
