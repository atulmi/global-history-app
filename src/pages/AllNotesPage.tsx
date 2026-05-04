import {
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";
import AppsIcon from "@mui/icons-material/Apps";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import FilterControls from "../components/FilterControls";
import Navbar from "../components/Navbar";
import NoteDialog from "../components/NoteDialog";
import NotesGrid from "../components/NotesGrid";
import NotesTable from "../components/NotesTable";
import SuccessSnackbar from "../components/SuccessSnackbar";
import { type Note } from "../types/Note";
import { useAuth } from "../context/AuthContext";

/**
 * Displays all notes with filtering and sorting.
 *
 * Supports two view modes:
 * - Single list: all filtered notes in a single table.
 * - Multi-section: up to 2 side-by-side tables, each filtered by a chosen country.
 *   The country pickers live in the filter bar; there are no per-column containers.
 */

type AllNotesPageProps = {
  notes: Note[];
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, note: Note) => void;
  deleteNote: (id: string) => void;
  clearAllNotes: () => void;
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
  clearAllNotes,
  searchTerm,
  setSearchTerm,
  addDialogOpen,
  setAddDialogOpen,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "compact">(
    "table",
  );

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [filterTag, setFilterTag] = useState<string>("All");
  const [countrySectionCount, setCountrySectionCount] = useState(0);
  const [countryFilters, setCountryFilters] = useState<[string, string]>([
    "",
    "",
  ]);

  const handleAddNote = (note: Note) => {
    addNote(note);
    setAddDialogOpen(false);
    setSuccessMessage("Note successfully saved!");
    setSuccessOpen(true);
  };

  const handleEditNote = (note: Note, id: string) => {
    setEditingNote(note);
    setEditingNoteId(id);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (note: Note) => {
    if (editingNoteId !== null) {
      updateNote(editingNoteId, note);
      setEditDialogOpen(false);
      setEditingNote(null);
      setEditingNoteId(null);
      setSuccessMessage("Note successfully updated!");
      setSuccessOpen(true);
    }
  };

  const handleDeleteNote = (id: string) => {
    setDeletingNoteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (deletingNoteId !== null) {
      deleteNote(deletingNoteId);
      setDeleteDialogOpen(false);
      setDeletingNoteId(null);
    }
  };

  const baseFilter = (note: Note, skipGlobalCountryFilter = false) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      note.text.toLowerCase().includes(searchLower) ||
      note.title?.toLowerCase().includes(searchLower) ||
      note.country?.toLowerCase().includes(searchLower) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (
      !skipGlobalCountryFilter &&
      countrySectionCount === 0 &&
      filterCountry !== "All"
    ) {
      if (note.country !== filterCountry) return false;
    }

    if (filterTag !== "All" && !note.tags.includes(filterTag)) return false;

    return true;
  };

  const sortNotes = (notesToSort: Note[]) => {
    if (sortOrder === "random") {
      return [...notesToSort].sort(() => Math.random() - 0.5);
    }
    return [...notesToSort].sort((a, b) => {
      if (sortOrder === "newest")
        return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortOrder === "oldest")
        return a.createdAt.getTime() - b.createdAt.getTime();
      return 0;
    });
  };

  const filteredNotes = sortNotes(notes.filter((note) => baseFilter(note)));

  const getNotesForCountry = (country: string) => {
    if (!country) return [];
    return sortNotes(
      notes.filter(
        (note) => baseFilter(note, true) && note.country === country,
      ),
    );
  };

  const handleResetFilters = () => {
    setFilterCountry("All");
    setSortOrder("newest");
    setFilterTag("All");
    setCountrySectionCount(0);
    setCountryFilters(["", ""]);
  };

  const showResetButton =
    filterCountry !== "All" ||
    sortOrder !== "newest" ||
    filterTag !== "All" ||
    countrySectionCount > 0;

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        onAddNote={() => setAddDialogOpen(true)}
        onNavigateBack={() => navigate("/")}
      />

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          paddingTop: "20px",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "20px",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              📚 My Notes ({notes.length})
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Table view">
                <IconButton
                  size="small"
                  onClick={() => setViewMode("table")}
                  sx={{ color: viewMode === "table" ? "#667eea" : "#aaa" }}
                >
                  <TableRowsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid view">
                <IconButton
                  size="small"
                  onClick={() => setViewMode("grid")}
                  sx={{ color: viewMode === "grid" ? "#667eea" : "#aaa" }}
                >
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Compact view">
                <IconButton
                  size="small"
                  onClick={() => setViewMode("compact")}
                  sx={{ color: viewMode === "compact" ? "#667eea" : "#aaa" }}
                >
                  <AppsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {notes.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setClearAllDialogOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              All your notes in one place. Use the filters below to find
              specific notes.
            </Typography>
            {!isLoggedIn && (
              <Typography
                variant="caption"
                sx={{ color: "#e65100", display: "block", mt: 1.5 }}
              >
                ⚠ Guest mode: notes are saved in your browser only and will be
                lost if you clear your cache or cookies.{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#e65100" }}
                >
                  Register for free
                </Link>{" "}
                to save notes permanently.
              </Typography>
            )}
          </Box>
        </Box>

        <Box>
          <FilterControls
            filterCountry={filterCountry}
            setFilterCountry={setFilterCountry}
            countrySectionCount={countrySectionCount}
            setCountrySectionCount={setCountrySectionCount}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterTag={filterTag}
            setFilterTag={setFilterTag}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onResetFilters={handleResetFilters}
            showResetButton={showResetButton}
            displayedCount={
              countrySectionCount === 0 ? filteredNotes.length : undefined
            }
            countryFilters={countryFilters}
            setCountryFilters={setCountryFilters}
          />
        </Box>

        {/* Single-list mode */}
        {countrySectionCount === 0 &&
          (filteredNotes.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  px: 5,
                  py: 4,
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                  boxShadow: "0 8px 32px rgba(139,92,246,0.15)",
                  border: "1px solid #c4b5fd",
                  maxWidth: 400,
                }}
              >
                <DescriptionOutlinedIcon
                  sx={{ fontSize: 56, color: "#7c3aed", mb: 1.5 }}
                />
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: "#4c1d95", mb: 1 }}
                >
                  {notes.length === 0 ? "No notes yet" : "No notes found"}
                </Typography>
                <Typography variant="body1" sx={{ color: "#6d28d9" }}>
                  {notes.length === 0
                    ? "Click Add Note in the navbar to get started."
                    : "Try adjusting your filters or search term."}
                </Typography>
              </Box>
            </Box>
          ) : viewMode === "grid" || viewMode === "compact" ? (
            <NotesGrid
              notes={filteredNotes}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              variant={viewMode === "compact" ? "compact" : "cards"}
              sx={{ flex: 1, minHeight: 0 }}
            />
          ) : (
            <NotesTable
              notes={filteredNotes}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              sx={{ flex: 1, minHeight: 0 }}
            />
          ))}

        {/* Multi-section mode — tables sit directly in the grid, no extra containers */}
        {countrySectionCount > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${countrySectionCount}, 1fr)`,
              gap: 4,
              flex: 1,
              minHeight: 0,
            }}
          >
            {countryFilters.slice(0, countrySectionCount).map((country, i) => {
              const sectionNotes = getNotesForCountry(country);
              return (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {!country && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", mt: 4 }}
                    >
                      Select a country above
                    </Typography>
                  )}
                  {country && sectionNotes.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", mt: 4 }}
                    >
                      No notes for {country}
                    </Typography>
                  )}
                  {country && sectionNotes.length > 0 && (
                    <NotesTable
                      notes={sectionNotes}
                      showCountry={false}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      sx={{ flex: 1, minHeight: 0 }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      <NoteDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddNote}
        mode="add"
      />
      <NoteDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingNote(null);
          setEditingNoteId(null);
        }}
        onSave={handleSaveEdit}
        note={editingNote}
        mode="edit"
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingNoteId(null);
        }}
        onConfirm={confirmDeleteNote}
      />
      <DeleteConfirmDialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        onConfirm={() => {
          clearAllNotes();
          setClearAllDialogOpen(false);
        }}
        title="Clear All Notes?"
        body="This will permanently delete all your notes. This action cannot be undone."
      />
      <SuccessSnackbar
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
};

export default AllNotesPage;
