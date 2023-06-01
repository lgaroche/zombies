# Architecture

The front-end will extensively use React features, notably [contexts and providers](https://react.dev/learn/passing-data-deeply-with-context). I recommend getting familiar with the concept before continuing.&#x20;

Visually, app will remain simple: a single-page web-app that leverages Next.js router to navigate between 3 routes:&#x20;

* **Home**
* **Drops**: The collector can list registered tokens and claim them
* **Market**: The token trading marketplace, shows listings
* **Inventory**: Collector's inventory

A Material-UI NavBar will easily allow switching to the different pages, and also provide the Wallet connection button.&#x20;

To keep our code base clean, we will seperate functionality in the following providers:&#x20;

| Provider         | Role                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| WalletProvider   | Beacon connection, account address, tz balance                              |
| MetadataProvider | Fetch metadata from IPFS                                                    |
| TzombiesProvider | Abstract the FA2 smart contract (registered tokens, balances, transfers...) |
| MarketProvider   | Abstract the marketplace smart contract (list sales, sell, buy...)          |
| WertProvider     | Call the Wert payment widget                                                |

Most of the above will follow a similar concept. On first load, it will fetch data from their relevant source (wallet, contracts...) and they will provide methods to update the data.&#x20;

## Environment variables

A few environment variables will be used in the project. I recommend setting them in `.env.local` file during development. The following variables will be used (contracts addresses are left blank intentionally, they should be set with the deployed contract addresses, see the [smart contract](../smart-contracts/marketplace-contract/deploying-and-testing.md) section.&#x20;

```bash
NEXT_PUBLIC_FA2_ADDRESS=
NEXT_PUBLIC_MARKET_ADDRESS=
NEXT_PUBLIC_TEZOS_RPC=http://localhost:3000/sandbox
NEXT_PUBLIC_NETWORK=custom
NEXT_PUBLIC_WERT_PARTNER_ID=01H0SP3RFRFZPH7H4NAJM4HZ39
```

{% hint style="info" %}
To switch to the ghostnet network, use the following:

```bash
NEXT_PUBLIC_TEZOS_RPC=https://ghostnet.smartpy.io
NEXT_PUBLIC_NETWORK=ghostnet
```
{% endhint %}
