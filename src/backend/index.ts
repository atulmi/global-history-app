import expresponses from "express";
import cors from "cors";

const app = expresponses();
const PORT = 3000;

app.use(cors());
app.use(expresponses.json());

let notes: any = [];

// Create a new note
app.post("/api/notes", (request: any, response: any) => {
  const { text, tags } = request.body;
  const newNote = { id: Date.now(), text, tags };
  notes.push(newNote);
  response.status(201).json(newNote);
});

// List all notes
app.get("/api/notes", (request: any, response: any) => {
  response.json(notes);
});

// Update a note
app.put("/api/notes/:id", (request: any, response: any) => {
  const { id } = request.params;
  const { text, tags } = request.body;
  const noteIndex = notes.findIndex((note: any) => note.id === parseInt(id));

  if (noteIndex !== -1) {
    notes[noteIndex] = { id: parseInt(id), text, tags };
    response.json(notes[noteIndex]);
  } else {
    response.status(404).json({ message: "Note not found" });
  }
});

// Delete a note
app.delete("/api/notes/:id", (request: any, response: any) => {
  const { id } = request.params;
  notes = notes.filter((note: any) => note.id !== parseInt(id));
  response.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
