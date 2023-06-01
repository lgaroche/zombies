# Inventory page

Now that we have our two dialogs, we can include them in our `./pages/inventory.tsx` page, followed by the owned token list.&#x20;

We'll fetch the token list using `inventory` from the `TzombiesContext`.

Here's the breakdown of our component:&#x20;

```tsx
import { Alert, Button, Chip, Paper, Snackbar, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import SellOutlinedIcon from "@mui/icons-material/SellOutlined"
import SendIcon from "@mui/icons-material/Send"

import { useWalletContext } from "../components/providers/WalletProvider"
import { TokenList } from "../components/Token"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"
import SaleDialog from "../components/SaleDialog"
import { useMarketProviderContext } from "../components/providers/MarketProvider"
import Link from "next/link"
import TransferDialog from "../components/TransferDialog"
```

The states:&#x20;

```tsx
const Inventory = () => {
  const { balance, getBalance } = useWalletContext()
  const { inventory, fetchInventory } = useTzombiesContext()
  const { isApproved } = useMarketProviderContext()

  const [saleFormOpen, setSaleFormOpen] = useState<number>()
  const [transferFormOpen, setTransferFormOpen] = useState<number>()
  const [error, setError] = useState<string>()
  
  ...
```

Refresh button:

```tsx
const handleRefresh = useCallback(() => {
  try {
    getBalance()
    fetchInventory()
  } catch (e: any) {
    console.error(e)
  }
}, [getBalance, fetchInventory])

```

Custom actions:&#x20;

<pre class="language-tsx"><code class="lang-tsx">const Actions = useCallback(
<strong>  (id: number) => (
</strong>    &#x3C;>
      &#x3C;Button
        onClick={() => setSaleFormOpen(id)}
        disabled={!isApproved}
        endIcon={&#x3C;SellOutlinedIcon />}
      >
        Sell
      &#x3C;/Button>
      &#x3C;Button onClick={() => setTransferFormOpen(id)} endIcon={&#x3C;SendIcon />}>
        Transfer
      &#x3C;/Button>
    &#x3C;/>
  ),
  [setSaleFormOpen, isApproved]
)
</code></pre>

Let's add the token count as an extra chip:&#x20;

```tsx
const Extra = useCallback(
  (id: number) => (
    <>
      {" "}
      <Chip size="small" label={`x${inventory.get(id)}`} />
    </>
  ),
  [inventory]
)
```

And the page implementation:&#x20;

```tsx
return (
  <>
    <Typography variant="h4">Your inventory</Typography>
    <Button onClick={handleRefresh}>Refresh</Button>

    <Snackbar open={!!error} onClose={() => setError(undefined)}>
      <Alert severity={"error"}>Error: {error}</Alert>
    </Snackbar>

    <Paper sx={{ p: 2, my: 2 }}>
      <Typography variant="h5">Balance</Typography>
      <Typography variant="h6">{balance} ꜩ</Typography>
    </Paper>

    <SaleDialog
      id={saleFormOpen ?? 0}
      onClose={() => setSaleFormOpen(undefined)}
    />

    <TransferDialog
      id={transferFormOpen ?? 0}
      onClose={() => setTransferFormOpen(undefined)}
    />

    {!isApproved && (
      <p>
        ℹ️ To sell tokens, please approve the{" "}
        <Link href="/market">marketplace</Link> as an operator.{" "}
      </p>
    )}
    <TokenList
      tokens={[...inventory.keys()].filter((id) => inventory.get(id)! > 0)}
      actions={Actions}
      extra={Extra}
    />
  </>
)
```

Export the component:&#x20;

```tsx
    ...
}

export default Inventory
```
