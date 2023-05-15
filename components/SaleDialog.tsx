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
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { TokenContent } from "./Token"

interface SaleDialogProps {
  id: number
  onClose: () => void
}

const SaleDialog = ({ id, onClose }: SaleDialogProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(10)

  const handleSell = useCallback(
    (id: number) => {
      console.log("handleSell", id, quantity, price)
    },
    [price, quantity]
  )

  return (
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
            value={quantity}
            onChange={({ target }) =>
              setQuantity(Math.floor(Number(target.value)) || 0)
            }
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => handleSell(id)} variant="contained">
          Sell
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaleDialog
