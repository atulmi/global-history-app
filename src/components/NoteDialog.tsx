import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { COUNTRIES } from "../data/countries";
import { type Note } from "../types/Note";
import TagsSelect from "./TagsSelect";

/**
 * Modal dialog for creating or editing a note.
 *
 * - "add" mode: form starts blank; createdAt is set to now on save.
 * - "edit" mode: form is pre-populated from the provided note; createdAt is
 *   preserved and only updatedAt is refreshed on save.
 *
 * Both text content and country are required; the Save button is disabled and
 * an inline error is shown until both fields are filled.
 */
type NoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  note?: Note | null;
  mode: "add" | "edit";
};

const PURPLE = "#667eea";
const PURPLE_DARK = "#764ba2";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fafafe",
    transition: "box-shadow 0.2s",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: PURPLE,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: PURPLE,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${PURPLE}22`,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: PURPLE,
  },
};

const NoteDialog: React.FC<NoteDialogProps> = ({
  open,
  onClose,
  onSave,
  note,
  mode,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (note && mode === "edit") {
      setTitle(note.title || "");
      setText(note.text);
      setCountry(note.country || null);
      setTags(note.tags);
    } else if (mode === "add") {
      setTitle("");
      setText("");
      setCountry(null);
      setTags([]);
    }
    setAttempted(false);
  }, [note, mode, open]);

  const handleSave = () => {
    if (!text || !country) {
      setAttempted(true);
      return;
    }
    if (text && country) {
      const now = new Date();

      console.log("Note to update: ", note);

      const savedNote: Note = {
        id: note?.id ?? "",
        text,
        title: title || undefined,
        tags,
        country,
        createdAt: note?.createdAt || now,
        updatedAt: now,
        isPinned: note?.isPinned || false,
        isArchived: note?.isArchived || false,
        source: note?.source,
      };
      onSave(savedNote);
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setText("");
    setCountry(null);
    setTags([]);
    onClose();
  };

  const isAdd = mode === "add";

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleClose();
        }
      }}
      maxWidth="md"
      fullWidth
      data-testid="note-dialog"
      aria-labelledby="note-dialog-heading"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
            maxHeight: "90vh",
            boxShadow:
              "0 24px 60px rgba(102, 126, 234, 0.25), 0 8px 20px rgba(0,0,0,0.12)",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)`,
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {isAdd ? (
          <NoteAddOutlinedIcon
            sx={{ color: "rgba(255,255,255,0.9)", fontSize: 26 }}
          />
        ) : (
          <EditNoteOutlinedIcon
            sx={{ color: "rgba(255,255,255,0.9)", fontSize: 26 }}
          />
        )}
        <Typography
          id="note-dialog-heading"
          variant="h6"
          fontWeight={700}
          sx={{ color: "#fff", letterSpacing: 0.2, flex: 1 }}
        >
          {isAdd ? "Add New Note" : "Edit Note"}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close dialog"
          sx={{
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          overflowY: "auto",
          backgroundColor: "#fdfdff",
        }}
      >
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title…"
          data-testid="note-dialog-title"
          sx={{ ...fieldSx, mb: 2.5 }}
        />
        <TextField
          label="Content"
          variant="outlined"
          fullWidth
          multiline
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your note here…"
          data-testid="note-dialog-content"
          required
          error={attempted && !text}
          helperText={attempted && !text ? "Content is required" : " "}
          sx={{
            ...fieldSx,
            mb: 1,
            "& .MuiInputBase-inputMultiline": { overflow: "auto !important" },
          }}
        />
        <Autocomplete
          options={COUNTRIES}
          value={country}
          onChange={(_, newValue) => setCountry(newValue)}
          data-testid="note-dialog-country"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              variant="outlined"
              required
              error={attempted && !country}
              helperText={attempted && !country ? "Country is required" : " "}
              sx={fieldSx}
            />
          )}
          sx={{ mb: 1 }}
        />
        <TagsSelect value={tags} onChange={setTags} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          backgroundColor: "#fdfdff",
          borderTop: "1px solid rgba(102, 126, 234, 0.1)",
        }}
      >
        <Button
          onClick={handleClose}
          data-testid="btn-note-dialog-cancel"
          sx={{
            color: "#888",
            borderRadius: "10px",
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#f0f0f8", color: "#555" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          data-testid="btn-note-dialog-save"
          sx={{
            background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
            borderRadius: "10px",
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              background: `linear-gradient(135deg, #5a70d8 0%, #6a3f98 100%)`,
              boxShadow: "0 6px 18px rgba(102, 126, 234, 0.5)",
            },
            "&:disabled": {
              background: "#e0e0e8",
              boxShadow: "none",
              color: "#aaa",
            },
          }}
        >
          {isAdd ? "Submit Note" : "Save Changes"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default NoteDialog;
