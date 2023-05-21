import {
  Alert,
  Button,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { useWalletContext } from "../components/providers/WalletProvider"
import {
  Sale,
  useMarketProviderContext,
} from "../components/providers/MarketProvider"
import { DateTime } from "luxon"
import Image from "next/image"
import BuyDialog from "../components/BuyDialog"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"

const Market = () => {
  const { account } = useWalletContext()
  const {
    isApproved,
    sales,
    approve,
    revoke,
    cancel,
    fetchMarketplaceApproval,
    fetchSales,
  } = useMarketProviderContext()

  const { tokenInfo } = useTzombiesContext()
  const [buySale, setBuySale] = useState<Sale>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleApprove = useCallback(async () => {
    try {
      setLoading(true)
      await approve()
      await fetchMarketplaceApproval()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [approve, fetchMarketplaceApproval])

  const handleRevoke = useCallback(async () => {
    setLoading(true)
    try {
      await revoke()
      await fetchMarketplaceApproval()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [revoke, fetchMarketplaceApproval])

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await fetchMarketplaceApproval()
      await fetchSales()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [fetchMarketplaceApproval, fetchSales])

  const handleCancel = useCallback(
    async (sale: Sale) => {
      setLoading(true)
      try {
        await cancel(sale)
        await fetchSales()
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? JSON.stringify(e))
      } finally {
        setLoading(false)
      }
    },
    [cancel, fetchSales]
  )

  return (
    <>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={"error"}>Error: {error}</Alert>
      </Snackbar>

      <Typography variant="h4">Marketplace</Typography>
      <Button onClick={handleRefresh}>Refresh</Button>
      {isApproved ? (
        <>
          <p>
            ✅ The marketplace contract is an approved operator for all your
            tokens
          </p>
          <Button disabled={!account} variant="outlined" onClick={handleRevoke}>
            Revoke
          </Button>
        </>
      ) : (
        <>
          <p>ℹ️ The marketplace contract needs to be an approved operator</p>
          <Button
            disabled={!account || loading}
            variant="contained"
            onClick={handleApprove}
          >
            Approve marketplace
          </Button>
        </>
      )}

      <BuyDialog
        onClose={() => {
          setBuySale(undefined)
          handleRefresh()
        }}
        sale={buySale}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Price</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Seller
            </TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.saleId}>
              <TableCell>
                <Image
                  src={
                    tokenInfo.get(sale.parameters.tokenId)?.thumbnailUri ?? ""
                  }
                  alt={tokenInfo.get(sale.parameters.tokenId)?.name ?? ""}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{sale.parameters.amount}</TableCell>
              <TableCell>{sale.parameters.price / 1_000_000} ꜩ</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                {sale.seller.toString() === account?.address
                  ? "you"
                  : sale.seller.toString()}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(sale.parameters.expiry).toRelative()}
              </TableCell>
              <TableCell>
                {sale.seller.toString() !== account?.address ? (
                  <Button
                    variant="outlined"
                    onClick={() => setBuySale(sale)}
                    disabled={loading}
                  >
                    Buy
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    onClick={() => handleCancel(sale)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default Market
