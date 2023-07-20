---
description: Go fetch these evil creatures
---

# Zombies provider

The Zombies provider will interact with the smart contract using completium's generated bindings. You can generate these bindings with the following command:

```bash
npx completium-cli generate binding-dapp-ts * --input-path ./contracts --output-path ./contracts/bindings
```

This command writes all the contracts bindings in `./contracts/bindings` so we can easily interact with our contracts.&#x20;

{% hint style="warning" %}
Notice the difference between the command above and the `generate binding-ts` command that we used [previously](../../smart-contracts/better-testing.md).&#x20;

* `binding-ts` generates bindings that are meant to be used in a Node environments wich access to files
* `binding-dapp-ts` generates bindings that can be used in a browser environment

See more details in the [completium documentation](https://archetype-lang.org/docs/tests/framework#completium-packages).
{% endhint %}

## Provider base

Create `./components/providers/TzombiesProvider.tsx`

The imports:&#x20;

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Tzombies,
  ledger_key,
  transfer_destination,
  transfer_param,
} from '../../contracts/bindings/tzombies'
import { useWalletContext } from './WalletProvider'
import { Address, CallResult, Nat } from '@completium/archetype-ts-types'
import { ZombieMetadata, useMetadataContext } from './MetadataProvider'
```

For this provider, we'll expose the contract itself, as well as some methods and contract state:&#x20;

```tsx
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
```

* `UserInventory` is a mapping of each token id and the amount owned in the user's wallet.
* `tokenInfo` is a mapping between the token id and the associated metadata.
* `transfer` is the simple FA2 transfer function
* `freeClaim` is the free mint function
* `fetchInventory` and `fetchBalance` is used to read and update the state from the contract

We need the empty context:&#x20;

```tsx
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
```

Now let's dig into the implementation. First, the contexts and state: &#x20;

```tsx
const TzombiesProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetchMetadata } = useMetadataContext()
  const { Tezos, account, getBalance } = useWalletContext()

  const [fa2, setFa2] = useState<Tzombies>()
  const [registeredTokenInfo, setRegisteredTokenInfo] = useState<
    Map<number, ZombieMetadata>
  >(new Map())
  const [inventory, setInventory] = useState<UserInventory>(new Map())
  
  ...
}
```

The `fa2` state is loaded as soon as the `TezosToolkit` becomes available:&#x20;

```tsx
useEffect(() => {
  if (!Tezos) {
    return
  }
  setFa2(new Tzombies(process.env.NEXT_PUBLIC_FA2_ADDRESS))
}, [Tezos])
```

## Fetch registered tokens

Then, the provider needs to check which tokens are registered, and get its corresponding metadata, in order to populate `registeredTokenInfo`.&#x20;

{% hint style="info" %}
This is the best place to show that an indexer service is all but mandatory in some cases. Since there is no contract enumeration on big maps, there is no way to know which token ids are registered, unless either

1. an array is kept on the contract (increasing storage usage at token registration) _or_
2. an indexer keeps track of the registered token ids

Since these two options are not available, we'll hard-code the number of tokens in our client dapp. We assume that we know in advance the tokens that will be registered
{% endhint %}

```tsx
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
```

Explanation: for token ids 1 and 2, we try to get the big map value, that is a map of an empty string to a byte-encoded string of the IPFS URI. We pass it to the `MetadataProvider` to translate it to zombie metadata

## Fetch inventory

This method iterates over each registered token, to fetch the user's balance. Another example of a concept that can be greatly optimised.&#x20;

```tsx
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

useEffect(() => {
  fetchInventory()
}, [fetchInventory])
```

## Mint (claim)

The following exposes the `mint` entrypoint (and mints a single token)

```tsx
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
```

## Transfer

The transfer entrypoint requires FA2 specific parameters, that have been remapped to a friendlier structure `TransferParameters`.

```tsx
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
```

## Wrap up

The props are now memoised and passed to the children:&#x20;

```tsx
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
```

Don't forget to export the component.

```tsx
export { TzombiesProvider, useTzombiesContext }
export type { UserInventory }
```

Include `<TzombiesProvider>` in the app hierarchy. This provider accesses the Metadata and Wallet context, so be sure to places it below these two providers in the hierarchy.&#x20;
