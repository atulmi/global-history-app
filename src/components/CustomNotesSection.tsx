import React, { useState } from "react";
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import TagsSelect from "./TagsSelect";

type CustomNotesSectionProps = {
  onClose: () => void;
  onSaveNote: (text: string, tags: string[]) => void;
};

const PURPLE = "#667eea";
const PURPLE_DARK = "#764ba2";

const CustomNotesSection: React.FC<CustomNotesSectionProps> = ({
  onClose,
  onSaveNote,
}) => {
  const [noteText, setNoteText] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [savedOnce, setSavedOnce] = useState(false);

  const handleSave = () => {
    if (noteText.trim()) {
      onSaveNote(noteText, noteTags);
      setNoteText("");
      setNoteTags([]);
      setSavedOnce(true);
    }
  };

  return (
    <Box
      sx={{
        width: "320px",
        flexShrink: 0,
        overflowY: "auto",
        px: 2.5,
        py: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        borderRight: "1px solid rgba(102,126,234,0.2)",
      }}
    >
      {/* Caption row — matches "Article Summary" caption on right column */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            color: PURPLE_DARK,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          My Notes
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close notes panel"
          sx={{ p: 0, ml: 0.5, color: "text.secondary" }}
        >
          <CloseIcon sx={{ fontSize: "0.95rem" }} />
        </IconButton>
      </Box>

      <TextField
        multiline
        fullWidth
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Write your take, key points, or a summary of the article…"
        variant="outlined"
        sx={{
          "& .MuiInputBase-root": {
            alignItems: "flex-start",
            height: "360px",
            overflow: "hidden",
          },
          "& .MuiOutlinedInput-input": {
            lineHeight: 1.7,
            height: "100% !important",
            overflow: "auto !important",
            boxSizing: "border-box",
          },
        }}
      />

      <TagsSelect size="small" value={noteTags} onChange={setNoteTags} />

      <Box sx={{ mt: 1, pb: 3 }}>
        <Button
          variant="contained"
          startIcon={<NoteAddOutlinedIcon />}
          onClick={handleSave}
          disabled={!noteText.trim()}
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.85rem",
            background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
            boxShadow: "0 4px 14px rgba(102,126,234,0.4)",
            "&:hover": {
              background: `linear-gradient(135deg, #5a70d8 0%, #6a3f98 100%)`,
            },
            "&:disabled": {
              background: "#e0e0e8",
              boxShadow: "none",
              color: "#aaa",
            },
          }}
        >
          {savedOnce ? "Save another custom note" : "Save as Note"}
        </Button>
      </Box>
    </Box>
  );
};

export default CustomNotesSection;
