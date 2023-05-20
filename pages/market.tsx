import {
  Button,
  Dialog,
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
import { images } from "../components/Token"
import BuyDialog from "../components/BuyDialog"

const Market = () => {
  const { account } = useWalletContext()
  const {
    isApproved,
    sales,
    approve,
    revoke,
    fetchMarketplaceApproval,
    fetchSales,
  } = useMarketProviderContext()

  const [buySale, setBuySale] = useState<Sale>()

  const handleApprove = useCallback(async () => {
    await approve()
    await fetchMarketplaceApproval()
  }, [approve, fetchMarketplaceApproval])

  const handleRevoke = useCallback(async () => {
    await revoke()
    await fetchMarketplaceApproval()
  }, [revoke, fetchMarketplaceApproval])

  const handleRefresh = useCallback(async () => {
    await fetchMarketplaceApproval()
    await fetchSales()
  }, [fetchMarketplaceApproval, fetchSales])

  return (
    <>
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
            disabled={!account}
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
            <TableCell>Quantity</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.saleId}>
              <TableCell>
                <Image
                  src={images[sale.parameters.tokenId % 2]}
                  alt={`token #${sale.parameters.tokenId}`}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{sale.parameters.amount}</TableCell>
              <TableCell>{sale.parameters.price / 1_000_000} ꜩ</TableCell>
              <TableCell>
                {sale.seller.toString() === account?.address
                  ? "you"
                  : sale.seller.toString()}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(sale.parameters.expiry).toRelative()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  onClick={() => setBuySale(sale)}
                  disabled={sale.seller.toString() === account?.address}
                >
                  Buy
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default Market
