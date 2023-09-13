---
description: Page layout and navigation
---

# Layout

Let's start a basic web application with empty pages.

Create a file `./pages/_app.tsx`and start by including these imports:

```typescript
import useMediaQuery from "@mui/material/useMediaQuery"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useMemo } from 'react'
import type { AppProps } from "next/app"
```

It's 2023, so let's enable automatic dark mode, your eyes will thank you tonight. Add the base line and dark theme provider to the App:

```tsx
export default function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        {/* This is where all our providers will "wrap" the page component, for example: */}
        {/* <MyProvider> */}
        <Component {...pageProps} />
        {/* </MyProvider> *}
    </ThemeProvider>
  )
}
```

Now, create a `index.tsx` file to the `pages` folder:

```tsx
import React from "react"
import { Typography } from "@mui/material"

const Home = () => {
  return (
    <>
      <Typography variant="h4">TZombies</Typography>
    </>
  )
}

export default Home
```

To view your nascent app, run the `yarn dev` command in the `tzombies` folder. Navigate to locahost:3000 in your browser. You should see something like this:

![](<../.gitbook/assets/Screenshot 2023-07-09 at 7.22.08 PM.png>)

To enable navigation, let's add a NavBar. Create a folder `./components` and add a `./components/NavBar.tsx`. Start the file with the following imports:

```typescript
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
import { CloseRounded } from "@mui/icons-material"
```

There will be two versions of the menu, one when the view is small, as on a smartphone, and one for a desktop view, so let's create a Menu component that we'll reuse in our NavBar:

```tsx
const Menu = () => {
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
      <Button sx={{ my: 2, color: "white" }} onClick={() => {}}>
        Connect wallet
      </Button>
    </>
  )
}
```

And the actual NavBar:

```tsx
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
```

Add the NavBar to \_app.tsx with the following imports:

```tsx
import NavBar from '../components/NavBar'
/* Container is used to provide some space for the NavBar in this minimal UX design */
import Container from "@mui/material/Container"
```

And add the `NavBar` component to the return statement of the `App` function:

```tsx
return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <NavBar />
        <Container sx={{ mt: 12 }}>
          <Component {...pageProps} />
        </Container>
    </ThemeProvider>
  )
```

\
Check that the page opens and the NavBar works as expected. The Connect Wallet button has no effect yet, and navigating leads to 404 since we haven't created them yet.

Let's create them: add three new pages:

* `./pages/inventory.tsx`
* `./pages/drops.tsx`
* `./pages/market.tsx`

And implement empty components in them, like this example:&#x20;

```tsx
import React from "@emotion/react"
import { Typography } from "@mui/material"

const Inventory = () => {
  return (
    <>
      <Typography variant="h1">Inventory</Typography>
    </>
  )
}

export default Inventory
```
