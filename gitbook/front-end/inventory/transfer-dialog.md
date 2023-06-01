# Transfer dialog

Create a component in  `./components/TransferDialog.tsx`

Insert the usual `loading`/`error` state and `Snackbar`, the token content and a form to input:

* The recipient address
* The amount of tokens to transfer

The dialog takes the token id to transfer as a parameter.

It should end up in something similar to this:

```tsx
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
import React, { useCallback, useState } from "react"
import { TokenContent } from "./Token"
import { useTzombiesContext } from "./providers/TzombiesProvider"

interface TransferDialogProps {
  id: number
  onClose: () => void
}

const TransferDialog = ({ id, onClose }: TransferDialogProps) => {
  const { transfer, inventory } = useTzombiesContext()
  const [to, setTo] = useState<string>("")
  const [amount, setAmount] = useState<number>(1)
  const [opHash, setOpHash] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleTransfer = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await transfer({ tokenId: id, to, amount })
      console.log("transfer callresult", res)
      if (res) {
        setOpHash(res.operation_hash)
        onClose()
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [id, to, amount, transfer, onClose])

  return (
    <>
      <Snackbar open={!!opHash} onClose={() => setOpHash(undefined)}>
        <Alert severity={"success"}>Sale: {opHash}</Alert>
      </Snackbar>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={"error"}>Error: {error}</Alert>
      </Snackbar>

      <Dialog open={id > 0} onClose={onClose}>
        <DialogTitle>Transfer</DialogTitle>
        <DialogContent>
          <TokenContent id={id} />
          <TextField
            label={"To"}
            variant={"outlined"}
            fullWidth
            sx={{ m: 1 }}
            value={to}
            onChange={({ target }) => setTo(target.value)}
          />
          <TextField
            label={"Amount"}
            variant={"outlined"}
            inputProps={{ type: "number" }}
            fullWidth
            sx={{ m: 1 }}
            value={amount}
            onChange={({ target }) =>
              setAmount(
                Math.min(parseInt(target.value), inventory.get(id) ?? 0)
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleTransfer} disabled={loading || amount < 1}>
            {loading ? "In progress..." : "Transfer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TransferDialog

```
