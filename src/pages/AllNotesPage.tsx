import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  Box,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { COUNTRIES } from "../data/countries";
import { type Note } from "../types/Note";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteDialog from "../components/NoteDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SuccessSnackbar from "../components/SuccessSnackbar";
import FilterControls from "../components/FilterControls";

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

  // Edit note state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteIndex, setDeletingNoteIndex] = useState<number | null>(null);

  // Success message state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter state
  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Country filter mode state (multi-section view)
  const [countrySectionCount, setCountrySectionCount] = useState(0);
  const [countryFilters, setCountryFilters] = useState<[string, string, string, string]>(["", "", "", ""]);

  const handleAddNote = (note: Note) => {
    addNote(note);
    setAddDialogOpen(false);
    setSuccessMessage("Note successfully saved!");
    setSuccessOpen(true);
  };

  const handleEditNote = (note: Note, index: number) => {
    setEditingNote(note);
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (note: Note) => {
    if (editingIndex !== null) {
      updateNote(editingIndex, note);
      setEditDialogOpen(false);
      setEditingNote(null);
      setEditingIndex(null);
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

  // Base filter function
  const baseFilter = (note: Note, skipCountryFilter = false) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      note.text.toLowerCase().includes(searchLower) ||
      note.title?.toLowerCase().includes(searchLower) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (!skipCountryFilter && countrySectionCount === 0 && filterCountry !== "All") {
      if (note.country !== filterCountry) return false;
    }

    if (filterYear) {
      const noteYear = note.createdAt.getFullYear().toString();
      if (noteYear !== filterYear) return false;
    }

    return true;
  };

  // Sort function
  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      if (sortOrder === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortOrder === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      return 0;
    });
  };

  const filteredNotes = sortNotes(notes.filter((note) => baseFilter(note)));

  const getNotesForCountry = (country: string) => {
    if (!country) return [];
    return sortNotes(notes.filter((note) => baseFilter(note, true) && note.country === country));
  };

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  const handleResetFilters = () => {
    setFilterCountry("All");
    setSortOrder("newest");
    setFilterYear("");
    setCountrySectionCount(0);
    setCountryFilters(["", "", "", ""]);
    setCurrentPage(1);
  };

  const showResetButton =
    filterCountry !== "All" ||
    !!filterYear ||
    sortOrder !== "newest" ||
    countrySectionCount > 0;

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Navbar
        onAddNote={() => setAddDialogOpen(true)}
        onNavigateBack={() => navigate("/")}
        showSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Container
        maxWidth="xl"
        sx={{
          marginTop: "20px",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "20px",
        }}
      >
        <Paper
          sx={{
            padding: "20px",
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }} fontWeight={600}>
            📚 All Notes ({filteredNotes.length})
          </Typography>

          <FilterControls
            filtersVisible={filtersVisible}
            setFiltersVisible={setFiltersVisible}
            filterCountry={filterCountry}
            setFilterCountry={setFilterCountry}
            countrySectionCount={countrySectionCount}
            setCountrySectionCount={setCountrySectionCount}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={filteredNotes.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onResetFilters={handleResetFilters}
            showResetButton={showResetButton}
          />

          {/* Notes Container */}
          <Box sx={{ flex: 1, overflowX: "hidden" }}>
            {countrySectionCount === 0 && (
              <List dense>
                {paginatedNotes.map((note) => {
                  const actualIndex = notes.findIndex((n) => n === note);
                  return (
                    <NoteCard
                      key={actualIndex}
                      note={note}
                      onEdit={() => handleEditNote(note, actualIndex)}
                      onDelete={() => handleDeleteNote(actualIndex)}
                    />
                  );
                })}
                {paginatedNotes.length === 0 && (
                  <Box sx={{ textAlign: "center", padding: "40px", color: "text.secondary" }}>
                    <Typography variant="h6" gutterBottom>No notes found</Typography>
                    <Typography variant="body2">
                      {notes.length === 0 ? "Use the Add Note button to get started!" : "Try adjusting your filters"}
                    </Typography>
                  </Box>
                )}
              </List>
            )}

            {countrySectionCount > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${countrySectionCount}, 1fr)`, gap: 2 }}>
                {countryFilters.slice(0, countrySectionCount).map((country, sectionIndex) => {
                  const sectionNotes = getNotesForCountry(country);
                  return (
                    <Box
                      key={sectionIndex}
                      sx={{
                        border: "2px solid black",
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: "#f9f9f9",
                        minHeight: "300px",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1, borderBottom: "1px solid #ddd" }}>
                        <Autocomplete
                          options={COUNTRIES}
                          value={country || null}
                          onChange={(_, newValue) => {
                            const newFilters = [...countryFilters] as [string, string, string, string];
                            newFilters[sectionIndex] = newValue || "";
                            setCountryFilters(newFilters);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={sectionNotes.length > 0 ? `Select a country (${sectionNotes.length})` : "Select a country"}
                              size="small"
                              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "black", borderWidth: "1px" } }}
                            />
                          )}
                          size="small"
                          sx={{ width: 200 }}
                        />
                      </Box>
                      {!country && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                          No notes available
                        </Typography>
                      )}
                      {country && sectionNotes.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                          No notes for {country}
                        </Typography>
                      )}
                      {sectionNotes.map((note) => {
                        const actualIndex = notes.findIndex((n) => n === note);
                        return (
                          <NoteCard
                            key={actualIndex}
                            note={note}
                            onEdit={() => handleEditNote(note, actualIndex)}
                            onDelete={() => handleDeleteNote(actualIndex)}
                            compact
                          />
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      <NoteDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddNote}
        mode="add"
      />

      <NoteDialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditingNote(null); setEditingIndex(null); }}
        onSave={handleSaveEdit}
        note={editingNote}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingNoteIndex(null); }}
        onConfirm={confirmDeleteNote}
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
