import React, { useState, useMemo } from "react";
import { Paper, Box, Typography, List, Button, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { type Note } from "../types/Note";
import NoteCard from "./NoteCard";
import { useAuth } from "../context/AuthContext";

type DisplayExploreNoteMode = "recent" | "random";

type ExploreNotesSidebarProps = {
  notes: Note[];
  totalNotes: number;
  onEditNote: (note: Note, id: string) => void;
  onDeleteNote: (id: string) => void;
  onViewAll: () => void;
};

const PURPLE = "#667eea";

const ExploreNotesSidebar: React.FC<ExploreNotesSidebarProps> = ({
  notes,
  totalNotes,
  onEditNote,
  onDeleteNote,
  onViewAll,
}) => {
  const { isLoggedIn } = useAuth();
  const [displayMode, setDisplayMode] =
    useState<DisplayExploreNoteMode>("recent");

  const displayedEntries = useMemo(() => {
    if (displayMode === "recent") {
      return notes.slice(0, 5);
    }
    // Random mode: shuffle a copy and take the first 5.
    return [...notes].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [notes, displayMode]);

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
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          mb: 1.5,
          p: 1,
          flexShrink: 0,
          border: "2px solid black",
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ color: "black" }}>
          📝 Explore your notes
        </Typography>
      </Box>

      {/* Mode tabs — both always visible; active one gets a purple border */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexShrink: 0 }}>
        {(
          [
            { value: "recent", label: "Recent" },
            { value: "random", label: "Random" },
          ] as { value: DisplayExploreNoteMode; label: string }[]
        ).map(({ value, label }) => {
          const active = displayMode === value;
          return (
            <Box
              key={value}
              onClick={() => setDisplayMode(value)}
              sx={{
                flex: 1,
                textAlign: "center",
                py: 0.75,
                px: 0.5,
                borderRadius: 2,
                border: active ? `2px solid ${PURPLE}` : "2px solid #ccc",
                backgroundColor: active ? `${PURPLE}18` : "white",
                cursor: "pointer",
                userSelect: "none",
                transition: "border-color 0.15s, background-color 0.15s",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={active ? 700 : 400}
                sx={{ color: active ? PURPLE : "text.secondary" }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {!isLoggedIn && (
        <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "#fff8e1", borderRadius: 2, border: "1px solid #ffe082", flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: "#795548", lineHeight: 1.5 }}>
            ⚠️ Notes are saved in your browser's local storage. Clearing your cache will erase them.{" "}
            <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: "#795548" }}>
              Register
            </Link>{" "}
            to save notes permanently.
          </Typography>
        </Box>
      )}

      {notes.length > 0 && (
        <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "white", borderRadius: 2, border: `1px solid ${PURPLE}33`, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
            👋 Welcome back! Here are notes you've saved:
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
        <List dense>
          {displayedEntries.map((note) => (
            <Box key={note.id} data-testid="sidebar-note-card">
              <NoteCard
                note={note}
                onEdit={() => onEditNote(note, note.id)}
                onDelete={() => onDeleteNote(note.id)}
                compact
              />
            </Box>
          ))}
          {notes.length === 0 && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "white",
                borderRadius: 2,
                border: `2px dashed ${PURPLE}`,
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                No notes yet!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                🗺️ <b>Click a country</b> on the map to discover a random article and save it as a note.
                <br /><br />
                ✏️ Or use <b>Add Note</b> in the navbar to write one manually.
              </Typography>
            </Box>
          )}
        </List>
        {totalNotes > 5 && (
          <Button
            variant="contained"
            fullWidth
            onClick={onViewAll}
            sx={{
              mt: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: PURPLE,
              fontWeight: 600,
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
            }}
          >
            View All ({totalNotes})
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ExploreNotesSidebar;
