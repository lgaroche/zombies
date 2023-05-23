# 💳 Buy with credit card

A good approach for NFT sales is to provide an easy onboarding for users that don't own any crypto (tez in our case).&#x20;

Some solutions exist to "on-ramp" users on crypto. Some of the most known include:

* Moonpay
* Ramp.network
* Wert
* Transak

All of them allow the users to "top-up" their wallet with fungible crypto-currencies on various networks, with a simple credit card payment a little to no KYC requirements.&#x20;

Some of them allow a "Direct-to-NFT" shortcut where the user can pay to directly purchase a NFT with their credit card, allowing an experience similar to a Web2 marketplace.&#x20;

Wert supports smart contract interaction on Tezos. This means that a developer can provide smart contract input to a payable entrypoint that will be executed by Wert upon user payment. Let's see how that can fit into our dApp.&#x20;

We'll implement Wert for the token id 1 claim set at 2 ꜩ. Clicking on the drop will popup a Wert payment form, and the token will be delivered when the fiat payment succeeds.&#x20;

## Requirements

Before setting up an integration, developers must agree on a partnership with Wert. A development environment can be set up by submitting a ticket on their Discord server. See their [docs](https://wert.io/for-nft) for more information.&#x20;

## Implementation

### Provider

We'll create another provider for this use-case. Create a provider in `./components/providers/WertProvider.tsx`

It exposes a simple `checkout` method:&#x20;

```tsx
interface WertProviderContextProps {
  checkout: (id: number) => Promise<void>
}

const WertProviderContext = createContext<WertProviderContextProps>({
  checkout: async () => {},
})
```

The `checkout` method is where the initialization and mounting of the Wert widget will happen. We will prepare and sign data to send to the Wert SDK, according to the token information we want to purchase.&#x20;

{% hint style="info" %}
Note here how we're using `taquito` directly, instead of using Completium bindings. This allows us to get the special JSON as hex-string parameters that is required for signature by the SDK.
{% endhint %}

{% hint style="info" %}
We've hard-coded all values here for simplicity (`commodity_value`, `public key`, `partner id`...) Obviously, these will be dynamically fetched or set by configuration
{% endhint %}

```tsx
const checkout = useCallback(
  async (id: number) => {
    if (!Tezos || !fa2 || !fa2.address || !account) return

    const contract = await Tezos.contract.at(fa2.address)
    const txParams = contract.methods
      .mint(account.address, id, 1)
      .toTransferParams({ amount: 1 })
    const michelson = JSON.stringify(txParams?.parameter)
    console.log(michelson)
    const sc_input_data = "0x" + Buffer.from(michelson).toString("hex")
    console.log(sc_input_data)

    const signedData = signSmartContractData(
      {
        address: account.address,
        commodity: "XTZ",
        commodity_amount: 2,
        sc_address: fa2.address,
        sc_input_data,
        network: "ghostnet",
      },
      "0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3"
    )
    const options = {
      partner_id: "01H0SP3RFRFZPH7H4NAJM4HZ39",
      origin: "https://sandbox.wert.io",
      theme: "dark",
      container_id: "wert-module",
      extra: {
        item_info: {
          author_image_url: "",
          author: "TZombies",
          image_url: ipfsUriToGateway(tokenInfo.get(id)?.displayUri ?? ""),
          seller: "TZombies",
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

We can now implement the purchase button on our `drops` page:&#x20;

```tsx
const { checkout } = useWertProviderContext()

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
          {loading ? "In progress..." : "Buy for 2ꜩ"}
        </Button>
      ) : (
        <Button
          disabled={loading}
          onClick={() => handleClaim(id)}
          startIcon={<RedeemIcon />}
        >
          {loading ? "In progress..." : "Claim for free"}
        </Button>
      )}
    </>
  ),
  [handleClaim, handlePurchase, loading]
)
```

### Test

In order to test the Wert widget, you can use the following information:

| Phone | +33123456789 |   |
| ----- | ------------ | - |
| Code  | 0000         |   |
| CVV   | 200          |   |
