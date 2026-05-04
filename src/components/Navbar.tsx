import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  onAddNote: () => void;
  onNavigateBack?: () => void;
  onNavigateToAllNotes?: () => void;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
};

const btnSx = {
  backgroundColor: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(10px)",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
};

const Navbar: React.FC<NavbarProps> = ({
  onAddNote,
  onNavigateBack,
  onNavigateToAllNotes,
  showSearch = false,
  searchTerm = "",
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userAnchor);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuAnchor(null);
  };

  return (
    <AppBar
      component="header"
      position="static"
      data-testid="navbar"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "none",
        margin: 0,
      }}
    >
      <Toolbar>
        {onNavigateBack && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onNavigateBack}
            sx={{ marginRight: 2 }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Typography
          variant="h5"
          onClick={() => navigate("/")}
          sx={{
            flexGrow: showSearch ? 0 : 1,
            fontWeight: 700,
            letterSpacing: "0.5px",
            cursor: "pointer",
          }}
        >
          🌍 GlobalHistory
        </Typography>

        {showSearch && onSearchChange && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              px: 4,
            }}
          >
            <TextField
              label="Search Notes"
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                backgroundColor: "white",
                borderRadius: 1,
                maxWidth: "600px",
              }}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Box>
        )}

        {isMobile ? (
          <>
            <Tooltip title="Menu">
              <IconButton
                color="inherit"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label="Open navigation menu"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="nav-menu"
              anchorEl={menuAnchor}
              open={menuOpen}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  onAddNote();
                  setMenuAnchor(null);
                }}
              >
                <AddIcon fontSize="small" sx={{ mr: 1 }} /> Add Note
              </MenuItem>
              {onNavigateToAllNotes && (
                <MenuItem
                  onClick={() => {
                    onNavigateToAllNotes();
                    setMenuAnchor(null);
                  }}
                >
                  <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> My Notes
                </MenuItem>
              )}
              <Divider />
              {isLoggedIn ? (
                [
                  <MenuItem key="user" disabled>
                    <Typography variant="body2">{user?.name}</Typography>
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogout}>
                    Logout
                  </MenuItem>,
                ]
              ) : (
                <MenuItem
                  onClick={() => {
                    navigate("/login");
                    setMenuAnchor(null);
                  }}
                >
                  Login
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <>
            {onNavigateToAllNotes && (
              <Button
                variant="contained"
                data-testid="btn-all-notes"
                startIcon={<ViewListIcon />}
                onClick={onNavigateToAllNotes}
                sx={{ marginRight: 2, ...btnSx }}
              >
                My Notes
              </Button>
            )}

            <Button
              variant="contained"
              data-testid="btn-add-note"
              startIcon={<AddIcon />}
              onClick={onAddNote}
              sx={{ marginRight: 2, ...btnSx }}
            >
              Add Note
            </Button>

            {isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  onClick={(e) => setUserAnchor(e.currentTarget)}
                  startIcon={<PersonIcon />}
                  endIcon={<KeyboardArrowDownIcon />}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  sx={{ ...btnSx, textTransform: "none" }}
                >
                  {user?.name}
                </Button>
                <Menu
                  anchorEl={userAnchor}
                  open={userMenuOpen}
                  onClose={() => setUserAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={btnSx}
              >
                Login
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
