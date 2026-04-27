import React from "react";
import { AppBar, Toolbar, Typography, Box, Paper, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <AppBar position="static"
        sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", boxShadow: "none" }}>
        <Toolbar>
          <Typography variant="h5" fontWeight={700} letterSpacing="0.5px"
            sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            🌍 GlobalHistory
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Link component={RouterLink} to="/" variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5, width: "fit-content" }}>
            <HomeIcon fontSize="small" /> Back to home
          </Link>
          <Paper elevation={3} sx={{ borderRadius: 3, p: 4 }}>
            {children}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;