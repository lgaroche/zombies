import {
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
  Chip,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { TokenContent } from "./Token"
import { useMarketProviderContext } from "./providers/MarketProvider"
import { DateTimePicker } from "@mui/x-date-pickers"
import { DateTime } from "luxon"

interface ListingDialogProps {
  id: number
  onClose: () => void
}

const ListingDialog = ({ id, onClose }: ListingDialogProps) => {
  const { list_for_sale } = useMarketProviderContext()
  const { fetchListings } = useMarketProviderContext()
  const [amount, setAmount] = useState<number>(1)
  const [price, setPrice] = useState<number>(10)
  const [expiry, setExpiry] = useState<DateTime | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [opHash, setOpHash] = useState<string>()
  const [error, setError] = useState<string>()

  const handleSell = useCallback(
    async (tokenId: number) => {
      if (!expiry) return
      setLoading(true)
      try {
        const res = await list_for_sale({
          tokenId,
          amount,
          price,
          expiry: expiry.toJSDate(),
        })
        if (res) {
          setOpHash(res.operation_hash)
          onClose()
          fetchListings()
        }
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? JSON.stringify(e))
      } finally {
        setLoading(false)
      }
    },
    [expiry, list_for_sale, amount, price, onClose, fetchListings]
  )

  const expiryValid = expiry && expiry.diffNow().toMillis() > 0

  return (
    <>
      <Snackbar open={!!opHash} onClose={() => setOpHash(undefined)}>
        <Alert severity={"success"}>Sale: {opHash}</Alert>
      </Snackbar>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={"error"}>Error: {error}</Alert>
      </Snackbar>

      <Dialog open={id > 0} onClose={onClose}>
        <DialogTitle>Sell item</DialogTitle>
        <DialogContent>
          <TokenContent id={id} />

          <TextField
            id="price"
            fullWidth
            sx={{ m: 1 }}
            label="Price per item"
            type="number"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">ꜩ </InputAdornment>
              ),
            }}
            value={price}
            onChange={({ target }) => setPrice(Number(target.value))}
          />

          <TextField
            id="qty"
            fullWidth
            sx={{ m: 1 }}
            label="Quantity"
            type="number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            value={amount}
            onChange={({ target }) =>
              setAmount(Math.floor(parseInt(target.value)) ?? 0)
            }
          />

          <DateTimePicker
            label="Expiry"
            disablePast
            sx={{ m: 1 }}
            value={expiry}
            onChange={(value) => setExpiry(value)}
          />
          <span>
            {expiry && (
              <Chip
                label={expiry?.toRelative()}
                color={expiryValid ? "default" : "error"}
              />
            )}
          </span>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => handleSell(id)}
            variant="contained"
            disabled={loading || !expiryValid}
          >
            {loading ? "In progress..." : "Sell"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ListingDialog
