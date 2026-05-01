import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Box, Typography, IconButton, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import WorldMap from "./components/WorldMap";
import Navbar from "./components/Navbar";
import NoteDialog from "./components/NoteDialog";
import SuccessSnackbar from "./components/SuccessSnackbar";
import WikipediaDrawer from "./components/WikipediaDrawer";
import ExploreNotesSidebar from "./components/ExploreNotesSidebar";
import {
  fetchRandomCountryHistory,
  fetchArticleContent,
  type WikipediaArticle,
} from "./services/wikipediaApi";
import { type Note } from "./types/Note";

type NotesProps = {
  notes: Note[];
  addNote: (note: Omit<Note, "id">) => void;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onOpenAddDialog: () => void;
};

function linesToQuillHtml(lines: string[]): string {
  const items = lines
    .map((l) => `<li>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`)
    .join("");
  return `<ul>${items}</ul>`;
}

const Notes: React.FC<NotesProps> = ({
  notes,
  addNote,
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
    try {
      const article = await fetchRandomCountryHistory(countryName);
      setCurrentArticle(article);
      setEditedArticleText(linesToQuillHtml(article.lines));
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
        setEditedArticleText(linesToQuillHtml(article.lines));
      } catch (err) {
        setError(`Failed to fetch article for ${selectedCountry}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Save directly from the drawer without opening a modal.
  const handleAddArticleAsNote = (noteTags: string[] = []) => {
    if (currentArticle) {
      const now = new Date();
      addNote({
        text: editedArticleText,
        title: currentArticle.title,
        country: currentArticle.country,
        source: currentArticle.url,
        tags: noteTags,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        isArchived: false,
      });
      setSuccessMessage("Note saved!");
      setSuccessOpen(true);
    }
  };

  const handleLoadArticleByTitle = async (title: string) => {
    setLoading(true);
    setError(null);
    setCurrentArticle(null);
    setEditedArticleText("");
    try {
      const article = await fetchArticleContent(title, selectedCountry ?? undefined);
      setCurrentArticle(article);
      setEditedArticleText(linesToQuillHtml(article.lines));
    } catch (err) {
      setError(`Failed to fetch article: ${title}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentArticle(null);
    setEditedArticleText("");
    setError(null);
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
      <Navbar
        onAddNote={onOpenAddDialog}
        onNavigateToAllNotes={() => navigate("/all-notes")}
      />
      <Box
        component="main"
        sx={{ flexGrow: 1, overflow: "hidden", display: "flex", width: "100%" }}
      >
        <Grid
          container
          spacing={0}
          sx={{ height: "100%", margin: 0, width: "100%" }}
        >
          {/* Left Sidebar */}
          <Grid size={2} sx={{ height: "100%" }}>
            <ExploreNotesSidebar
              notes={notes}
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
                    <IconButton size="small" onClick={() => setMapZoom((z) => Math.min(z + 0.5, 8))} aria-label="Zoom in">
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom out">
                    <IconButton size="small" onClick={() => setMapZoom((z) => Math.max(z - 0.5, 1))} aria-label="Zoom out">
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset view">
                    <IconButton size="small" onClick={handleResetMap} aria-label="Reset map view">
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
        loading={loading}
        error={error}
        onReload={handleReloadArticle}
        onAddAsNote={(noteTags) => handleAddArticleAsNote(noteTags)}
        onLoadArticle={handleLoadArticleByTitle}
      />

      <NoteDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddNote}
        mode="add"
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
