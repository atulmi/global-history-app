import React from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Pagination,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/**
 * Collapsible filter bar and pagination strip for the All Notes page.
 *
 * The Country dropdown doubles as a view-mode switcher:
 * - Selecting "All Countries" or a plain country value keeps the single-list
 *   view (countrySectionCount = 0).
 * - Selecting a "sections_N" option switches to the multi-column grid view
 *   (countrySectionCount = N) and clears the global country filter.
 *
 * Every filter change resets the page to 1 to avoid landing on a now-empty page.
 * Pagination and the range label are hidden when there are no results.
 */
type FilterControlsProps = {
  filtersVisible: boolean;
  setFiltersVisible: (visible: boolean) => void;
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  // 0 = single-list mode; 1-4 = number of side-by-side country columns
  countrySectionCount: number;
  setCountrySectionCount: (count: number) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  // Pre-computed slice bounds passed in so this component stays purely presentational
  startIndex: number;
  endIndex: number;
  onResetFilters: () => void;
  showResetButton: boolean;
};

const FilterControls: React.FC<FilterControlsProps> = ({
  filtersVisible,
  setFiltersVisible,
  filterCountry,
  setFilterCountry,
  countrySectionCount,
  setCountrySectionCount,
  sortOrder,
  setSortOrder,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onResetFilters,
  showResetButton,
}) => {
  // Shared sx snippet that gives all dropdowns a consistent black 1px border.
  const selectStyle = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
      borderWidth: "1px",
    },
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", borderRadius: 2, p: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: filtersVisible ? 2 : 0,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Filters
        </Typography>
        <Button
          size="small"
          onClick={() => setFiltersVisible(!filtersVisible)}
          endIcon={filtersVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </Button>
      </Box>

      {filtersVisible && (
        <>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 180, ...selectStyle }}>
              <InputLabel>Country</InputLabel>
              <Select
                // Reflect the active mode back into the select:
                // multi-section mode uses "sections_N" synthetic values,
                // single-list mode uses the actual country string (or "All").
                value={
                  countrySectionCount > 0
                    ? `sections_${countrySectionCount}`
                    : filterCountry
                }
                label="Country"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith("sections_")) {
                    // Switch to multi-column grid; clear the global country filter.
                    setCountrySectionCount(parseInt(value.split("_")[1]));
                    setFilterCountry("All");
                  } else {
                    // Switch to single-list mode with the chosen country (or "All").
                    setCountrySectionCount(0);
                    setFilterCountry(value);
                  }
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="All">All Countries</MenuItem>
                <Divider />
                <MenuItem value="sections_1">Display notes for 1 country</MenuItem>
                <MenuItem value="sections_2">Display notes for 2 countries</MenuItem>
                <MenuItem value="sections_3">Display notes for 3 countries</MenuItem>
                <MenuItem value="sections_4">Display notes for 4 countries</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, ...selectStyle }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOrder}
                label="Sort By"
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120, ...selectStyle }}>
              <InputLabel>Per Page</InputLabel>
              <Select
                value={itemsPerPage}
                label="Per Page"
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={60}>60</MenuItem>
                <MenuItem value={80}>80</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            {showResetButton && (
              <Button variant="contained" size="small" onClick={onResetFilters}>
                Reset Filters
              </Button>
            )}
          </Box>

          {/* Pagination row — hidden when there are no results to avoid an orphaned widget */}
          {totalItems > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 2,
                mt: 2,
                pt: 2,
                borderTop: "1px solid #ddd",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="small"
                shape="rounded"
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 1 } }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FilterControls;
