# Token display

In various places over our application we will need to display one of more NFT. To simplify, we'll use the same but customisable component based on Material-UI Card component.

The imports:&#x20;

```tsx
import React from "react"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import { Grid } from "@mui/material"
import { useTzombiesContext } from "./providers/TzombiesProvider"
import { useMetadataContext } from "./providers/MetadataProvider"
```

## TokenContent

This component will be reused, it displays the Card content with the image according to the token, and a customizable `extra` field.&#x20;

```tsx
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
```

## Token

The Card itself will be defined as follows. Actions is also a customisable action set:&#x20;

```tsx
interface TokenProps {
  id: number
  actions?: React.ReactNode
  extra?: React.ReactNode
}

const Token = ({ id, actions, extra }: TokenProps) => {
  return (
    <Card sx={{ maxWidth: 200 }}>
      <TokenContent id={id} extra={extra} />
      <CardActions>{actions}</CardActions>
    </Card>
  )
}
```

## TokenList

To display a list of tokens, we create this component using a Grid:

```tsx
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
        <Token
          id={id}
          actions={actions && actions(id)}
          extra={extra && extra(id)}
        />
      </Grid>
    ))}
  </Grid>
)
```

## Export

Our token components are now ready to be reused:&#x20;

```tsx
export { Token, TokenList, TokenContent }
```
