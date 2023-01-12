import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import styled from "@emotion/styled";
import Link from "next/link";
import { useState } from "react";
import NavLinks from "../nav-links/NavLinks";

const StyledBar = styled(AppBar)`
  margin-bottom: 50px;
`;

const StyledButton = styled(IconButton)`
  color: white;
`;

const AppTitle = styled(Typography)`
  margin-left: 8px;
`;

const NavBar = () => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <StyledBar position="sticky">
        <Toolbar>
          <StyledButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </StyledButton>
          <Link href="/">
            <AppTitle>AQ Dashboard</AppTitle>
          </Link>
        </Toolbar>
      </StyledBar>
      <Drawer onClose={() => setOpen(false)} open={open}>
        <NavLinks />
      </Drawer>
    </Box>
  );
};

export default NavBar;
