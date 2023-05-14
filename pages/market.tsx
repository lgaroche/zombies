import { Button, Typography } from "@mui/material"
import React, { useCallback } from "react"
import { useTzombiesContext } from "../components/TzombiesProvider"
import {
  add_for_all,
  remove_for_all,
  update_for_all_op,
} from "../contracts/bindings/fa2"
import { Address } from "@completium/archetype-ts-types"
import { useWalletContext } from "../components/WalletProvider"

const Market = () => {
  const { account } = useWalletContext()
  const { fa2, market, isApproved, fetchApproval } = useTzombiesContext()
  console.log("isApproved", isApproved)

  const handleApprove = useCallback(() => {
    if (!fa2 || !market) {
      return
    }
    const approve = async () => {
      const arg = new add_for_all(new Address(market.address!))
      await fa2.update_operators_for_all([arg], {})
    }
    approve().then(() => {
      fetchApproval()
    })
  }, [fa2, fetchApproval, market])

  const handleRevoke = useCallback(() => {
    if (!fa2 || !market) {
      return
    }
    const approve = async () => {
      const arg = new remove_for_all(new Address(market.address!))
      await fa2.update_operators_for_all([arg], {})
    }
    approve().then(() => {
      fetchApproval()
    })
  }, [fa2, market, fetchApproval])

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
