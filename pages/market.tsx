import { Button, Typography } from "@mui/material"
import React, { useCallback } from "react"
import { useWalletContext } from "../components/WalletProvider"
import { useMarketProviderContext } from "../components/MarketProvider"

const Market = () => {
  const { account } = useWalletContext()
  const { isApproved, approve, revoke, fetchMarketplaceApproval } =
    useMarketProviderContext()
  console.log("isApproved", isApproved)

  const handleApprove = useCallback(async () => {
    await approve()
    await fetchMarketplaceApproval()
  }, [approve, fetchMarketplaceApproval])

  const handleRevoke = useCallback(async () => {
    await revoke()
    await fetchMarketplaceApproval()
  }, [revoke, fetchMarketplaceApproval])

  return (
    <>
      <Typography variant="h4">Marketplace</Typography>
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
    </>
  )
}

export default Market
