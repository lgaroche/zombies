import { Button, Chip, Paper, Typography } from "@mui/material"
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

const Inventory = () => {
  const { balance, getBalance } = useWalletContext()
  const { inventory, fetchInventory } = useTzombiesContext()
  const { isApproved } = useMarketProviderContext()

  const [saleFormOpen, setSaleFormOpen] = useState<number>()
  const [transferFormOpen, setTransferFormOpen] = useState<number>()

  const handleRefresh = useCallback(() => {
    getBalance()
    fetchInventory()
  }, [getBalance, fetchInventory])

  const SellButton = useCallback(
    (id: number) => (
      <Button onClick={() => setSaleFormOpen(id)} disabled={!isApproved}>
        Sell
      </Button>
    ),
    [setSaleFormOpen, isApproved]
  )

  const Actions = useCallback(
    (id: number) => (
      <>
        <Button
          onClick={() => setSaleFormOpen(id)}
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
    [setSaleFormOpen, isApproved]
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

      <Paper sx={{ p: 2, my: 2 }}>
        <Typography variant="h5">Balance</Typography>
        <Typography variant="h6">{balance} ꜩ</Typography>
      </Paper>

      <SaleDialog
        id={saleFormOpen || 0}
        onClose={() => setSaleFormOpen(undefined)}
      />

      <TransferDialog
        id={transferFormOpen || 0}
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
