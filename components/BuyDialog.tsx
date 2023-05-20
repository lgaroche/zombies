import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { Sale, useMarketProviderContext } from "./providers/MarketProvider"
import { TokenContent } from "./Token"

interface BuyDialogProps {
  sale?: Sale
  onClose: () => void
}

const BuyDialog = ({ sale, onClose }: BuyDialogProps) => {
  const { buy } = useMarketProviderContext()
  const [quantity, setQuantity] = useState<number>(1)
  const [txId, setTxId] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleBuy = useCallback(async () => {
    if (!sale) return
    setLoading(true)
    try {
      const res = await buy(sale, quantity)
      if (res) {
        setTxId(res.operation_hash)
      }
      onClose()
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [sale, buy, onClose, quantity])

  useEffect(() => {
    if (sale) {
      setQuantity(sale.parameters.amount)
    }
  }, [sale])

  return (
    <>
      <Snackbar open={!!txId} onClose={() => setTxId(undefined)}>
        <Alert severity={"success"}>Purchase: {txId}</Alert>
      </Snackbar>
      {sale && (
        <Dialog open={!!sale} onClose={onClose}>
          <DialogTitle>Buy a Zombie</DialogTitle>
          <DialogContent>
            <TokenContent id={sale.parameters.tokenId} />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={({ target }) =>
                setQuantity(
                  Math.min(parseInt(target.value), sale.parameters.amount)
                )
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleBuy} disabled={loading}>
              {loading
                ? "In progress..."
                : `Buy for ${(sale.parameters.price * quantity) / 1_000_000}ꜩ`}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default BuyDialog
