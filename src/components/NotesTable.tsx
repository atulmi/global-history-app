/**
 * NotesTable
 *
 * A paginated MUI table for displaying a list of notes.
 *
 * Used in two modes:
 * - Full mode (showCountry=true): shown in the single-list view on AllNotesPage.
 *   Includes a Country column and a slightly longer text preview.
 * - Section mode (showCountry=false): shown inside per-country columns in the
 *   multi-section view. Omits the Country column to save horizontal space.
 *
 * Clicking a row opens the edit dialog. The Delete button uses stopPropagation
 * so it doesn't also trigger the row's edit handler.
 *
 * Pagination state is internal. The page resets to 0 whenever the `notes` prop
 * changes so stale page positions can't occur after filters are applied.
 *
 * The Title column is sortable (asc/desc) independently of the date sort
 * applied by the parent. Clicking the header toggles direction; a second click
 * on the active sort reverses it.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  type SxProps,
  type Theme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { type Note } from "../types/Note";

const PURPLE = "#667eea";
const PURPLE_DARK = "#764ba2";

// Near-black navy — maximum contrast header, no ambiguity about where data starts
const HEADER_BG = "#1a1a2e";
// Clearly visible row divider — GitHub uses #d0d7de, we use a purple-tinted equivalent
const ROW_BORDER = "#c4c9e0";
// Even rows: noticeably off-white so alternation is readable without hovering
const ROW_EVEN_BG = "#eef0f9";

type NotesTableProps = {
  /** The already-filtered and sorted notes to display. */
  notes: Note[];
  /** When false, the Country column is hidden (used in per-country section mode). */
  showCountry?: boolean;
  onEdit: (note: Note, id: string) => void;
  onDelete: (id: string) => void;
  /** Passed to the outer Box so callers can control sizing (e.g. flex: 1). */
  sx?: SxProps<Theme>;
};

const headerCellSx = {
  fontWeight: 700,
  fontSize: "0.68rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  // Near-black gives maximum contrast — white text passes WCAG AAA
  backgroundColor: HEADER_BG,
  color: "#ffffff",
  // A thin purple accent line separates header from body
  borderBottom: `3px solid ${PURPLE}`,
  py: 1.75,
  whiteSpace: "nowrap" as const,
};

const sortLabelSx = {
  color: "#ffffff !important",
  "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.7) !important" },
  "&:hover": { color: "rgba(255,255,255,0.85) !important" },
  "&.Mui-active": { color: "#ffffff !important" },
};

const rowSx = {
  cursor: "pointer",
  transition: "background 0.12s ease",
  "&:nth-of-type(odd)": { backgroundColor: "#ffffff" },
  "&:nth-of-type(even)": { backgroundColor: ROW_EVEN_BG },
  "& .MuiTableCell-root": {
    // Solid, clearly-visible divider line between every row
    borderBottom: `1px solid ${ROW_BORDER}`,
    py: 1.4,
    px: 1.5,
  },
  "&:last-child .MuiTableCell-root": { borderBottom: "none" },
  "&:hover": {
    background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
    "& .MuiTableCell-root": {
      color: "#ffffff",
      borderBottom: "1px solid rgba(255,255,255,0.15)",
    },
    "& .MuiSvgIcon-root": { color: "#ffffff" },
    "& .MuiChip-root": {
      backgroundColor: "rgba(255,255,255,0.18)",
      borderColor: "rgba(255,255,255,0.5)",
    },
    "& .MuiChip-label": { color: "#ffffff" },
    "& .note-title": { color: "#ffffff" },
    "& .note-untitled": { color: "rgba(255,255,255,0.6)" },
  },
};

const NotesTable: React.FC<NotesTableProps> = ({
  notes,
  showCountry = true,
  onEdit,
  onDelete,
  sx,
}) => {
  const textPreviewLength = showCountry ? 150 : 120;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [titleSort, setTitleSort] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    setPage(0);
  }, [notes]);

  const handleTitleSortClick = () => {
    setTitleSort((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const sortedNotes = titleSort
    ? [...notes].sort((a, b) => {
        const aTitle = (a.title || "").toLowerCase();
        const bTitle = (b.title || "").toLowerCase();
        return titleSort === "asc"
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle);
      })
    : notes;

  const pagedNotes = sortedNotes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        overflow: "hidden",
        // Layered shadow: tight contact shadow for grounding + ambient depth layer
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.18), 0 8px 24px rgba(102,126,234,0.12)",
        border: `1px solid ${ROW_BORDER}`,
        ...sx,
      }}
    >
      <TableContainer
        data-testid="notes-table"
        sx={{ flex: 1, overflow: "auto" }}
      >
        <Table size="small" stickyHeader aria-label="Notes">
          <TableHead>
            <TableRow>
              <TableCell scope="col" sx={{ ...headerCellSx, width: 160 }}>
                <TableSortLabel
                  active={titleSort !== null}
                  direction={titleSort ?? "asc"}
                  onClick={handleTitleSortClick}
                  sx={sortLabelSx}
                  IconComponent={
                    titleSort === null ? UnfoldMoreIcon : ArrowDownwardIcon
                  }
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell scope="col" sx={headerCellSx}>
                Preview
              </TableCell>
              {showCountry && (
                <TableCell scope="col" sx={{ ...headerCellSx, width: 140 }}>
                  Country
                </TableCell>
              )}
              <TableCell
                scope="col"
                sx={{ ...headerCellSx, width: showCountry ? 180 : 160 }}
              >
                Tags
              </TableCell>
              <TableCell
                scope="col"
                sx={{ ...headerCellSx, width: showCountry ? 110 : 100 }}
              >
                Created
              </TableCell>
              <TableCell
                scope="col"
                sx={{ ...headerCellSx, width: showCountry ? 90 : 80 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedNotes.map((note) => (
              <TableRow
                key={note.id}
                data-testid="notes-table-row"
                data-id={note.id}
                onClick={() => onEdit(note, note.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEdit(note, note.id);
                  }
                }}
                tabIndex={0}
                aria-label={`Edit note: ${note.title || "Untitled"}`}
                sx={rowSx}
              >
                {/* Title */}
                <TableCell>
                  {note.title ? (
                    <Box
                      className="note-title"
                      component="span"
                      sx={{ fontWeight: 700, color: "#111827", fontSize: "0.85rem" }}
                    >
                      {note.title}
                    </Box>
                  ) : (
                    <Box
                      className="note-untitled"
                      component="span"
                      sx={{ fontStyle: "italic", color: "#9ca3af", fontSize: "0.82rem" }}
                    >
                      (untitled)
                    </Box>
                  )}
                </TableCell>

                {/* Text preview */}
                <Tooltip
                  title={
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {note.text}
                    </Box>
                  }
                  arrow
                  slotProps={{ tooltip: { sx: { maxWidth: 400, p: 1.5 } } }}
                >
                  <TableCell
                    sx={{
                      maxWidth: "100px",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      fontSize: "0.82rem",
                      color: "#374151",
                    }}
                  >
                    {note.text.substring(0, textPreviewLength)}
                  </TableCell>
                </Tooltip>

                {/* Country */}
                {showCountry && (
                  <TableCell sx={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>
                    {note.country || ""}
                  </TableCell>
                )}

                {/* Tags */}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {note.tags.length > 0 ? (
                      note.tags.map((tag) => (
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
                            border: "none",
                          }}
                        />
                      ))
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          color: "#ccc",
                          fontSize: "0.78rem",
                          fontStyle: "italic",
                        }}
                      >
                        —
                      </Box>
                    )}
                  </Box>
                </TableCell>

                {/* Created date */}
                <TableCell
                  sx={{
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {note.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.25 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(note, note.id)}
                      aria-label={`Edit note: ${note.title || "Untitled"}`}
                      sx={{
                        color: PURPLE,
                        "&:hover": { backgroundColor: `${PURPLE}18` },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      data-testid="btn-delete-note"
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
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={notes.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          flexShrink: 0,
          borderTop: `2px solid ${ROW_BORDER}`,
          backgroundColor: "#f3f4f8",
          "& .MuiTablePagination-toolbar": { minHeight: 44 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.78rem",
            color: "#374151",
            fontWeight: 500,
          },
        }}
      />
    </Box>
  );
};

export default NotesTable;
