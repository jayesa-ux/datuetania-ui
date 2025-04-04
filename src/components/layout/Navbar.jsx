import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleNavigate = (route) => {
    navigate(route);
    handleDrawerClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              onClick={() => handleNavigate("/")}
              sx={{ cursor: "pointer", ml: 1 }}
            >
              DATUETANIA
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <AccountCircleIcon sx={{ marginRight: 1, color: "white" }} />
            <Typography variant="body1" sx={{ color: "white" }}>
              Admin
            </Typography>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleMenuClose}>Perfil</MenuItem>
            <MenuItem onClick={handleMenuClose}>Configuración</MenuItem>
            <MenuItem onClick={handleMenuClose}>Cerrar Sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem button onClick={() => handleNavigate("/")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Hornos
              </Typography>
            </ListItem>
            <ListItem button onClick={() => handleNavigate("/Hornos1")}>
              <ListItemIcon>
                <FireplaceIcon />
              </ListItemIcon>
              <ListItemText primary="Hornos PIT" secondary="" />
            </ListItem>
            <ListItem button onClick={() => handleNavigate("/Hornos2")}>
              <ListItemIcon>
                <FireplaceIcon />
              </ListItemIcon>
              <ListItemText primary="Hornos EAF" secondary="" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
