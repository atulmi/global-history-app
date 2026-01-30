import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Link,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  AppBar,
  Toolbar,
  Snackbar,
  Alert as MuiAlert,
  Pagination,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { COUNTRIES, TAG_CATEGORIES } from "../data/countries";
import Autocomplete from "@mui/material/Autocomplete";

type Note = {
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  country?: string;
  source?: string;
  isPinned?: boolean;
  isArchived?: boolean;
};

type AllNotesPageProps = {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (index: number, note: Note) => void;
  deleteNote: (index: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
};

const AllNotesPage: React.FC<AllNotesPageProps> = ({
  notes,
  addNote,
  updateNote,
  deleteNote,
  searchTerm,
  setSearchTerm,
  addDialogOpen,
  setAddDialogOpen,
}) => {
  const navigate = useNavigate();

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter state
  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");

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

  const handleCancelAdd = () => {
    setAddDialogOpen(false);
    setAddTitle("");
    setAddText("");
    setAddCountry(null);
    setAddTags([]);
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

  // Filter and sort notes
  const filteredNotes = notes
    .filter((note) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        note.text.toLowerCase().includes(searchLower) ||
        note.title?.toLowerCase().includes(searchLower) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Country filter
      if (filterCountry !== "All") {
        if (note.country !== filterCountry) return false;
      }

      // Date range filter
      if (dateRangeStart) {
        const startDate = new Date(dateRangeStart);
        startDate.setHours(0, 0, 0, 0);
        if (note.createdAt < startDate) return false;
      }

      if (dateRangeEnd) {
        const endDate = new Date(dateRangeEnd);
        endDate.setHours(23, 59, 59, 999);
        if (note.createdAt > endDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortOrder === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <Box>
      {/* Navbar */}
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ marginRight: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              flexGrow: 0,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            🌍 GlobalHistory
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              px: 4,
            }}
          >
            <TextField
              label="Search Notes"
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                backgroundColor: "white",
                borderRadius: 1,
                maxWidth: "600px",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
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

      <Container maxWidth="xl" sx={{ marginTop: "20px" }}>
        <Paper sx={{ padding: "20px", borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📚 All Notes ({filteredNotes.length})
          </Typography>

          {/* Filter Controls and Pagination */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left side: Filter controls */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Country Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={filterCountry}
                  label="Country"
                  onChange={(e) => {
                    setFilterCountry(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <MenuItem value="All">All Countries</MenuItem>
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort Order */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort By"
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                </Select>
              </FormControl>

              {/* Date Range Start */}
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={dateRangeStart}
                onChange={(e) => {
                  setDateRangeStart(e.target.value);
                  handleFilterChange();
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              {/* Date Range End */}
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={dateRangeEnd}
                onChange={(e) => {
                  setDateRangeEnd(e.target.value);
                  handleFilterChange();
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              {/* Items Per Page */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Per Page"
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={40}>40</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                  <MenuItem value={80}>80</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters Button */}
              {(filterCountry !== "All" ||
                dateRangeStart ||
                dateRangeEnd ||
                sortOrder !== "newest") && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setFilterCountry("All");
                    setSortOrder("newest");
                    setDateRangeStart("");
                    setDateRangeEnd("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Right side: Pagination */}
            {filteredNotes.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {startIndex + 1}-{Math.min(endIndex, filteredNotes.length)} of{" "}
                  {filteredNotes.length}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </Box>

          <List dense>
            {paginatedNotes.map((note) => {
              // Get the actual index from the original notes array
              const actualIndex = notes.findIndex((n) => n === note);

              return (
                <Box
                  key={actualIndex}
                  sx={{
                    mb: 1.5,
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      transform: "translateY(-2px)",
                    },
                    "&:hover .note-actions": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => handleEditNote(note, actualIndex)}
                >
                  {/* Header: Title + Action Icons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ flexGrow: 1 }}
                    >
                      {note.title || "Untitled Note"}
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
                          handleEditNote(note, actualIndex);
                        }}
                        sx={{ padding: "4px" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(actualIndex);
                        }}
                        sx={{ padding: "4px" }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Country Badge */}
                  {note.country && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={note.country}
                        size="small"
                        color="primary"
                        sx={{ height: "22px", fontSize: "0.75rem" }}
                      />
                    </Box>
                  )}

                  {/* Text Preview */}
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    {note.text.substring(0, 200)}
                    {note.text.length > 200 && "..."}
                  </Typography>

                  {/* Date Information */}
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", fontSize: "0.7rem" }}
                  >
                    {note.createdAt.toLocaleString()}
                    {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                      <> • Updated {note.updatedAt.toLocaleString()}</>
                    )}
                  </Typography>
                  {note.source && (
                    <>
                      {" • "}
                      <Link
                        href={note.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source
                      </Link>
                    </>
                  )}
                </Box>
              );
            })}
            {paginatedNotes.length === 0 && filteredNotes.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  padding: "40px",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No notes found
                </Typography>
                <Typography variant="body2">
                  {notes.length === 0
                    ? "Use the Add Note button to get started!"
                    : "Try adjusting your filters"}
                </Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Container>

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
                    <Chip key={value} label={value} size="small" />
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
                    <Chip key={value} label={value} size="small" />
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

export default AllNotesPage;
