import React from "react";
import { Paper, Box, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ExploreNotesSidebarProps = {
  onViewAll: () => void;
};

const PURPLE = "#667eea";

const ExploreNotesSidebar: React.FC<ExploreNotesSidebarProps> = ({
  onViewAll,
}) => {
  const { isLoggedIn } = useAuth();

  return (
    <Paper
      data-testid="sidebar"
      sx={{
        padding: "20px",
        borderRadius: 0,
        boxShadow: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "lightgray",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${PURPLE}30`,
          boxShadow: `0 2px 12px ${PURPLE}18`,
        }}
      >
        {/* Card header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PURPLE} 0%, #764ba2 100%)`,
            px: 2,
            py: 1.25,
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ color: "white", letterSpacing: 0.3 }}>
            📝 Get started
          </Typography>
        </Box>

        {/* Tips */}
        {[
          {
            icon: "🗺️",
            text: (
              <>
                <b>Click a country</b> on the map to discover a random article
                and save it as a note.
              </>
            ),
          },
          {
            icon: "✏️",
            text: (
              <>
                Use <b>Add Note</b> in the navbar to write a note manually.
              </>
            ),
          },
          {
            icon: "🔀",
            text: (
              <>
                Visit{" "}
                <Box
                  component="span"
                  onClick={onViewAll}
                  sx={{
                    color: PURPLE,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  All Notes
                </Box>{" "}
                and sort by <b>Random</b> to rediscover your notes.
              </>
            ),
          },
        ].map(({ icon, text }, i, arr) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.25,
              px: 2,
              py: 1.5,
              backgroundColor: "white",
              borderBottom: i < arr.length - 1 ? `1px solid ${PURPLE}18` : "none",
            }}
          >
            <Typography sx={{ fontSize: "1rem", lineHeight: 1.5, flexShrink: 0 }}>
              {icon}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>

      {!isLoggedIn && (
        <Box
          sx={{
            mb: 1.5,
            mt: "auto",
            p: 1.5,
            backgroundColor: "#fff8e1",
            borderRadius: 2,
            border: "1px solid #ffe082",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#795548", lineHeight: 1.5 }}
          >
            ⚠️ Notes are saved in your browser's local storage. Clearing your
            cache will erase them.{" "}
            <Link
              component={RouterLink}
              to="/register"
              fontWeight={600}
              sx={{ color: "#795548" }}
            >
              Register
            </Link>{" "}
            to save notes permanently.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ExploreNotesSidebar;
