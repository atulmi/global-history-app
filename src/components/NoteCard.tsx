import React from "react";
import { Box, Typography, Chip, IconButton, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { type Note } from "../types/Note";

type NoteCardProps = {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  compact = false,
}) => {
  if (compact) {
    return (
      <Box
        onClick={onEdit}
        sx={{
          flexDirection: "column",
          alignItems: "flex-start",
          backgroundColor: "rgba(255, 255, 255, 1)",
          mb: 1,
          p: 1.5,
          border: "2px solid black",
          borderRadius: 2,
          position: "relative",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          },
          "&:hover .note-actions": {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            mb: 0.5,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ color: "#333", flexGrow: 1, pr: 1 }}
          >
            {note.title || "Untitled"}
          </Typography>
          <Box
            className="note-actions"
            sx={{
              display: "flex",
              gap: 0.5,
              opacity: 0.7,
              transition: "opacity 0.2s",
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ padding: "2px" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ padding: "2px" }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {note.country && (
          <Box sx={{ mb: 0.5, width: "100%" }}>
            <Chip
              label={note.country}
              size="small"
              color="primary"
              sx={{ height: "20px", fontSize: "0.7rem" }}
            />
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{ width: "100%", color: "#666", mb: 0.5 }}
        >
          {note.text.substring(0, 60)}...
        </Typography>

        <Typography
          variant="caption"
          sx={{ width: "100%", color: "#999", fontSize: "0.65rem" }}
        >
          {note.updatedAt.getTime() !== note.createdAt.getTime()
            ? `Updated ${note.updatedAt.toLocaleString()}`
            : "Created " + note.createdAt.toLocaleString()}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={onEdit}
      sx={{
        mb: 1.5,
        backgroundColor: "rgba(255, 255, 255, 1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "2px solid black",
        borderRadius: 2,
        p: 2,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transform: "translateY(-2px)",
        },
        "&:hover .note-actions": {
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          {note.title || "Untitled Note"}
        </Typography>
        <Box
          className="note-actions"
          sx={{
            display: "flex",
            gap: 0.5,
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ padding: "4px" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ padding: "4px" }}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {note.country && (
        <Box sx={{ mb: 1 }}>
          <Chip
            label={note.country}
            size="small"
            color="primary"
            sx={{ height: "22px", fontSize: "0.75rem" }}
          />
        </Box>
      )}

      <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
        {note.text.substring(0, 200)}
        {note.text.length > 200 && "..."}
      </Typography>

      <Typography variant="caption" sx={{ color: "#999", fontSize: "0.7rem" }}>
        {note.updatedAt.getTime() !== note.createdAt.getTime()
          ? `Updated ${note.updatedAt.toLocaleString()}`
          : "Created " + note.createdAt.toLocaleString()}
      </Typography>
      {note.source && (
        <>
          {" • "}
          <Link
            href={note.source}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            onClick={(e) => e.stopPropagation()}
          >
            Source
          </Link>
        </>
      )}
    </Box>
  );
};

export default NoteCard;
