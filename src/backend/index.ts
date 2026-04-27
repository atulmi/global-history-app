import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { NoteModel } from "./noteModel";
import authRoutes from "./authRoutes";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// ---------------------------------------------------------------------------
// Notes CRUD
// ---------------------------------------------------------------------------

/** GET /api/notes — return all notes, newest first */
app.get("/api/notes", async (_req, res) => {
  try {
    const notes = await NoteModel.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

/**
 * POST /api/notes/sync — bulk-import guest (localStorage) notes after login.
 * Preserves original createdAt/updatedAt so note history is not lost.
 * Must be defined before /api/notes/:id to avoid "sync" being treated as an id.
 */
app.post("/api/notes/sync", async (req, res) => {
  try {
    const incoming = req.body as Array<{
      text: string;
      tags?: string[];
      title?: string;
      country?: string;
      source?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      res.status(400).json({ message: "Expected a non-empty array of notes" });
      return;
    }

    const docs = incoming.map((n) => ({
      text: n.text,
      tags: n.tags ?? [],
      title: n.title,
      country: n.country,
      source: n.source,
      isPinned: n.isPinned ?? false,
      isArchived: n.isArchived ?? false,
      createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
      updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
    }));

    // Use the raw collection to bypass Mongoose's timestamp plugin so our
    // explicit createdAt/updatedAt values from localStorage are preserved.
    const result = await NoteModel.collection.insertMany(docs);
    const ids = Object.values(result.insertedIds);
    const created = await NoteModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sync failed" });
  }
});

/** POST /api/notes — create a new note */
app.post("/api/notes", async (req, res) => {
  try {
    const { text, tags, title, country, source, isPinned, isArchived } =
      req.body as {
        text: string;
        tags?: string[];
        title?: string;
        country?: string;
        source?: string;
        isPinned?: boolean;
        isArchived?: boolean;
      };

    const note = await NoteModel.create({
      text,
      tags: tags ?? [],
      title,
      country,
      source,
      isPinned: isPinned ?? false,
      isArchived: isArchived ?? false,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create note" });
  }
});

/** PUT /api/notes/:id — update an existing note */
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, tags, title, country, source, isPinned, isArchived } =
      req.body as {
        text?: string;
        tags?: string[];
        title?: string;
        country?: string;
        source?: string;
        isPinned?: boolean;
        isArchived?: boolean;
      };

    const note = await NoteModel.findByIdAndUpdate(
      id,
      { text, tags, title, country, source, isPinned, isArchived },
      { new: true, runValidators: true },
    );

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update note" });
  }
});

/** DELETE /api/notes/:id — delete a single note */
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await NoteModel.findByIdAndDelete(id);

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

/** DELETE /api/notes — delete ALL notes (used by the "Clear All Notes" button) */
app.delete("/api/notes", async (_req, res) => {
  try {
    await NoteModel.deleteMany({});
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear notes" });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });