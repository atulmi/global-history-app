import React, { useState } from "react";
import { Container, Paper, Typography, Box, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { COUNTRIES } from "../data/countries";
import { type Note } from "../types/Note";
import Navbar from "../components/Navbar";
import NoteDialog from "../components/NoteDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SuccessSnackbar from "../components/SuccessSnackbar";
import FilterControls from "../components/FilterControls";
import NotesTable from "../components/NotesTable";

/**
 * Displays all notes with filtering and sorting.
 *
 * Supports two view modes:
 * - Single list: all filtered notes in a single table.
 * - Multi-section: up to 4 side-by-side tables, each filtered by a chosen country.
 */

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

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteIndex, setDeletingNoteIndex] = useState<number | null>(
    null,
  );

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [filterTag, setFilterTag] = useState<string>("All");
  const [countrySectionCount, setCountrySectionCount] = useState(0);
  const [countryFilters, setCountryFilters] = useState<
    [string, string, string, string]
  >(["", "", "", ""]);

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

  const sortNotes = (notesToSort: Note[]) =>
    [...notesToSort].sort((a, b) => {
      if (sortOrder === "newest")
        return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortOrder === "oldest")
        return a.createdAt.getTime() - b.createdAt.getTime();
      return 0;
    });

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
    setCountryFilters(["", "", "", ""]);
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
        <Paper
          sx={{
            padding: "20px",
            borderRadius: 2,
            border: "2px solid black",
            boxShadow:
              "0 -6px 24px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.18)",
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
          />

          {/* Single-list mode */}
          {countrySectionCount === 0 &&
            (filteredNotes.length === 0 ? (
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
            ) : (
              <NotesTable
                notes={filteredNotes}
                allNotes={notes}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                sx={{ flex: 1, minHeight: 0 }}
              />
            ))}

          {/* Multi-section mode */}
          {countrySectionCount > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${countrySectionCount}, 1fr)`,
                gap: 2,
                flex: 1,
                minHeight: 0,
              }}
            >
              {countryFilters
                .slice(0, countrySectionCount)
                .map((country, sectionIndex) => {
                  const sectionNotes = getNotesForCountry(country);
                  return (
                    <Box
                      key={sectionIndex}
                      sx={{
                        border: "2px solid black",
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          mb: 2,
                          pb: 1,
                          borderBottom: "1px solid #ddd",
                          flexShrink: 0,
                        }}
                      >
                        <Autocomplete
                          options={COUNTRIES}
                          value={country || null}
                          onChange={(_, newValue) => {
                            const newFilters = [...countryFilters] as [
                              string,
                              string,
                              string,
                              string,
                            ];
                            newFilters[sectionIndex] = newValue || "";
                            setCountryFilters(newFilters);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                sectionNotes.length > 0
                                  ? `Select a country (${sectionNotes.length})`
                                  : "Select a country"
                              }
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "black",
                                  borderWidth: "1px",
                                },
                              }}
                            />
                          )}
                          size="small"
                          sx={{ width: 200 }}
                        />
                      </Box>

                      {!country && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: "center", mt: 4 }}
                        >
                          No notes available
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
                          allNotes={notes}
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
        onClose={() => {
          setEditDialogOpen(false);
          setEditingNote(null);
          setEditingIndex(null);
        }}
        onSave={handleSaveEdit}
        note={editingNote}
        mode="edit"
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingNoteIndex(null);
        }}
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
