import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Notes from "./Notes.tsx";
import AllNotesPage from "./pages/AllNotesPage.tsx";

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

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const addNote = (note: Note) => {
    setNotes([note, ...notes]);
  };

  const updateNote = (index: number, note: Note) => {
    const newNotes = [...notes];
    newNotes[index] = note;
    setNotes(newNotes);
  };

  const deleteNote = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
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
