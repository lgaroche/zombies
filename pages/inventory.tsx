import { Button, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { useWalletContext } from "../components/WalletProvider"
import { CardMode, TokenList } from "../components/Token"
import { useTzombiesContext } from "../components/TzombiesProvider"

const Inventory = () => {
  const { account, Tezos, balance, getBalance } = useWalletContext()
  const { fa2, inventory, fetchInventory } = useTzombiesContext()

  useEffect(() => {
    if (!Tezos) {
      return
    }
    if (!fa2 || fa2.address === undefined) {
      console.log("contract not ready")
      return
    }
    if (!account || account.address === undefined) {
      console.log("account not ready")
      return
    }
    ;(async () => {
      // const balance = await Tezos.tz.getBalance(account?.address)
      // setTzBalance(balance.dividedBy(1_000_000).toFixed())
      // const url = new URL("https://api.ghostnet.tzkt.io/v1/tokens/balances")
      // url.searchParams.append("account", account.address)
      // url.searchParams.append("token.contract", contract.address!)
      // const fetchResult = await fetch(url, {
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json",
      //   },
      // })
      // const res = await fetchResult.json()
      // const tokens: number[] = []
      // for (const token of res) {
      //   const { tokenId } = token.token
      //   tokens.push(tokenId)
      // }
      // setInventory(tokens)
    })()
  }, [account, Tezos, fa2])

  const handleRefresh = useCallback(() => {
    getBalance()
    fetchInventory()
  }, [getBalance, fetchInventory])

  return (
    <>
      <Typography variant="h4">Your inventory</Typography>
      <Button onClick={handleRefresh}>Refresh</Button>
      <Typography variant="h5">Tz balance: {balance}</Typography>
      <TokenList
        tokens={[...inventory.keys()].filter((id) => inventory.get(id)! > 0)}
        mode={CardMode.Buy}
        extra={(id) => <p>x{inventory.get(id)}</p>}
      />
    </>
  )
}

export default Inventory
