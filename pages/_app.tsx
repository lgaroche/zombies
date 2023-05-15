import { useMemo } from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

import "../styles/globals.css"
import type { AppProps } from "next/app"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import NavBar from "../components/NavBar"
import Container from "@mui/material/Container"
import { WalletProvider } from "../components/WalletProvider"
import { TzombiesProvider } from "../components/TzombiesProvider"
import { MarketProvider } from "../components/MarketProvider"

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
      <WalletProvider>
        <TzombiesProvider>
          <MarketProvider>
            <NavBar />
            <Container sx={{ mt: 12 }}>
              <Component {...pageProps} />
            </Container>
          </MarketProvider>
        </TzombiesProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}
