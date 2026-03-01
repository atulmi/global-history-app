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

// Applied to every header cell — gray background matches the section-box style.
const headerCellSx = {
  fontWeight: 600,
  background: "gray",
  color: "white",
};

// TableSortLabel renders dark by default; override to white for the gray header.
const sortLabelSx = {
  color: "white !important",
  "& .MuiTableSortLabel-icon": { color: "white !important" },
  "&:hover": { color: "white !important" },
};

// Row base style + hover effect that mirrors the navbar gradient.
const rowSx = {
  cursor: "pointer",
  backgroundColor: "white",
  "&:hover": {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    // Both text and icon colours must be overridden explicitly because MUI
    // scopes TableCell and SvgIcon colours with higher-specificity defaults.
    "& .MuiTableCell-root": { color: "white" },
    "& .MuiSvgIcon-root": { color: "white" },
  },
};

const NotesTable: React.FC<NotesTableProps> = ({
  notes,
  showCountry = true,
  onEdit,
  onDelete,
  sx,
}) => {
  // Shorten the preview in section mode to fit narrower columns.
  const textPreviewLength = showCountry ? 150 : 120;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // null = natural order (parent's date sort); "asc"/"desc" = title sort active.
  const [titleSort, setTitleSort] = useState<"asc" | "desc" | null>(null);

  // Any time the note list changes (filter/search/sort), jump back to page 1
  // so the user never lands on an empty page.
  useEffect(() => {
    setPage(0);
  }, [notes]);

  // Cycles: natural → asc → desc → natural.
  const handleTitleSortClick = () => {
    setTitleSort((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  // When titleSort is null, preserve the parent-provided (date) order.
  const sortedNotes = titleSort
    ? [...notes].sort((a, b) => {
        const aTitle = (a.title || "").toLowerCase();
        const bTitle = (b.title || "").toLowerCase();
        return titleSort === "asc"
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle);
      })
    : notes;

  // Slice the sorted list down to just the current page's rows.
  const pagedNotes = sortedNotes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    // Outer Box is a flex column so the pagination bar stays pinned at the
    // bottom while only the TableContainer scrolls above it.
    <Box sx={{ display: "flex", flexDirection: "column", ...sx }}>
      <TableContainer
        data-testid="notes-table"
        sx={{
          flex: 1,
          overflow: "auto",
          borderLeft: "1px solid black",
          borderRight: "1px solid black",
          borderBottom: "1px solid black",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {/* Title — sortable, fixed narrow width so Text gets the space */}
              <TableCell sx={{ ...headerCellSx, width: 160 }}>
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
              {showCountry && (
                <TableCell sx={{ ...headerCellSx, width: 140 }}>
                  Country
                </TableCell>
              )}
              {/* Tag and Created columns are slightly narrower in section mode */}
              <TableCell
                sx={{ ...headerCellSx, width: showCountry ? 180 : 160 }}
              >
                Tags
              </TableCell>
              <TableCell sx={headerCellSx}>Text</TableCell>
              <TableCell
                sx={{ ...headerCellSx, width: showCountry ? 120 : 110 }}
              >
                Created
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: showCountry ? 90 : 80 }}>
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
                sx={rowSx}
              >
                <TableCell>{note.title || "(untitled)"}</TableCell>
                {showCountry && <TableCell>{note.country || ""}</TableCell>}
                <TableCell>{note.tags.join(", ")}</TableCell>
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
                  slotProps={{
                    tooltip: { sx: { maxWidth: 400, p: 1.5 } },
                  }}
                >
                  <TableCell
                    sx={{
                      maxWidth: "100px",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {note.text}
                  </TableCell>
                </Tooltip>
                <TableCell>{note.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(note, note.id)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {/* stopPropagation prevents the row's onClick (edit) from
                        also firing when the delete button is clicked. */}
                    <IconButton
                      size="small"
                      data-testid="btn-delete-note"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                      }}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination bar — count drives the "1–20 of N" label automatically. */}
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
        sx={{ flexShrink: 0, borderTop: "1px solid rgba(0,0,0,0.12)" }}
      />
    </Box>
  );
};

export default NotesTable;
