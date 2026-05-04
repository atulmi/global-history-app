import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  type SxProps,
  type Theme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { type Note } from "../types/Note";

const PURPLE = "#667eea";

type NotesGridProps = {
  notes: Note[];
  onEdit: (note: Note, id: string) => void;
  onDelete: (id: string) => void;
  variant?: "cards" | "compact";
  sx?: SxProps<Theme>;
};

const NotesGrid: React.FC<NotesGridProps> = ({
  notes,
  onEdit,
  onDelete,
  variant = "cards",
  sx,
}) => {
  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 4,
          alignContent: "start",
          py: 1,
          ...sx,
        }}
      >
        {notes.map((note) => {
          const title =
            note.title ||
            note.text.replace(/<[^>]+>/g, "").slice(0, 40) ||
            "(untitled)";
          const tooltipContent = note.title || title;

          return (
            <Tooltip key={note.id} title={tooltipContent} placement="top" arrow>
              <Box
                onClick={() => onEdit(note, note.id)}
                sx={{
                  cursor: "pointer",
                  minHeight: 130,
                  border: "1px solid #c4c9e0",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  transition: "background 0.12s, box-shadow 0.12s",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${PURPLE}12 0%, ${PURPLE}08 100%)`,
                    borderColor: PURPLE,
                    boxShadow: `0 2px 10px ${PURPLE}30`,
                    "& .tile-actions": { opacity: 1 },
                  },
                }}
              >
                {/* Top gradient strip */}
                <Box
                  sx={{
                    height: 6,
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                />

                {/* Content */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "#6b7280",
                        lineHeight: 1.3,
                        mt: 0.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {note.text.replace(/<[^>]+>/g, "")}
                    </Typography>
                  </Box>
                  <Box
                    className="tile-actions"
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexShrink: 0,
                      opacity: 0,
                      transition: "opacity 0.12s",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onEdit(note, note.id)}
                      sx={{ p: 0.25, color: PURPLE }}
                    >
                      <EditIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(note.id)}
                      sx={{ p: 0.25, color: "#e53935" }}
                    >
                      <DeleteIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 3,
        alignContent: "start",
        py: 1,
        ...sx,
      }}
    >
      {notes.map((note) => (
        <Card
          key={note.id}
          onClick={() => onEdit(note, note.id)}
          sx={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            border: "1px solid #c4c9e0",
            boxShadow: "0 2px 8px rgba(102,126,234,0.1)",
            transition: "box-shadow 0.15s, transform 0.15s",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(102,126,234,0.25)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {/* Top gradient strip */}
          <Box
            sx={{
              height: 7,
              flexShrink: 0,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />

          <CardContent sx={{ flex: 1, pb: 0.5, px: 2, pt: 1.5 }}>
            {/* Title */}
            {note.title ? (
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#111827", mb: 0.75, lineHeight: 1.3 }}
              >
                {note.title}
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                sx={{ color: "#9ca3af", fontStyle: "italic", mb: 0.75 }}
              >
                (untitled)
              </Typography>
            )}

            {/* Text preview */}
            <Typography
              variant="body2"
              sx={{
                color: "#4b5563",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1,
              }}
            >
              {note.text.replace(/<[^>]+>/g, "")}
            </Typography>

            {/* Tags */}
            {note.tags.length > 0 && (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}
              >
                {note.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 20,
                      backgroundColor: "#ede9f7",
                      color: "#5b21b6",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            )}
          </CardContent>

          <CardActions
            sx={{
              px: 1.5,
              pt: 0.5,
              pb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #eef0f9",
              mt: "auto",
            }}
          >
            {/* Country + date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              {note.country && (
                <Chip
                  label={note.country}
                  size="small"
                  color="primary"
                  sx={{ fontSize: "0.65rem", height: 20, maxWidth: 100 }}
                />
              )}
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", whiteSpace: "nowrap" }}
              >
                {note.createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note, note.id);
                }}
                aria-label={`Edit note: ${note.title || "Untitled"}`}
                sx={{
                  color: PURPLE,
                  "&:hover": { backgroundColor: `${PURPLE}18` },
                }}
              >
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                aria-label={`Delete note: ${note.title || "Untitled"}`}
                sx={{
                  color: "#e53935",
                  "&:hover": { backgroundColor: "#e5393518" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default NotesGrid;
