import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Notes from "./Notes.tsx";
import AllNotesPage from "./pages/AllNotesPage.tsx";
import { type Note } from "./types/Note";

const API = "http://localhost:3000/api/notes";

/** Dates come back from the API as strings — convert them to Date objects. */
function deserializeNote(raw: Record<string, unknown>): Note {
  return {
    ...(raw as Omit<Note, "createdAt" | "updatedAt">),
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Load all notes from the backend on first render
  useEffect(() => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    fetch(API)
      .then((res) => res.json())
      .then((data: Record<string, unknown>[]) => setNotes(data.map(deserializeNote)))
      .catch((err) => console.error("Failed to load notes:", err))
      .finally(() => sleep(2000).then(() => setNotesLoading(false))); // TODO: remove sleep (debugging only)
  }, []);

  const addNote = async (note: Omit<Note, "id">) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    const created = deserializeNote(await res.json());
    setNotes((prev) => [created, ...prev]);
  };

  const updateNote = async (id: string, note: Note) => {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    const updated = deserializeNote(await res.json());
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const deleteNote = async (id: string) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Notes
            notes={notes}
            notesLoading={notesLoading}
            addNote={addNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
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
    </Routes>
  );
}

export default App;