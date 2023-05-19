import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { TokenContent } from "./Token"
import { useMarketProviderContext } from "./providers/MarketProvider"

interface SaleDialogProps {
  id: number
  onClose: () => void
}

const SaleDialog = ({ id, onClose }: SaleDialogProps) => {
  const { sell } = useMarketProviderContext()
  const [amount, setAmount] = useState<number>(1)
  const [price, setPrice] = useState<number>(10)
  const [expiry, setExpiry] = useState<string>(new Date().toISOString())
  const [loading, setLoading] = useState<boolean>(false)
  const [saleId, setSaleId] = useState<string>()

  const handleSell = useCallback(
    async (tokenId: number) => {
      let expiryDate: Date
      try {
        expiryDate = new Date(expiry)
      } catch (e: any) {
        console.error(e)
        return
      }
      setLoading(true)
      const res = await sell({
        tokenId,
        amount,
        price,
        expiry: expiryDate,
      })
      if (res) {
        setSaleId(res.operation_hash)
      }
      setLoading(false)
    },
    [price, amount, sell, expiry]
  )

  return (
    <>
      <Snackbar open={!!saleId} onClose={() => setSaleId(undefined)}>
        <Alert severity={"success"}>Sale id: {saleId}</Alert>
      </Snackbar>
      <Dialog open={id > 0} onClose={onClose}>
        <DialogTitle>Sell item</DialogTitle>
        <DialogContent>
          <TokenContent id={id} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel htmlFor="price">Price per item</InputLabel>
            <OutlinedInput
              id="price"
              startAdornment={
                <InputAdornment position="start">ꜩ </InputAdornment>
              }
              label="Price per item"
              type="number"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              value={price}
              onChange={({ target }) => setPrice(Number(target.value))}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel htmlFor="qty">Quantity</InputLabel>
            <OutlinedInput
              id="qty"
              label="Quantity"
              type="number"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              value={amount}
              onChange={({ target }) =>
                setAmount(Math.floor(Number(target.value)) || 0)
              }
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel htmlFor="expiry">Expiry</InputLabel>
            <OutlinedInput
              id="expiry"
              label="aa"
              type="text"
              value={expiry}
              onChange={({ target }) => setExpiry(target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => handleSell(id)}
            variant="contained"
            disabled={loading}
          >
            {loading ? "In progress..." : "Sell"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SaleDialog
