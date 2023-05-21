import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AccountInfo, NetworkType, ColorMode } from "@airgap/beacon-types"
import { TezosToolkit } from "@taquito/taquito"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { set_binder_tezos_toolkit } from "@completium/dapp-ts"

interface WalletContextProps {
  connect: () => void
  disconnect: () => void
  getBalance: () => void
  account?: AccountInfo
  wallet?: BeaconWallet
  Tezos?: TezosToolkit
  balance: number
}

const WalletContext = createContext<WalletContextProps>({
  connect: () => {},
  disconnect: () => {},
  getBalance: () => {},
  balance: 0,
})

const useWalletContext = () => useContext(WalletContext)

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [Tezos, setTezos] = useState<TezosToolkit>()
  const [wallet, setWallet] = useState<BeaconWallet | undefined>()
  const [account, setAccount] = useState<AccountInfo>()
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    console.log("account", account)
  }, [account])

  useEffect(() => {
    if (!Tezos) {
      const Tezos = new TezosToolkit(
        process.env.NEXT_PUBLIC_TEZOS_RPC || "http://localhost:8732"
      )
      const beacon = new BeaconWallet({
        name: "TZombies",
        preferredNetwork: (process.env.NEXT_PUBLIC_NETWORK ||
          "ghostnet") as NetworkType,
        colorMode: ColorMode.DARK,
      })
      Tezos.setWalletProvider(beacon)
      set_binder_tezos_toolkit(Tezos)
      beacon.client.getActiveAccount().then(setAccount)
      setTezos(Tezos)
      setWallet(beacon)
    }
  }, [Tezos])

  const connect = useCallback(async () => {
    try {
      await wallet?.requestPermissions({
        network: {
          type: (process.env.NEXT_PUBLIC_NETWORK || "ghostnet") as NetworkType,
          rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC,
        },
      })
      const active = await wallet?.client.getActiveAccount()
      console.log(active)
      setAccount(active)
    } catch (e) {
      console.error(e)
    }
  }, [wallet])

  const disconnect = useCallback(async () => {
    await wallet?.clearActiveAccount()
    await wallet?.disconnect()
    setAccount(undefined)
    setBalance(0)
  }, [wallet])

  const getBalance = useCallback(async () => {
    if (!Tezos || !account) {
      return
    }
    const balance = await Tezos.tz.getBalance(account.address)
    setBalance(balance.dividedBy(1_000_000).toNumber())
  }, [Tezos, account])

  useEffect(() => {
    getBalance()
  }, [getBalance])

  const value: WalletContextProps = useMemo(
    () => ({
      connect,
      disconnect,
      getBalance,
      account,
      wallet,
      Tezos,
      balance,
    }),
    [connect, disconnect, getBalance, account, wallet, Tezos, balance]
  )

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export { WalletProvider, useWalletContext }
