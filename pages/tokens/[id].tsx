import React from "react";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";

const TokenDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const tokenId = Number(id);

  if (isNaN(tokenId)) {
    return <>Not found</>;
  }
  return <Typography variant="h6">{tokenId}</Typography>;
};

export default TokenDetails;
