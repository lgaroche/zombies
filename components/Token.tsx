import React from "react"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import { Grid } from "@mui/material"
import { useTzombiesContext } from "./providers/TzombiesProvider"
import { useMetadataContext } from "./providers/MetadataProvider"

interface TokenProps {
  id: number
  actions?: React.ReactNode
  extra?: React.ReactNode
}

const TokenContent = ({
  id,
  extra,
}: {
  id: number
  extra?: React.ReactNode
}) => {
  const { tokenInfo } = useTzombiesContext()
  const { ipfsUriToGateway } = useMetadataContext()
  if (!tokenInfo.has(id)) return <React.Fragment />
  return (
    <>
      <CardMedia
        component="img"
        height="200"
        image={ipfsUriToGateway(tokenInfo.get(id)?.displayUri ?? "")}
      />
      <CardContent>
        {tokenInfo.get(id)?.name}
        {extra}
      </CardContent>
    </>
  )
}

const Token = ({ id, actions, extra }: TokenProps) => {
  return (
    <Card sx={{ maxWidth: 200 }}>
      <TokenContent id={id} extra={extra} />
      <CardActions>{actions}</CardActions>
    </Card>
  )
}

interface TokenListProps {
  tokens: number[]
  actions: (id: number) => React.ReactNode
  onClick?: (id: number) => void
  extra?: (id: number) => React.ReactNode
}

const TokenList = ({ tokens, actions, extra }: TokenListProps) => (
  <Grid container spacing={2}>
    {tokens.map((id) => (
      <Grid item key={id}>
        <Token id={id} actions={actions?.(id)} extra={extra?.(id)} />
      </Grid>
    ))}
  </Grid>
)

export { Token, TokenList, TokenContent }
