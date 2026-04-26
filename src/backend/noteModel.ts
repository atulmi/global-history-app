import { Schema, model, type Document } from "mongoose";

/**
 * Shape of a Note document as stored in MongoDB.
 * `createdAt` and `updatedAt` are managed automatically by the `timestamps`
 * option — do not set them manually.
 */
export interface NoteDocument extends Document {
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  country?: string;
  source?: string;
  isPinned: boolean;
  isArchived: boolean;
}

const noteSchema = new Schema<NoteDocument>(
  {
    text: { type: String, required: true },
    tags: { type: [String], default: [] },
    title: { type: String },
    country: { type: String, index: true },
    source: { type: String },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  {
    // Automatically maintains `createdAt` and `updatedAt` fields.
    timestamps: true,

    // Remap `_id` → `id` in all JSON responses so the frontend receives the
    // same shape it already expects, and strip the internal `__v` field.
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

// Compound index used by the "filter by tag" feature on the All Notes page.
noteSchema.index({ tags: 1 });

export const NoteModel = model<NoteDocument>("Note", noteSchema);