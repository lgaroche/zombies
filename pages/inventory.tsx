import { Alert, Button, Chip, Paper, Snackbar, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import SellOutlinedIcon from "@mui/icons-material/SellOutlined"
import SendIcon from "@mui/icons-material/Send"

import { useWalletContext } from "../components/providers/WalletProvider"
import { TokenList } from "../components/Token"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"
import ListingDialog from "../components/ListingDialog"
import { useMarketProviderContext } from "../components/providers/MarketProvider"
import Link from "next/link"
import TransferDialog from "../components/TransferDialog"

const Inventory = () => {
  const { balance, getBalance } = useWalletContext()
  const { inventory, fetchInventory } = useTzombiesContext()
  const { isApproved } = useMarketProviderContext()

  const [listingFormOpen, setListingFormOpen] = useState<number>()
  const [transferFormOpen, setTransferFormOpen] = useState<number>()
  const [error, setError] = useState<string>()

  const handleRefresh = useCallback(() => {
    try {
      getBalance()
      fetchInventory()
    } catch (e: any) {
      console.error(e)
    }
  }, [getBalance, fetchInventory])

  const Actions = useCallback(
    (id: number) => (
      <>
        <Button
          onClick={() => setListingFormOpen(id)}
          disabled={!isApproved}
          endIcon={<SellOutlinedIcon />}
        >
          Sell
        </Button>
        <Button onClick={() => setTransferFormOpen(id)} endIcon={<SendIcon />}>
          Transfer
        </Button>
      </>
    ),
    [setListingFormOpen, isApproved]
  )

  const Extra = useCallback(
    (id: number) => (
      <>
        {" "}
        <Chip size="small" label={`x${inventory.get(id)}`} />
      </>
    ),
    [inventory]
  )

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

      <ListingDialog
        id={listingFormOpen ?? 0}
        onClose={() => setListingFormOpen(undefined)}
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
}

export default Inventory
