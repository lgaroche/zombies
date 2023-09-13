# 💳 Buy with credit card

A credit card payment option facilitates easy onboarding for users who are new to Tezos.

Several crypto "on-ramping" solutions exist. These services allow users to "top-up" their wallet with fungible crypto-currencies on various networks, with a simple credit card payment and little-to-no KYC requirements. Some of the best known providers include:

* Moonpay
* Ramp.network
* Wert
* Transak

Some of these allow a "Direct-to-NFT" shortcut where the user can purchase an NFT directly with their credit card, allowing for a 'Web2-like' experience.&#x20;

Wert supports smart contract interactions on Tezos. This means that a developer can provide smart contract input to a payable entrypoint that will be executed by Wert upon user payment. Let's see how that can fit into our dApp.&#x20;

We'll implement Wert for the Tzombie token (id 1). Clicking on this token on the drops page will popup a Wert payment form, and the token will be delivered when a fiat payment equivelant to 2ꜩ succeeds.

## Requirements

Before setting up an integration, developers must agree on a partnership with Wert. A development environment can be set up by submitting a ticket on their Discord server. See their [docs](https://wert.io/for-nft) for more information.&#x20;

{% hint style="info" %}
Note that the Wert integration only works on live networks (`ghostnet` and `mainnet`) and cannot be tested on the sandbox. You may wish to move your project to the ghostnet for the remainder of the tutorial. To do this:

* Swap to your preferred ghostnet using `ccli switch endpoint`
* Run `ccli set account alice`
* Redeploy your contracts and register your NFTs on the new contracts by following the instructions from the [repo README](https://github.com/lgaroche/zombies/tree/main#deploy-contracts).
* Update your .env.local file in line with the instructions in the [Environment Variables section](../architecture.md#environment-variables)
{% endhint %}

## Implementation

### Provider

We'll create another provider for this use-case. Create a provider in `./components/providers/WertProvider.tsx` and add the following imports:

```tsx
import { ReactNode, createContext, useCallback, useContext } from "react"
import WertWidget from "@wert-io/widget-initializer"
import { signSmartContractData } from "@wert-io/widget-sc-signer"
import { useTzombiesContext } from "./TzombiesProvider"
import { useWalletContext } from "./WalletProvider"
import { useMetadataContext } from "./MetadataProvider"
```

It exposes a simple `checkout` method:&#x20;

```tsx
interface WertContextProps {
  checkout: (id: number) => Promise<void>
}

const WertContext = createContext<WertContextProps>({
  checkout: async () => {},
})

const WertProvider = ({ children }: { children: ReactNode }) => {
  const { tokenInfo, fa2 } = useTzombiesContext()
  const { ipfsUriToGateway } = useMetadataContext()
  const { Tezos, account } = useWalletContext()
  
  // checkout callback goes here (see below)


  return (
    <WertContext.Provider value={{ checkout }}>{children}</WertContext.Provider>
  )
}

const useWertContext = () => useContext(WertContext)
```

The `checkout` method is where the initialization and mounting of the Wert widget will happen. We will prepare and sign data to send to the Wert SDK, according to the token information we want to purchase.&#x20;

{% hint style="info" %}
Note here how we're using `taquito` directly, instead of using Completium bindings. This allows us to get the special JSON as hex-string parameters that is required for signature by the Wert SDK.
{% endhint %}

{% hint style="info" %}
We've hard-coded all values here for simplicity (`commodity_value`, `public key`, `partner id`...) Typically, these would instead be dynamically fetched or set by configuration
{% endhint %}

```tsx
cvonst checkout = useCallback(
    async (id: number) => {
      if (!Tezos || !fa2 || !fa2.address || !account) return

      const contract = await Tezos.contract.at(fa2.address)
      const txParams = contract.methods
        .mint(account.address, id, 1)
        .toTransferParams({ amount: 1 })
      const michelson = JSON.stringify(txParams?.parameter)
      console.log(michelson)
      const sc_input_data = '0x' + Buffer.from(michelson).toString('hex')
      console.log(sc_input_data)

      const signedData = signSmartContractData(
        {
          address: account.address,
          commodity: 'XTZ',
          commodity_amount: 2,
          sc_address: fa2.address,
          sc_input_data,
          network: 'ghostnet',
        },
        '0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3'
      )
      const options = {
        partner_id: '01H0SP3RFRFZPH7H4NAJM4HZ39',
        origin: 'https://sandbox.wert.io',
        theme: 'dark',
        container_id: 'wert-module',
        extra: {
          item_info: {
            author_image_url: '',
            author: 'TZombies',
            image_url: ipfsUriToGateway(tokenInfo.get(id)?.displayUri ?? ''),
            seller: 'TZombies',
          },
        },
      }
      const wertWidget = new WertWidget({
        ...signedData,
        ...options,
      })

      wertWidget.mount()
    },
    [Tezos, account, fa2, ipfsUriToGateway, tokenInfo]
  )
```

Don't forget exports:

```tsx
export { WertProvider, useWertContext }
```

We can now implement the purchase button on our `drops` page:&#x20;

```tsx
const { checkout } = useWertContext()

  const handlePurchase = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        await checkout(id)
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? JSON.stringify(e))
      } finally {
        setLoading(false)
      }
    },
    [checkout]
  )

  const ClaimButton = useCallback(
    (id: number) => (
      <>
        {id === 1 ? (
          <Button
            disabled={loading}
            onClick={() => handlePurchase(id)}
            startIcon={<AddShoppingCartIcon />}
          >
            {loading ? 'In progress...' : 'Buy for 2ꜩ'}
          </Button>
        ) : (
          <Button
            disabled={loading}
            onClick={() => handleClaim(id)}
            startIcon={<RedeemIcon />}
          >
            {loading ? 'In progress...' : 'Claim for free'}
          </Button>
        )}
      </>
    ),
    [handleClaim, handlePurchase, loading]
  )
```

{% hint style="info" %}
Don't forget to include `<WertProvider>` in the app hierarchy!
{% endhint %}

### Test

In order to test the Wert widget, you can use the following information:

| Phone | +33123456789 |   |
| ----- | ------------ | - |
| Code  | 0000         |   |
| CVV   | 200          |   |
