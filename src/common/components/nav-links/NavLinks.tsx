import Link from "next/link";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

const StyledContainer = styled(Box)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 16px;
  a {
    font-size: 16px;
    font-weight: bold;
    color: #1976d2;
    text-align: center;
    &:not(last-child) {
      margin-bottom: 8px;
    }
  }
`;

const NavLinks = () => {
  return (
    <StyledContainer>
      <Link href="https://github.com/secret-shober/aq-dashboard">
        Source Code
      </Link>
      <Link href="/gold-contest">Gold Contest</Link>
      <Link href="/gold-prediction">Gold Contest Prediction</Link>
      <Link href="/war-zone">War Zone</Link>
    </StyledContainer>
  );
};

export default NavLinks;
