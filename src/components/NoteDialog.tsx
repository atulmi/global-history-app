import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import QuillEditor from "./QuillEditor";
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
type NoteInitialValues = {
  title?: string;
  text?: string;
  country?: string;
  source?: string;
};

type NoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  note?: Note | null;
  mode: "add" | "edit";
  /** Pre-populates the form when opening in add mode (e.g. from a Wikipedia article). */
  initialValues?: NoteInitialValues;
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
  initialValues,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (note && mode === "edit") {
      setTitle(note.title || "");
      setText(note.text);
      setCountry(note.country || null);
      setTags(note.tags);
      setSource(note.source);
    } else if (mode === "add") {
      setTitle(initialValues?.title ?? "");
      setText(initialValues?.text ?? "");
      setCountry(initialValues?.country ?? null);
      setTags([]);
      setSource(initialValues?.source);
    }
    setAttempted(false);
  }, [note, mode, open, initialValues]);

  const isContentEmpty = !text || text === "<p><br></p>";

  const handleSave = () => {
    if (isContentEmpty || !country) {
      setAttempted(true);
      return;
    }
    if (!isContentEmpty && country) {
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
        source,
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
        paper: { sx: { borderRadius: "18px", overflow: "hidden", minHeight: "60vh", maxHeight: "90vh" } },
        backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.75)" } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "#667eea",
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
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title…"
          data-testid="note-dialog-title"
          sx={{ ...fieldSx, mb: 1.5 }}
        />
        <Box sx={{ mb: 1, mt: 1 }}>
          <Box
            sx={{
              "& .ql-toolbar.ql-snow": {
                borderRadius: "10px 10px 0 0",
                background: "#f0f0f0",
              },
              "& .ql-container.ql-snow": {
                borderRadius: "0 0 10px 10px",
                background: "#fff",
                border:
                  attempted && isContentEmpty ? "1px solid #d32f2f" : undefined,
              },
              "& .ql-container": { fontSize: "0.875rem", height: "170px" },
              "& .ql-editor": { lineHeight: 1.6, overflowY: "auto" },
            }}
          >
            <QuillEditor
              value={text}
              onChange={setText}
              data-testid="note-dialog-content"
            />
          </Box>
          {attempted && isContentEmpty && (
            <Typography
              variant="caption"
              color="error"
              sx={{ ml: 1.5, mt: 0.5, display: "block" }}
            >
              Content is required
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            mt: 3,
          }}
        >
          <Autocomplete
            options={COUNTRIES}
            value={country}
            onChange={(_, newValue) => setCountry(newValue)}
            data-testid="note-dialog-country"
            size="small"
            sx={{ flex: 1 }}
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
          />
          <Box sx={{ flex: 1 }}>
            <TagsSelect size="small" value={tags} onChange={setTags} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
          </Box>
        </Box>
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
          variant="outlined"
          data-testid="btn-note-dialog-cancel"
          sx={{
            borderColor: PURPLE,
            color: PURPLE,
            borderRadius: "10px",
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: `${PURPLE}12`, borderColor: PURPLE_DARK, color: PURPLE_DARK },
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
