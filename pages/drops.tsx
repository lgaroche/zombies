import React, { useCallback, useEffect, useState } from "react"
import { CardMode, TokenList } from "../components/Token"
import { Alert, Snackbar, Typography } from "@mui/material"
import { Tzombies } from "../contracts/fa2"
import { CallResult, Nat } from "@completium/archetype-ts-types"
import { useTzombiesContext } from "../components/TzombiesProvider"

const Drops = () => {
  const [minted, setMinted] = useState<CallResult>()
  const [registered, setRegistered] = useState<number[]>([])
  const { contract } = useTzombiesContext()

  useEffect(() => {
    if (!contract) {
      return
    }
    const getRegistered = async () => {
      const registered = await contract.get_registered()
      setRegistered(
        registered.map((id) => id.to_number()).sort((a, b) => a - b)
      )
    }
    getRegistered().catch((err) => {
      console.error(err)
    })
  }, [contract])

  const handleTokenClick = useCallback((id: number) => {
    const mint = async () => {
      const contract = new Tzombies(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
      const result = await contract.mint(new Nat(id), {})
      setMinted(result)
    }
    mint().then(() => {
      console.log("minted")
    })
  }, [])
  return (
    <>
      <Snackbar open={!!minted} onClose={() => setMinted(undefined)}>
        <Alert severity={"success"}>Minted in {minted?.operation_hash}</Alert>
      </Snackbar>
      <Typography variant="h4">Drops</Typography>
      <TokenList
        tokens={registered}
        mode={CardMode.Claim}
        onClick={(id) => handleTokenClick(id)}
        extra={() => <></>}
      />
    </>
  )
}

export default Drops
