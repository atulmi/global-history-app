import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Box, Typography, CircularProgress, IconButton, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import WorldMap from "./components/WorldMap";
import Navbar from "./components/Navbar";
import NoteDialog from "./components/NoteDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import SuccessSnackbar from "./components/SuccessSnackbar";
import WikipediaDrawer from "./components/WikipediaDrawer";
import ExploreNotesSidebar from "./components/ExploreNotesSidebar";
import {
  fetchRandomCountryHistory,
  type WikipediaArticle,
} from "./services/wikipediaApi";
import { type Note } from "./types/Note";

type NotesProps = {
  notes: Note[];
  notesLoading: boolean;
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, note: Note) => void;
  deleteNote: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onOpenAddDialog: () => void;
};

const Notes: React.FC<NotesProps> = ({
  notes,
  notesLoading,
  addNote,
  updateNote,
  deleteNote,
  addDialogOpen,
  setAddDialogOpen,
  onOpenAddDialog,
}) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const DEFAULT_ZOOM = 1;
  const DEFAULT_CENTER: [number, number] = [0, 0];
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapKey, setMapKey] = useState(0);

  const handleMapMoveEnd = ({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) => {
    setMapCenter(coordinates);
    setMapZoom(zoom);
  };

  const handleResetMap = () => {
    setMapZoom(DEFAULT_ZOOM);
    setMapCenter(DEFAULT_CENTER);
    setMapKey((k) => k + 1);
  };

  // Wikipedia integration state
  const [currentArticle, setCurrentArticle] = useState<WikipediaArticle | null>(
    null,
  );
  const [editedArticleText, setEditedArticleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTags, setDrawerTags] = useState<string[]>([]);

  // Edit note state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

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
      const note: Omit<Note, "id"> = {
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

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        position: "relative",
      }}
    >
      {notesLoading && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          backgroundColor: "white", gap: 2,
        }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5" color="text.secondary">Loading notes...</Typography>
        </Box>
      )}

      <Navbar
        onAddNote={onOpenAddDialog}
        onNavigateToAllNotes={() => navigate("/all-notes")}
      />
      <Box
        sx={{ flexGrow: 1, overflow: "hidden", display: "flex", width: "100%" }}
      >
        <Grid
          container
          spacing={0}
          sx={{ height: "100%", margin: 0, width: "100%" }}
        >
          {/* Left Sidebar - Explore Your Notes (View Recently Added Notes or Random Notes) */}
          <Grid size={2} sx={{ height: "100%" }}>
            <ExploreNotesSidebar
              notes={notes}
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
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="h6" fontWeight={600}>
                  🌍 Explore Global History
                </Typography>
                <Box>
                  <Tooltip title="Zoom in">
                    <IconButton size="small" onClick={() => setMapZoom((z) => Math.min(z + 0.5, 8))}>
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom out">
                    <IconButton size="small" onClick={() => setMapZoom((z) => Math.max(z - 0.5, 1))}>
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset view">
                    <IconButton size="small" onClick={handleResetMap}>
                      <CenterFocusStrongIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Click any country to discover random Wikipedia articles about
                that country and its history
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <WorldMap
                  key={mapKey}
                  onCountryClick={handleCountryClick}
                  zoom={mapZoom}
                  center={mapCenter}
                  onMoveEnd={handleMapMoveEnd}
                />
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

      <SuccessSnackbar
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
};

export default Notes;
