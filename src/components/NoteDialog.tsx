import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
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
  }, [note, mode, open]);

  const handleSave = () => {
    if (text && country) {
      const now = new Date();
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
      slotProps={{
        paper: { sx: { maxHeight: "90vh" } },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {mode === "add" ? "✏️ Add New Note" : "✏️ Edit Note"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ overflowY: "auto" }}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="note-dialog-title"
          sx={{
            marginTop: 2,
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fafafa",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            },
          }}
        />
        <TextField
          label="Content"
          variant="outlined"
          fullWidth
          multiline
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="note-dialog-content"
          required
          error={!text}
          helperText={!text ? "Content is required" : " "}
          sx={{
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fafafa",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            },
            "& .MuiInputBase-inputMultiline": {
              overflow: "auto !important",
            },
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
              error={!country}
              helperText={!country ? "Country is required" : " "}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                },
              }}
            />
          )}
          sx={{ marginBottom: 2 }}
        />
        <TagsSelect value={tags} onChange={setTags} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} data-testid="btn-note-dialog-cancel">Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!text || !country}
          data-testid="btn-note-dialog-save"
        >
          {mode === "add" ? "Add Note" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDialog;
