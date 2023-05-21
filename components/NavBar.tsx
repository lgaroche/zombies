import Button from "@mui/material/Button"
import AppBar from "@mui/material/AppBar"
import Container from "@mui/material/Container"
import Toolbar from "@mui/material/Toolbar"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import MenuIcon from "@mui/icons-material/Menu"
import Box from "@mui/material/Box"
import { ClickAwayListener } from "@mui/material"
import { useRouter } from "next/router"
import { useWalletContext } from "./providers/WalletProvider"
import { CloseRounded } from "@mui/icons-material"

const Menu = () => {
  const { connect, disconnect, account } = useWalletContext()

  return (
    <>
      <Link href={"/drops"} style={{ textDecoration: "none" }}>
        <Button
          sx={{
            my: 2,
            color: "white",
            display: "block",
          }}
        >
          Drops
        </Button>
      </Link>

      <Link href="/market" style={{ textDecoration: "none" }}>
        <Button
          sx={{
            my: 2,
            color: "white",
            display: "block",
          }}
        >
          Market
        </Button>
      </Link>
      <Link href="/inventory" style={{ textDecoration: "none", flexGrow: 1 }}>
        <Button sx={{ my: 2, color: "white", display: "block", flexGrow: 1 }}>
          Inventory
        </Button>
      </Link>
      {account ? (
        <Button
          sx={{ my: 2, color: "white" }}
          onClick={disconnect}
          startIcon={<CloseRounded />}
        >
          {account.address.substring(0, 5)}...
          {account.address.substring(account.address.length - 5)}
        </Button>
      ) : (
        <Button sx={{ my: 2, color: "white" }} onClick={connect}>
          Connect wallet
        </Button>
      )}
    </>
  )
}

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    setMenuOpen(false)
  }, [router, setMenuOpen])

  const handleMenuClick = useCallback(() => {
    setMenuOpen((state) => !state)
  }, [])

  const handleClickAway = useCallback(() => {
    setMenuOpen(false)
  }, [])

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: { xs: "none", sm: "flex" } }}>
          <Menu />
        </Toolbar>
        <Toolbar disableGutters sx={{ display: { xs: "flex", sm: "none" } }}>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box>
              <Button
                onClick={handleMenuClick}
                sx={{ color: "white" }}
                startIcon={<MenuIcon />}
              >
                Menu
              </Button>
              {menuOpen && <Menu />}
            </Box>
          </ClickAwayListener>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default NavBar
