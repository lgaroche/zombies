import React from "react"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import { Grid } from "@mui/material"

enum CardMode {
  None,
  Claim,
  Buy,
}

interface TokenProps {
  id: number
  mode: CardMode
  extra?: React.ReactNode
  onClick: () => void
}

const images = [
  "https://openai-labs-public-images-prod.azureedge.net/user-CahPgAlHwKFnBxFuXmjpkw22/generations/generation-ry5oi5BCBGmMHO1x3fIjl1Me/image.webp",
  "https://openai-labs-public-images-prod.azureedge.net/user-CahPgAlHwKFnBxFuXmjpkw22/generations/generation-SsCT87aCFDaX6jADsUThlicN/image.webp",
]

const TokenContent = ({
  id,
  extra,
}: {
  id: number
  extra?: React.ReactNode
}) => (
  <>
    <CardMedia component="img" height="200" image={images[id % 2]} />
    <CardContent>
      Tzombie&nbsp;
      {<span>#{id}</span>}
      {extra}
    </CardContent>
  </>
)

const Token = ({ id, mode, extra, onClick }: TokenProps) => {
  return (
    <Card sx={{ maxWidth: 200 }}>
      <TokenContent id={id} extra={extra} />

      <CardActions>
        {mode === CardMode.Claim && <Button onClick={onClick}>Claim</Button>}
      </CardActions>
    </Card>
  )
}

interface TokenListProps {
  tokens: number[]
  mode: CardMode
  onClick?: (id: number) => void
  extra?: (id: number) => React.ReactNode
}

const TokenList = ({ tokens, mode, onClick, extra }: TokenListProps) => (
  <Grid container spacing={2}>
    {tokens.map((id) => (
      <Grid item key={id}>
        <Token
          onClick={() => onClick?.(id)}
          id={id}
          mode={mode}
          extra={extra && extra(id)}
        />
      </Grid>
    ))}
  </Grid>
)

export { Token, TokenList, CardMode }
