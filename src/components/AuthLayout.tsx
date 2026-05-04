import React from "react";
import { Box, Paper, Link, Typography } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import Navbar from "./Navbar";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        onAddNote={() => navigate("/")}
        onNavigateToAllNotes={() => navigate("/all-notes")}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {/* Globe background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "min(90vh, 90vw)",
              height: "min(90vh, 90vw)",
              borderRadius: "50%",
              overflow: "hidden",
              background:
                "radial-gradient(circle at 40% 40%, #bfdbfe, #93c5fd)",
              flexShrink: 0,
            }}
          >
            <ComposableMap
              projection="geoOrthographic"
              projectionConfig={{ rotate: [30, -10, 0], scale: 420 }}
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: "#667eea",
                          stroke: "#764ba2",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: "#667eea",
                          stroke: "#764ba2",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        pressed: { fill: "#667eea", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
          </Box>
        </Box>

        {/* Card centred over globe */}
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            width: "100%",
            maxWidth: 420,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              height: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />
          <Box sx={{ p: 4 }}>
            <Link
              component={RouterLink}
              to="/"
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                mb: 2,
                width: "fit-content",
                color: "text.secondary",
              }}
            >
              <HomeIcon sx={{ fontSize: 13 }} /> Back to home
            </Link>
            <Typography variant="h5" fontWeight={700} mb={3}>
              {title}
            </Typography>
            {children}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthLayout;
