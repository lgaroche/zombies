# Architecture

The front-end will extensively use React features, notably context and providers. If you do not understand these features, you will not understand the upcoming front end code. The [interactive lessons at react.dev](https://react.dev/learn/passing-data-deeply-with-context) should provide the required background.

The visual design will be simple. A single-page web-app will leverage Next.js router to navigate between 3 routes:&#x20;

* **Home**
* **Drops**: The collector can list registered tokens and claim them
* **Market**: The token trading marketplace, shows listings
* **Inventory**: Collector's inventory

A Material-UI NavBar will easily allow switching to the different pages, and also provide the Wallet connection button.&#x20;

To keep our code base clean, we will seperate functionality across the following providers:&#x20;

<table><thead><tr><th width="231">Provider</th><th>Role</th></tr></thead><tbody><tr><td>WalletProvider</td><td>Beacon connection, account address, tz balance</td></tr><tr><td>MetadataProvider</td><td>Fetch metadata from IPFS</td></tr><tr><td>TzombiesProvider</td><td>Abstract the FA2 smart contract (registered tokens, balances, transfers...)</td></tr><tr><td>MarketProvider</td><td>Abstract the marketplace smart contract (list sales, sell, buy...)</td></tr><tr><td>WertProvider</td><td>Call the Wert payment widget</td></tr></tbody></table>

Most of the above will follow a similar concept. On first load, it will fetch data from their relevant source (wallet, contracts...) and they will provide methods to update the data.&#x20;

## Environment variables

A few environment variables will be used in the project. I recommend setting them in `.env.local` file during development. The following variables will be used (contracts addresses are left blank intentionally, they should be set with the deployed contract addresses, see the [smart contract](../smart-contracts/marketplace-contract/deploying-and-testing.md) section.&#x20;

```bash
NEXT_PUBLIC_FA2_ADDRESS=
NEXT_PUBLIC_MARKET_ADDRESS=
# Use the next.js proxy to avoid CORS errors:
NEXT_PUBLIC_TEZOS_RPC=http://localhost:3000/sandbox
NEXT_PUBLIC_NETWORK=custom
NEXT_PUBLIC_WERT_PARTNER_ID=01H0SP3RFRFZPH7H4NAJM4HZ39
```

Be sure Completium is pointed at the sandbox endpoint, AND that the sandbox is running. You can switch endpoints with `ccli switch endpoint.` You can ensure the sandbox is running with `ccli start sandbox.` If the sandbox is already running, this command will output an error informing you that the container name "/my-sandbox" is already in use.

{% hint style="info" %}
If you switch to the ghostnet network, use the following variables in `.env.local`:

```bash
NEXT_PUBLIC_TEZOS_RPC=https://ghostnet.smartpy.io
NEXT_PUBLIC_NETWORK=ghostnet
```

Ensure you also connect Completium to the corresponding ghostnet endpoint with `ccli switch endpoint`.
{% endhint %}
