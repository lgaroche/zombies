import React, { useCallback, useEffect, useState } from "react"
import { TokenList } from "../components/Token"
import { Alert, Button, Snackbar, Typography } from "@mui/material"
import { Tzombies } from "../contracts/bindings/fa2"
import { CallResult, Nat } from "@completium/archetype-ts-types"
import { useTzombiesContext } from "../components/TzombiesProvider"

const Drops = () => {
  const [minted, setMinted] = useState<CallResult>()
  const [registered, setRegistered] = useState<number[]>([])
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
      const mint = async () => {
        const fa2 = new Tzombies(process.env.NEXT_PUBLIC_FA2_ADDRESS)
        const result = await fa2.mint(new Nat(id), {})
        setMinted(result)
      }
      mint().then(() => {
        fetchInventory()
      })
    },
    [fetchInventory]
  )

  const ClaimButton = useCallback(
    (id: number) => <Button onClick={() => handleTokenClick(id)}>Claim</Button>,
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
