import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Box, Typography } from "@mui/material";
import WorldMap from "./components/WorldMap";
import Navbar from "./components/Navbar";
import NoteDialog from "./components/NoteDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import SuccessSnackbar from "./components/SuccessSnackbar";
import WikipediaDrawer from "./components/WikipediaDrawer";
import RecentNotesSidebar from "./components/RecentNotesSidebar";
import { fetchRandomCountryHistory, type WikipediaArticle } from "./services/wikipediaApi";
import { type Note } from "./types/Note";

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
  addDialogOpen,
  setAddDialogOpen,
  onOpenAddDialog,
}) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Wikipedia integration state
  const [currentArticle, setCurrentArticle] = useState<WikipediaArticle | null>(null);
  const [editedArticleText, setEditedArticleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTags, setDrawerTags] = useState<string[]>([]);

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

  const handleAddNote = (note: Note) => {
    addNote(note);
    setAddDialogOpen(false);
    setSuccessMessage("Note successfully saved!");
    setSuccessOpen(true);
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
      <Navbar
        onAddNote={onOpenAddDialog}
        onNavigateToAllNotes={() => navigate("/all-notes")}
      />

      <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex", width: "100%" }}>
        <Grid container spacing={0} sx={{ height: "100%", margin: 0, width: "100%" }}>
          {/* Left Sidebar - Recent Notes */}
          <Grid size={2} sx={{ height: "100%" }}>
            <RecentNotesSidebar
              notes={recentNotes}
              totalNotes={notes.length}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onViewAll={() => navigate("/all-notes")}
            />
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
                Click any country to discover random Wikipedia articles about that country and its history
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <WorldMap onCountryClick={handleCountryClick} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <WikipediaDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        selectedCountry={selectedCountry}
        article={currentArticle}
        articleText={editedArticleText}
        onArticleTextChange={setEditedArticleText}
        tags={drawerTags}
        onTagsChange={setDrawerTags}
        loading={loading}
        error={error}
        onReload={handleReloadArticle}
        onSave={handleSaveArticleAsNote}
      />

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

export default Notes;
