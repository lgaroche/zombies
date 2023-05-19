import { Button, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import { useWalletContext } from "../components/providers/WalletProvider"
import { TokenList } from "../components/Token"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"
import SaleDialog from "../components/SaleDialog"

const Inventory = () => {
  const { balance, getBalance } = useWalletContext()
  const { inventory, fetchInventory } = useTzombiesContext()

  const [saleFormOpen, setSaleFormOpen] = useState<number>()

  const handleRefresh = useCallback(() => {
    getBalance()
    fetchInventory()
  }, [getBalance, fetchInventory])

  const SellButton = useCallback(
    (id: number) => <Button onClick={() => setSaleFormOpen(id)}>Sell</Button>,
    [setSaleFormOpen]
  )

  const Extra = useCallback(
    (id: number) => <p>x{inventory.get(id)}</p>,
    [inventory]
  )

  return (
    <>
      <Typography variant="h4">Your inventory</Typography>
      <Button onClick={handleRefresh}>Refresh</Button>
      <Typography variant="h5">Tz balance: {balance}</Typography>

      <SaleDialog
        id={saleFormOpen || 0}
        onClose={() => setSaleFormOpen(undefined)}
      />

      <TokenList
        tokens={[...inventory.keys()].filter((id) => inventory.get(id)! > 0)}
        actions={SellButton}
        extra={Extra}
      />
    </>
  )
}

export default Inventory
