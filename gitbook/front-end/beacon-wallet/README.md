---
description: The interface with the Tezos wallet
---

# Beacon wallet

[Beacon](https://docs.walletbeacon.io/) is a Tezos toolkit for wallet pairing. It allows wallet developers to integrate with dApps and dApps developers to give more choices to the user.

In order to implement the connect wallet button, and basic blockchain connectivity, we will start our first provider: `WalletProvider`

Add a `providers` folder in `./components`, and create `./components/providers/WalletProvider.tsx`

The imports that will be required:&#x20;

```tsx
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

```

In all our providers, we will define context props, that will represent the properties that will be made available to children using our context. We will then export a `useContext` shorthand, and the provider itself.&#x20;

Our wallet provider will provide the following:

```tsx
interface WalletContextProps {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  getBalance: () => Promise<void>
  account?: AccountInfo
  wallet?: BeaconWallet
  Tezos?: TezosToolkit
  balance: number
}
```

The properties are self-explanatory:

* `connect` will request a wallet connection using Beacon
* `disconnect` will reset the connection
* `getBalance` will trigger a refresh of the balance (wallet tez balance)
* `account` provides the wallet address, among other things
* `wallet` and `Tezos` are Beacon/Taquito objects that will be used internally to connect the dots

Now that we have the props, let's define our context, with an empty props instance, and prepare the `useContext` shorthand:&#x20;

```tsx
const WalletContext = createContext<WalletContextProps>({
  connect: async () => {},
  disconnect: async () => {},
  getBalance: async () => {},
  balance: 0,
})

const useWalletContext = () => useContext(WalletContext)
```

The fun part, implementing the provider itself: it will be a React component:

```tsx
const WalletProvider = ({ children }: { children: ReactNode }) => {
    ...
}
```

Inside the component, we define the state that will be exposed to the children:&#x20;

```tsx
const [Tezos, setTezos] = useState<TezosToolkit>()
const [wallet, setWallet] = useState<BeaconWallet | undefined>()
const [account, setAccount] = useState<AccountInfo>()
const [balance, setBalance] = useState<number>(0)
```

## Tezos toolkit

In React component lifecycle, to update the state when the component loads or when a dependency is updated, we use an [effect](https://react.dev/learn/synchronizing-with-effects):&#x20;

```tsx
useEffect(() => {
  if (!Tezos) {
    // create Taquito's Tezos toolkit instance and connect it to our RPC
    const Tezos = new TezosToolkit(
      process.env.NEXT_PUBLIC_TEZOS_RPC ?? "http://localhost:20000"
    )
    
    // instantiate the BeaconWallet object
    const beacon = new BeaconWallet({
      name: "TZombies",
      preferredNetwork: (process.env.NEXT_PUBLIC_NETWORK ||
        "ghostnet") as NetworkType,
      colorMode: ColorMode.DARK,
    })
    
    // link the Tezos toolkit with Beacon
    Tezos.setWalletProvider(beacon)
    
    // link the Completium SDK to our toolkit
    set_binder_tezos_toolkit(Tezos)
    
    // a returning user may already have a connected wallet
    beacon.client.getActiveAccount().then(setAccount)
    
    // set the state
    setTezos(Tezos)
    setWallet(beacon)
  }
}, [Tezos])

```

Let's stop here for a moment and analyse what is going on. This is an important part of the Tezos specifics.&#x20;

* First, we create a `TezosToolkit` instance (from taquito). It will connect to the given node RPC&#x20;
* Then we create a `BeaconWallet` instance and we connect them, as per their [documentation](https://tezostaquito.io/)
* We also need to connect the Completium SDK to our `TezosToolkit` instance
* If there is already an account connected (a returning user) then the connection will be restored
* Finally, we set the state of our provider with the account, the toolkit and Beacon&#x20;

Note that this is only done once, after the page has loaded.&#x20;

## Connect/disconnect

We can now implement the `connect` and `disconnect` callbacks:

```tsx
const connect = useCallback(async () => {
  try {
    await wallet?.requestPermissions({
      network: {
        type: (process.env.NEXT_PUBLIC_NETWORK ?? "ghostnet") as NetworkType,
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
```

## Balance update

The following fetches the current account's balance from the Tezos node, and is also triggered when the component loads.&#x20;

```tsx
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
```

## Wrap up

Let's wrap all this state and these methods into a memo that we will pass down to the provider's children:&#x20;

```tsx
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
```

At the end of your file, be sure to append:

```tsx
export { WalletProvider, useWalletContext }
```

That's it for the first provider. We just need to add it to the app hierarchy in `./pages/_app.tsx` such that the `App` function returns:

```tsx
<ThemeProvider theme={theme}>
  <CssBaseline />
  <WalletProvider>
    <NavBar />
    <Container sx={{ mt: 12 }}>
      <Component {...pageProps} />
    </Container>
  </WalletProvider>
</ThemeProvider>
```

This will cause Visual Studio Code to complain that `WalletProvider` is undefined. This is because the file requires the following import:

```tsx
import { WalletProvider } from "../components/providers/WalletProvider"
```

For the remainder of the tutorial, imports for providers and components such as these may be ommitted and it will be left to the reader to include them where necessary.

The context is now usable in any child with:

```tsx
const walletContext = useWalletContext()
```
