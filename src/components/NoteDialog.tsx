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
      PaperProps={{
        sx: { overflow: "hidden" },
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
      <DialogContent
        sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          minRows={6}
          maxRows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          sx={{
            marginBottom: 2,
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fafafa",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              maxHeight: "300px",
              overflow: "auto",
            },
          }}
        />
        <Autocomplete
          options={COUNTRIES}
          value={country}
          onChange={(_, newValue) => setCountry(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              variant="outlined"
              required
              error={!country}
              helperText={!country ? "Country is required" : ""}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!text || !country}
        >
          {mode === "add" ? "Add Note" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDialog;
