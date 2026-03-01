import React, { useState, useMemo } from "react";
import { Paper, Box, Typography, List, Button } from "@mui/material";
import { type Note } from "../types/Note";
import NoteCard from "./NoteCard";

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
                padding: "20px",
                backgroundColor: "rgba(255, 255, 255, 1)",
                boxShadow: "0 44px 34px rgba(0,0,0,0.1)",
                borderRadius: 2,
                border: "2px solid black",
              }}
            >
              <Typography variant="body2" sx={{ color: "black" }}>
                <b>No notes added yet</b>
                <br /> <br />
                You must be new here! Here are some ways to get started:
                <ol>
                  <li>
                    Click on a country to fetch random historical facts about
                    that country, and save those facts as a note
                  </li>
                  <li>
                    Click the "Add Note" button on the navbar to add a note
                    manually
                  </li>
                </ol>
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
