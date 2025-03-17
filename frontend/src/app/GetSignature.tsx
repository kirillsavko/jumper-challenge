"use client";
import { FC, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ethers } from "ethers";

export const GetSignature: FC = () => {
  const [messageToSign, setMessageToSign] = useState("")
  const [signedResult, setSignedResult] = useState<{
    address: string, signature: string
  }>({ address: "", signature: "" })

  async function signMessage() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const signature = await signer.signMessage(messageToSign);

    setSignedResult({ signature: signature, address: signer.address })
  }

  useEffect(() => {
    fetch("http://localhost:8080/auth/message")
      .then(res => res.json())
      .then(res => setMessageToSign(res.responseObject.message))
  }, []);

  return <>
    <Box mb="20px">
      <Button onClick={signMessage} variant="contained" disabled={!messageToSign}>Get signature</Button>
    </Box>
    {signedResult.address && signedResult.signature && <>
      <Typography variant="h6">Use this data</Typography>
      <Typography>Account:</Typography>
      <Typography style={{ wordBreak: "break-all" }} color="blue">{signedResult.address}</Typography>
      <Typography>Signature:</Typography>
      <Typography style={{ wordBreak: "break-all" }} color="blue">{signedResult.signature}</Typography>
    </>}
  </>
}
