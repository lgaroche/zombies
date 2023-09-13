import React from "react"
import { Typography, Button } from "@mui/material"
import Link from "next/link"

const Home = () => {
  return (
    <>
      <Typography variant="h4">TZombies</Typography>
      <Link href="/drops">
        <Button>Go claim your zombies!</Button>
      </Link>
    </>
  )
}

export default Home
