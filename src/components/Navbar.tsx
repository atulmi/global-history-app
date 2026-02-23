import React from "react";
import { AppBar, Toolbar, Typography, Button, TextField, Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  onAddNote: () => void;
  onNavigateBack?: () => void;
  onNavigateToAllNotes?: () => void;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
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

  return (
    <AppBar
      position="static"
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

        {onNavigateToAllNotes && (
          <Button
            variant="contained"
            startIcon={<ViewListIcon />}
            onClick={onNavigateToAllNotes}
            sx={{
              marginRight: 2,
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            All Notes
          </Button>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddNote}
          sx={{
            marginRight: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          Add Note
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
