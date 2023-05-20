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

  const handleTokenClick = useCallback(
    (id: number) => {
      if (!fa2 || !Tezos) {
        return
      }
      const mint = async () => {
        const result = await fa2.mint(new Nat(id), {})
        setMinted(result)
      }
      mint().then(() => {
        fetchInventory()
      })
    },
    [fetchInventory, fa2, Tezos]
  )

  const ClaimButton = useCallback(
    (id: number) => (
      <Button
        onClick={() => handleTokenClick(id)}
        startIcon={<AddShoppingCartIcon />}
      >
        Claim
      </Button>
    ),
    [handleTokenClick]
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
        onClick={(id) => handleTokenClick(id)}
        extra={Extra}
      />
    </>
  )
}

export default Drops
