import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Tzombies,
  ledger_key,
  transfer_destination,
  transfer_param,
} from "../../contracts/bindings/fa2"
import { useWalletContext } from "./WalletProvider"
import { Address, CallResult, Nat } from "@completium/archetype-ts-types"
import { ZombieMetadata, useMetadataContext } from "./MetadataProvider"

type UserInventory = Map<number, number>

interface TransferParameters {
  to: string
  tokenId: number
  amount: number
}
interface TzombiesContextProps {
  fa2?: Tzombies
  tokenInfo: Map<number, ZombieMetadata>
  inventory: UserInventory
  transfer: (params: TransferParameters) => Promise<CallResult | undefined>
  freeClaim: (id: number) => Promise<CallResult | undefined>
  fetchInventory: () => void
  fetchFa2Balance: (address: Address) => Promise<UserInventory>
}

const TzombiesContext = React.createContext<TzombiesContextProps>({
  inventory: new Map(),
  tokenInfo: new Map(),
  transfer: async () => {
    throw new Error("TzombiesContext not initialized")
  },
  fetchInventory: () => {},
  fetchFa2Balance: async () => new Map(),
  freeClaim: function (id: number): Promise<CallResult | undefined> {
    throw new Error("Function not implemented.")
  },
})

const useTzombiesContext = () => React.useContext(TzombiesContext)

const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetchMetadata } = useMetadataContext()
  const { Tezos, account, getBalance } = useWalletContext()

  const [fa2, setFa2] = useState<Tzombies>()
  const [registeredTokenInfo, setRegisteredTokenInfo] = useState<
    Map<number, ZombieMetadata>
  >(new Map())
  const [inventory, setInventory] = useState<UserInventory>(new Map())

  const fetchFa2Balance = useCallback(
    async (address: Address) => {
      if (!fa2 || registeredTokenInfo.size < 1) {
        return new Map()
      }
      const inventory = new Map()
      for (const [id, _] of registeredTokenInfo) {
        try {
          const value = await fa2.get_ledger_value(
            new ledger_key(address, new Nat(id))
          )
          inventory.set(id, value?.to_number() ?? 0)
        } catch (e) {
          console.error(e)
        }
      }
      return inventory
    },
    [fa2, registeredTokenInfo]
  )

  const fetchInventory = useCallback(async () => {
    if (!account) {
      setInventory(new Map())
      return
    }
    setInventory(await fetchFa2Balance(new Address(account.address)))
    getBalance()
  }, [account, fetchFa2Balance, getBalance])

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

  const freeClaim = useCallback(
    async (id: number) => {
      if (!fa2 || !account || !account.address) {
        return
      }
      return await fa2.mint(
        new Address(account.address),
        new Nat(id),
        new Nat(1),
        {}
      )
    },
    [fa2, account]
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
    const fetchRegisteredTokens = async () => {
      const tokenInfo = new Map()
      for (const id of [1, 2]) {
        try {
          const value = await fa2.get_token_metadata_value(new Nat(id))
          const b = value?.token_info.find((info) => info[0] === "")
          if (!b || b.length < 2) continue
          const info = b[1].hex_decode()
          const metadata = await fetchMetadata(info)
          tokenInfo.set(id, metadata)
        } catch (e) {
          console.error(e)
          continue
        }
      }
      console.log(tokenInfo)
      setRegisteredTokenInfo(tokenInfo)
    }
    fetchRegisteredTokens()
  }, [fa2, fetchMetadata])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const value = useMemo(
    () => ({
      fa2,
      inventory,
      tokenInfo: registeredTokenInfo,
      transfer,
      freeClaim,
      fetchInventory,
      fetchFa2Balance,
    }),
    [
      fa2,
      inventory,
      registeredTokenInfo,
      transfer,
      freeClaim,
      fetchInventory,
      fetchFa2Balance,
    ]
  )

  return (
    <TzombiesContext.Provider value={value}>
      {children}
    </TzombiesContext.Provider>
  )
}

export { TzombiesProvider, useTzombiesContext }
export type { UserInventory }
