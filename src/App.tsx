import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Notes from "./Notes.tsx";
import AllNotesPage from "./pages/AllNotesPage.tsx";
import { type Note } from "./types/Note";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const addNote = (note: Omit<Note, "id">) => {
    setNotes([{ id: crypto.randomUUID(), ...note }, ...notes]);
  };

  const updateNote = (id: string, note: Note) => {
    setNotes(notes.map((n) => (n.id === id ? note : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
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
