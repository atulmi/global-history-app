import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import Notes from "./Notes.tsx";
import AllNotesPage from "./pages/AllNotesPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { type Note } from "./types/Note";

const API = "http://localhost:3000/api/notes";
const LOCAL_STORAGE_KEY = "global-history-app-notes";

function deserializeNote(raw: Record<string, unknown>): Note {
  return {
    ...(raw as Omit<Note, "createdAt" | "updatedAt">),
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

function loadLocalNotes(): Note[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Record<string, unknown>[]).map(deserializeNote);
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: Note[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
}

function App(): React.JSX.Element {
  const { isLoggedIn, token } = useAuth();

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Reload notes whenever auth state changes (login / logout).
  // On login: sync any guest notes from localStorage to the DB first,
  // then clear localStorage so they don't get synced again on next login.
  useEffect(() => {
    setNotes([]);
    setNotesLoading(true);

    if (isLoggedIn) {
      const run = async () => {
        const guestNotes = loadLocalNotes();
        if (guestNotes.length > 0) {
          try {
            await fetch(`${API}/sync`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify(guestNotes),
            });
          } catch (err) {
            console.error("Failed to sync guest notes:", err);
          }
          // Clear regardless — even on failure we don't want to re-sync
          // the same notes on every login. Content is preserved in DB on success.
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        const res = await fetch(API, { headers: authHeaders() });
        const data: Record<string, unknown>[] = await res.json();
        setNotes(data.map(deserializeNote));
      };
      run()
        .catch((err) => console.error("Failed to load notes:", err))
        .finally(() => setNotesLoading(false));
    } else {
      setNotes(loadLocalNotes());
      setNotesLoading(false);
    }
  }, [isLoggedIn]);

  const addNote = async (note: Omit<Note, "id">) => {
    if (isLoggedIn) {
      const res = await fetch(API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(note),
      });
      const created = deserializeNote(await res.json());
      setNotes((prev) => [created, ...prev]);
    } else {
      const newNote: Note = { ...note, id: crypto.randomUUID() };
      setNotes((prev) => {
        const updated = [newNote, ...prev];
        saveLocalNotes(updated);
        return updated;
      });
    }
  };

  const updateNote = async (id: string, note: Note) => {
    if (isLoggedIn) {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(note),
      });
      const updated = deserializeNote(await res.json());
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } else {
      setNotes((prev) => {
        const updated = prev.map((n) => (n.id === id ? note : n));
        saveLocalNotes(updated);
        return updated;
      });
    }
  };

  const deleteNote = async (id: string) => {
    if (isLoggedIn) {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
    }
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (!isLoggedIn) saveLocalNotes(updated);
      return updated;
    });
  };

  const handleOpenAddDialog = () => setAddDialogOpen(true);

  if (notesLoading) {
    return (
      <Box
        role="status"
        aria-live="polite"
        aria-label="Loading notes"
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          gap: 2,
        }}
      >
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h5" color="text.secondary">
          Loading notes...
        </Typography>
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Notes
            notes={notes}
            addNote={addNote}
            addDialogOpen={addDialogOpen}
            setAddDialogOpen={setAddDialogOpen}
            onOpenAddDialog={handleOpenAddDialog}
          />
        }
      />
      <Route
        path="/all-notes"
        element={
          <AllNotesPage
            notes={notes}
            addNote={addNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addDialogOpen={addDialogOpen}
            setAddDialogOpen={setAddDialogOpen}
          />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}