import React from "react";
import { Paper, Box, Typography, List, Button } from "@mui/material";
import { type Note } from "../types/Note";
import NoteCard from "./NoteCard";

type RecentNotesSidebarProps = {
  notes: Note[];
  totalNotes: number;
  onEditNote: (note: Note, index: number) => void;
  onDeleteNote: (index: number) => void;
  onViewAll: () => void;
};

const RecentNotesSidebar: React.FC<RecentNotesSidebarProps> = ({
  notes,
  totalNotes,
  onEditNote,
  onDeleteNote,
  onViewAll,
}) => {
  return (
    <Paper
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: 2,
          mb: 2,
          flexShrink: 0,
          border: "2px solid black",
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ color: "black" }}>
          📝 Recent Notes
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
        <List dense>
          {notes.map((note, index) => (
            <NoteCard
              key={index}
              note={note}
              onEdit={() => onEditNote(note, index)}
              onDelete={() => onDeleteNote(index)}
              compact
            />
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
              color: "#667eea",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            View All ({totalNotes})
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default RecentNotesSidebar;
