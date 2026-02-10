import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Paper,
  TextField,
  List,
  ListItem,
  Button,
  Box,
  Alert,
  Link,
  Chip,
  Drawer,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import WorldMap from "./components/WorldMap";
import {
  fetchRandomCountryHistory,
  type WikipediaArticle,
} from "./services/wikipediaApi";
import { COUNTRIES, TAG_CATEGORIES } from "./data/countries";

type Note = {
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  country?: string;
  source?: string; // Wikipedia URL if from Wikipedia
  isPinned?: boolean;
  isArchived?: boolean;
};

type NotesProps = {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (index: number, note: Note) => void;
  deleteNote: (index: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onOpenAddDialog: () => void;
};

const Notes: React.FC<NotesProps> = ({
  notes,
  addNote,
  updateNote,
  deleteNote,
  searchTerm,
  setSearchTerm,
  addDialogOpen,
  setAddDialogOpen,
  onOpenAddDialog,
}) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Wikipedia integration state
  const [currentArticle, setCurrentArticle] = useState<WikipediaArticle | null>(
    null,
  );
  const [editedArticleText, setEditedArticleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTags, setDrawerTags] = useState<string[]>([]);
  const [drawerTagsOpen, setDrawerTagsOpen] = useState(false);

  // Add note state
  const [addTitle, setAddTitle] = useState("");
  const [addText, setAddText] = useState("");
  const [addCountry, setAddCountry] = useState<string | null>(null);
  const [addTags, setAddTags] = useState<string[]>([]);

  // Edit note state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCountry, setEditCountry] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteIndex, setDeletingNoteIndex] = useState<number | null>(
    null,
  );

  // Success message state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddNote = () => {
    if (addText && addCountry) {
      const now = new Date();
      const note: Note = {
        text: addText,
        title: addTitle || undefined,
        tags: addTags,
        country: addCountry,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        isArchived: false,
      };
      addNote(note);
      setAddDialogOpen(false);
      setAddTitle("");
      setAddText("");
      setAddCountry(null);
      setAddTags([]);
      setSuccessMessage("Note successfully saved!");
      setSuccessOpen(true);
    }
  };

  const handleCountryClick = async (countryName: string) => {
    setSelectedCountry(countryName);
    setDrawerOpen(true);
    setLoading(true);
    setError(null);
    setCurrentArticle(null);
    setEditedArticleText("");
    setDrawerTags([]);
    try {
      const article = await fetchRandomCountryHistory(countryName);
      setCurrentArticle(article);
      setEditedArticleText(article.extract);
    } catch (err) {
      setError(`Failed to fetch article for ${countryName}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadArticle = async () => {
    if (selectedCountry) {
      setLoading(true);
      setError(null);
      setCurrentArticle(null);
      setEditedArticleText("");
      try {
        const article = await fetchRandomCountryHistory(selectedCountry);
        setCurrentArticle(article);
        setEditedArticleText(article.extract);
      } catch (err) {
        setError(`Failed to fetch article for ${selectedCountry}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveArticleAsNote = () => {
    if (currentArticle) {
      const now = new Date();
      const note: Note = {
        title: currentArticle.title,
        text: editedArticleText,
        tags: drawerTags,
        country: currentArticle.country,
        source: currentArticle.url,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        isArchived: false,
      };
      addNote(note);
      setDrawerOpen(false);
      setCurrentArticle(null);
      setEditedArticleText("");
      setDrawerTags([]);
      setSuccessMessage("Note successfully saved!");
      setSuccessOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentArticle(null);
    setEditedArticleText("");
    setError(null);
    setDrawerTags([]);
  };

  const handleEditNote = (note: Note, index: number) => {
    setEditingNote({ ...note, index } as any);
    setEditTitle(note.title || "");
    setEditText(note.text);
    setEditCountry(note.country || null);
    setEditTags(note.tags);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingNote) {
      const index = (editingNote as any).index;
      const updatedNote: Note = {
        ...editingNote,
        title: editTitle || undefined,
        text: editText,
        tags: editTags,
        country: editCountry || undefined,
        updatedAt: new Date(),
      };
      updateNote(index, updatedNote);
      setEditDialogOpen(false);
      setEditingNote(null);
      setEditTags([]);
      setEditCountry(null);
      setSuccessMessage("Note successfully updated!");
      setSuccessOpen(true);
    }
  };

  const handleDeleteNote = (index: number) => {
    setDeletingNoteIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (deletingNoteIndex !== null) {
      deleteNote(deletingNoteIndex);
      setDeleteDialogOpen(false);
      setDeletingNoteIndex(null);
    }
  };

  const cancelDeleteNote = () => {
    setDeleteDialogOpen(false);
    setDeletingNoteIndex(null);
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingNote(null);
    setEditTitle("");
    setEditText("");
    setEditTags([]);
    setEditCountry(null);
  };

  const handleCancelAdd = () => {
    setAddDialogOpen(false);
    setAddTitle("");
    setAddText("");
    setAddCountry(null);
    setAddTags([]);
  };

  // Get 5 most recent notes for sidebar
  const recentNotes = notes.slice(0, 5);

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: 0,
      }}
    >
      {/* Beautiful Navbar */}
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "none",
          margin: 0,
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            🌍 GlobalHistory
          </Typography>

          <Button
            variant="contained"
            startIcon={<ViewListIcon />}
            onClick={() => navigate("/all-notes")}
            sx={{
              marginRight: 2,
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            All Notes
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onOpenAddDialog}
            sx={{
              marginRight: 2,
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            Add Note
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{ flexGrow: 1, overflow: "hidden", display: "flex", width: "100%" }}
      >
        <Grid
          container
          spacing={0}
          sx={{ height: "100%", margin: 0, width: "100%" }}
        >
          {/* Left Sidebar - Recent Notes */}
          <Grid size={2} sx={{ height: "100%" }}>
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
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "black" }}
                >
                  📝 Recent Notes
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
                <List dense>
                  {recentNotes.map((note, index) => {
                    return (
                      <ListItem
                        key={index}
                        onClick={() => handleEditNote(note, index)}
                        sx={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          mb: 1,
                          p: 1.5,
                          border: "2px solid black",
                          borderRadius: 2,
                          position: "relative",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                          },
                          "&:hover .note-actions": {
                            opacity: 1,
                          },
                        }}
                      >
                        {/* Header: Title + Action Icons */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            width: "100%",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color: "#333",
                              flexGrow: 1,
                              pr: 1,
                            }}
                          >
                            {note.title || "Untitled"}
                          </Typography>
                          <Box
                            className="note-actions"
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              opacity: 0.7,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note, index);
                              }}
                              sx={{ padding: "2px" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(index);
                              }}
                              sx={{ padding: "2px" }}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Country Badge */}
                        {note.country && (
                          <Box sx={{ mb: 0.5, width: "100%" }}>
                            <Chip
                              label={note.country}
                              size="small"
                              color="primary"
                              sx={{ height: "20px", fontSize: "0.7rem" }}
                            />
                          </Box>
                        )}

                        {/* Text Preview */}
                        <Typography
                          variant="caption"
                          sx={{
                            width: "100%",
                            color: "#666",
                            mb: 0.5,
                          }}
                        >
                          {note.text.substring(0, 60)}...
                        </Typography>

                        {/* Date Information */}
                        <Typography
                          variant="caption"
                          sx={{
                            width: "100%",
                            color: "#999",
                            fontSize: "0.65rem",
                          }}
                        >
                          {note.updatedAt.getTime() !== note.createdAt.getTime()
                            ? `Updated ${note.updatedAt.toLocaleString()}`
                            : "Created " + note.createdAt.toLocaleString()}
                        </Typography>
                      </ListItem>
                    );
                  })}
                  {recentNotes.length === 0 && (
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
                            Click on a country to fetch random historical facts
                            about that country, and save those facts as a note
                          </li>
                          <li>
                            Click the "Add Note" button on the navbar to add a
                            note manually
                          </li>
                        </ol>
                      </Typography>
                    </Box>
                  )}
                </List>
                {notes.length > 5 && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/all-notes")}
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
                    View All ({notes.length})
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Main Content Area - World Map */}
          <Grid size={10} sx={{ height: "100%" }}>
            <Paper
              sx={{
                padding: "20px",
                borderRadius: 0,
                boxShadow: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                🌍 Explore Global History
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Click any country to discover random Wikipedia articles about
                that country and its history
              </Typography>
              <Box>
                <WorldMap onCountryClick={handleCountryClick} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Wikipedia Article Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "500px" },
            padding: "20px",
            background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            {currentArticle
              ? currentArticle.title
              : "Loading article on " + selectedCountry + "..."}
          </Typography>
          <IconButton onClick={handleCloseDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ marginTop: 2 }} fontWeight={500}>
              Loading article...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ marginBottom: "20px" }}>
            {error}
          </Alert>
        )}

        {currentArticle && !loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {currentArticle.country && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Chip
                  label={currentArticle.country}
                  color="primary"
                  size="small"
                />
                <Chip
                  label="Load New Article"
                  icon={<RefreshIcon />}
                  onClick={handleReloadArticle}
                  color="warning"
                  size="small"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />
              </Box>
            )}
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={editedArticleText}
              onChange={(e) => setEditedArticleText(e.target.value)}
              sx={{
                marginBottom: 2,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                "& .MuiInputBase-root": {
                  height: "100%",
                  alignItems: "flex-start",
                },
                "& .MuiOutlinedInput-input": {
                  lineHeight: 1.7,
                  height: "100% !important",
                  overflowY: "auto !important",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  zIndex: 1,
                },
              }}
            />
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                open={drawerTagsOpen}
                onOpen={() => setDrawerTagsOpen(true)}
                onClose={() => setDrawerTagsOpen(false)}
                value={drawerTags}
                onChange={(e) => {
                  setDrawerTags(e.target.value as string[]);
                  setDrawerTagsOpen(false);
                }}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        onDelete={(e) => {
                          e.stopPropagation();
                          setDrawerTags(drawerTags.filter((t) => t !== value));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {TAG_CATEGORIES.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Link
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: "block", marginBottom: 2, fontWeight: 500 }}
            >
              Read more on Wikipedia →
            </Link>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveArticleAsNote}
              fullWidth
              size="large"
            >
              Save as Note
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Add Note Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={(_, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCancelAdd();
          }
        }}
        maxWidth="md"
        fullWidth
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
              ✏️ Add New Note
            </Typography>
            <IconButton onClick={handleCancelAdd} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
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
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            required
            error={!addText && addText !== ""}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              },
            }}
          />
          <Autocomplete
            options={COUNTRIES}
            value={addCountry}
            onChange={(_, newValue) => setAddCountry(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                variant="outlined"
                required
                error={!addCountry}
                helperText={!addCountry ? "Country is required" : ""}
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
          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              },
            }}
          >
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={addTags}
              onChange={(e) => setAddTags(e.target.value as string[])}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        setAddTags(addTags.filter((t) => t !== value));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {TAG_CATEGORIES.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdd}>Cancel</Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            color="primary"
            disabled={!addText || !addCountry}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={(_, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCancelEdit();
          }
        }}
        maxWidth="md"
        fullWidth
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
              ✏️ Edit Note
            </Typography>
            <IconButton onClick={handleCancelEdit} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
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
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              },
            }}
          />
          <Autocomplete
            options={COUNTRIES}
            value={editCountry}
            onChange={(_, newValue) => setEditCountry(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                variant="outlined"
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
          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              },
            }}
          >
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={editTags}
              onChange={(e) => setEditTags(e.target.value as string[])}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        setEditTags(editTags.filter((t) => t !== value));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {TAG_CATEGORIES.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteNote}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Delete Note?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteNote}>Cancel</Button>
          <Button onClick={confirmDeleteNote} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Notes;
