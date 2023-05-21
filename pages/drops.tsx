import React, { useCallback, useEffect, useState } from "react"
import { TokenList } from "../components/Token"
import { Alert, Button, Snackbar, Typography } from "@mui/material"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { CallResult, Nat } from "@completium/archetype-ts-types"
import { useTzombiesContext } from "../components/providers/TzombiesProvider"
import { useWalletContext } from "../components/providers/WalletProvider"

const Drops = () => {
  const [minted, setMinted] = useState<CallResult>()
  const [registered, setRegistered] = useState<number[]>([])
  const { Tezos } = useWalletContext()
  const { fa2, fetchInventory } = useTzombiesContext()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!fa2) {
      return
    }
    const getRegistered = async () => {
      const registered = await fa2.get_registered()
      setRegistered(
        registered.map((id) => id.to_number()).sort((a, b) => a - b)
      )
    }
    getRegistered().catch((err) => {
      console.error(err)
    })
  }, [fa2])

  const handleClaim = useCallback(
    async (id: number) => {
      if (!fa2 || !Tezos) {
        return
      }
      setLoading(true)
      try {
        const result = await fa2.mint(new Nat(id), {})
        setMinted(result)
        fetchInventory()
      } catch (e: any) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [fetchInventory, fa2, Tezos]
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
      <Typography variant="h4">Drops</Typography>
      <TokenList
        tokens={registered}
        actions={ClaimButton}
        onClick={(id) => handleClaim(id)}
        extra={Extra}
      />
    </>
  )
}

export default Drops
