import React from "react";
import { Paper, Box, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Note } from "../types/Note";

type ExploreNotesSidebarProps = {
  notes: Note[];
  onViewAll: () => void;
};

const PURPLE = "#667eea";

const ExploreNotesSidebar: React.FC<ExploreNotesSidebarProps> = ({
  notes,
  onViewAll,
}) => {
  const { isLoggedIn } = useAuth();

  const recentNotes = [...notes]
    .filter((n) => !n.isArchived)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  const hasNotes = recentNotes.length > 0;

  const formatTimestamp = (date: Date): string => {
    const d = new Date(date);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    if (d >= startOfToday) {
      return `Today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (d >= startOfYesterday) {
      return `Yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Paper
      component="aside"
      role="complementary"
      aria-label="Recent notes sidebar"
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
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: "white", letterSpacing: 0.3 }}
          >
            {hasNotes ? "📝 Recent Notes" : "📝 Get started"}
          </Typography>
        </Box>

        {hasNotes ? (
          <>
            {recentNotes.map((note, i) => (
              <Box
                key={note.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                  px: 2,
                  py: 1.5,
                  backgroundColor: "white",
                  borderBottom:
                    i < recentNotes.length - 1
                      ? `1px solid ${PURPLE}18`
                      : "none",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: "#1a1a2e",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {note.title || note.country || "Untitled"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                    lineHeight: 1.5,
                  }}
                >
                  {note.text.replace(/<[^>]+>/g, "")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: `${PURPLE}99`, mt: 0.25 }}
                >
                  {formatTimestamp(note.updatedAt)}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{
                px: 2,
                py: 1.25,
                backgroundColor: `white`,
                borderTop: `1px solid ${PURPLE}18`,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                <Box
                  component="span"
                  onClick={onViewAll}
                  sx={{
                    color: PURPLE,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onViewAll();
                    }
                  }}
                >
                  My Notes
                </Box>{" "}
                — view and manage your full collection.
              </Typography>
            </Box>
          </>
        ) : (
          <>
            {[
              {
                icon: "🗺️",
                text: (
                  <>
                    <b>Click a country</b> on the map to discover a random
                    article and save it as a note.
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
                      My Notes
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
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${PURPLE}18` : "none",
                }}
              >
                <Typography
                  sx={{ fontSize: "1rem", lineHeight: 1.5, flexShrink: 0 }}
                >
                  {icon}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </>
        )}
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
