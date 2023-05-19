import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Snackbar,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { Sale } from "./providers/MarketProvider"

interface BuyDialogProps {
  sale?: Sale
  onClose: () => void
}

const BuyDialog = ({ sale, onClose }: BuyDialogProps) => {
  const [txId, setTxId] = useState<string>()
  return (
    <>
      <Snackbar open={!!txId} onClose={() => setTxId(undefined)}>
        <Alert severity={"success"}>Purchase: {txId}</Alert>
      </Snackbar>
      <Dialog open={!!sale} onClose={onClose}>
        <DialogTitle>Buy a Zombie</DialogTitle>
        <DialogContent>
          <FormControl fullWidth />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BuyDialog
