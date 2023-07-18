import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { Listing, useMarketProviderContext } from "./providers/MarketProvider"
import { TokenContent } from "./Token"
import { useTzombiesContext } from "./providers/TzombiesProvider"

interface BuyDialogProps {
  listing?: Listing
  onClose: () => void
}

const BuyDialog = ({ listing, onClose }: BuyDialogProps) => {
  const { buy } = useMarketProviderContext()
  const { fetchInventory } = useTzombiesContext()
  const [quantity, setQuantity] = useState<number>(1)
  const [txId, setTxId] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleBuy = useCallback(async () => {
    if (!listing) return
    setLoading(true)
    try {
      const res = await buy(listing, quantity)
      if (res) {
        setTxId(res.operation_hash)
        fetchInventory()
      }
      onClose()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [listing, buy, onClose, fetchInventory, quantity])

  useEffect(() => {
    if (listing) {
      setQuantity(listing.parameters.amount)
    }
  }, [listing])

  return (
    <>
      <Snackbar open={!!txId} onClose={() => setTxId(undefined)}>
        <Alert severity={"success"}>Purchase: {txId}</Alert>
      </Snackbar>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={"error"}>Error: {error}</Alert>
      </Snackbar>

      {listing && (
        <Dialog open={!!listing} onClose={onClose}>
          <DialogTitle>Buy a Zombie</DialogTitle>
          <DialogContent>
            <TokenContent id={listing.parameters.tokenId} />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={({ target }) =>
                setQuantity(
                  Math.min(parseInt(target.value), listing.parameters.amount)
                )
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleBuy} disabled={loading}>
              {loading
                ? "In progress..."
                : `Buy for ${
                    (listing.parameters.price * quantity) / 1_000_000
                  }ꜩ`}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default BuyDialog
