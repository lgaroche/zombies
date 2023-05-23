---
description: The wallet connect/disconnect button on the NavBar
---

# Connect button

Now that we have our `WalletProvider`, let's use it to integrate the wallet connection button.&#x20;

The button will display "Connect wallet" when no wallet is connected, and the wallet address when a wallet is connected. Clicking on it will disconnect it. Just a simple UI trick.

Import the wallet context in `./components/NavBar.tsx`

```tsx
import { useWalletContext } from "./providers/WalletProvider"
```

Load connect, disconnect and account from the context:&#x20;

```tsx
const Menu = () => {
  const { connect, disconnect, account } = useWalletContext()
```

Replace the connect button logic with a conditional display:&#x20;

```tsx
{account ? (
  <Button
    sx={{ my: 2, color: "white" }}
    onClick={disconnect}
    startIcon={<CloseRounded />}
  >
    {account.address.substring(0, 5)}...
    {account.address.substring(account.address.length - 5)}
  </Button>
) : (
  <Button sx={{ my: 2, color: "white" }} onClick={connect}>
    Connect wallet
  </Button>
)}
```

You should now be able to connect and disconnect wallet using Beacon widget.

![](<../../.gitbook/assets/image (1).png>)

{% hint style="info" %}
With Next.js development mode and hot-reload, the beacon wallet may not recover properly and fire errors. If this happens. Disconnect the wallet, reload the page and connect again.&#x20;

This does not seem to happen with a production build.
{% endhint %}
