import { Box, Typography } from "@mui/material";
import { GetSignature } from "@/app/GetSignature";

export default function Home() {
  return (
    <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" padding="0 15px">
      <Typography variant="h1" mb="10px" textAlign="center">
        Here you can get signature for testing backend on Swagger.
        It was tested with Metamask only, so please use this wallet to get signature
      </Typography>
      <GetSignature />
    </Box>
  );
}
