import React, { useCallback, useState } from "react"
import { TokenList } from "../components/Token"
import { Alert, Button, Snackbar, Typography } from "@mui/material"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { CallResult } from "@completium/archetype-ts-types"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"

const Drops = () => {
  const [minted, setMinted] = useState<CallResult>()
  const { freeClaim, fetchInventory, tokenInfo } = useTzombiesContext()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleClaim = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        const result = await freeClaim(id)
        setMinted(result)
        fetchInventory()
      } catch (e: any) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [fetchInventory, freeClaim]
  )

  const ClaimButton = useCallback(
    (id: number) => (
      <Button
        disabled={loading}
        onClick={() => handleClaim(id)}
        startIcon={<AddShoppingCartIcon />}
      >
        {loading ? "In progress..." : "Claim"}
      </Button>
    ),
    [handleClaim, loading]
  )

  const Extra = useCallback(() => <></>, [])

  return (
    <>
      <Snackbar open={!!minted} onClose={() => setMinted(undefined)}>
        <Alert severity={"success"}>Minted in {minted?.operation_hash}</Alert>
      </Snackbar>
      <Snackbar open={!!error} onClose={() => setError(undefined)}>
        <Alert severity={"error"}>Error: {error}</Alert>
      </Snackbar>
      <Typography variant="h4">Drops</Typography>
      <TokenList
        tokens={[...tokenInfo?.keys()] ?? []}
        actions={ClaimButton}
        onClick={(id) => handleClaim(id)}
        extra={Extra}
      />
    </>
  )
}

export default Drops
