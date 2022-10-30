import Button from "@mui/material/Button"
import AppBar from "@mui/material/AppBar"
import Container from "@mui/material/Container"
import Toolbar from "@mui/material/Toolbar"

export default function Home() {
  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Button
            sx={{
              my: 2,
              color: "white",
              display: "block",
            }}
          >
            Drops
          </Button>
          <Button sx={{ my: 2, color: "white", display: "block" }}>
            Market
          </Button>
          <Button sx={{ my: 2, color: "white", display: "block" }}>
            Inventory
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
