import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { TAG_CATEGORIES, COUNTRIES } from "../data/countries";

/**
 * Filter bar for the My Notes page.
 *
 * The Country dropdown doubles as a view-mode switcher:
 * - Selecting "All Countries" or a plain country value keeps the single-list
 *   view (countrySectionCount = 0).
 * - Selecting "sections_1" or "sections_2" switches to a split-column view
 *   (countrySectionCount = 1 or 2) and clears the global country filter.
 *
 * When split mode is active, an Autocomplete picker for each column appears
 * inline to the right of the display-mode dropdown.
 *
 * The search field sits after Sort By, and Reset Filters is pushed to the far right.
 */
type FilterControlsProps = {
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  // 0 = single-list mode; 1-2 = number of side-by-side country columns
  countrySectionCount: number;
  setCountrySectionCount: (count: number) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onResetFilters: () => void;
  showResetButton: boolean;
  displayedCount?: number;
  // Country values for the split-view columns
  countryFilters: [string, string];
  setCountryFilters: (filters: [string, string]) => void;
};

const FilterControls: React.FC<FilterControlsProps> = ({
  filterCountry,
  setFilterCountry,
  countrySectionCount,
  setCountrySectionCount,
  sortOrder,
  setSortOrder,
  filterTag,
  setFilterTag,
  searchTerm,
  onSearchChange,
  onResetFilters,
  showResetButton,
  displayedCount,
  countryFilters,
  setCountryFilters,
}) => {
  // Shared sx snippet that gives all dropdowns a consistent black 1px border.
  const selectStyle = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
      borderWidth: "1px",
      boxShadow: "1px 1px 1px gray",
    },
  };

  return (
    <Box
      data-testid="filter-controls"
      role="group"
      aria-label="Filter and sort controls"
      sx={{ mb: 4 }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FormControl
          data-testid="filter-country"
          size="small"
          sx={{ minWidth: 180, ...selectStyle }}
        >
          <InputLabel>Country</InputLabel>
          <Select
            // Reflect the active mode back into the select:
            // split mode uses "sections_N" synthetic values,
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
                // Switch to split-column view; clear the global country filter.
                setCountrySectionCount(parseInt(value.split("_")[1]));
                setFilterCountry("All");
              } else {
                // Switch to single-list mode with the chosen country (or "All").
                setCountrySectionCount(0);
                setFilterCountry(value);
              }
            }}
          >
            <MenuItem value="All">All Countries</MenuItem>
            <Divider />
            <MenuItem value="sections_1">Display notes for 1 country</MenuItem>
            <MenuItem value="sections_2">
              Display notes for 2 countries
            </MenuItem>
          </Select>
        </FormControl>

        {/* Inline country pickers — shown only when split mode is active */}
        {countrySectionCount > 0 &&
          Array.from({ length: countrySectionCount }).map((_, i) => (
            <Autocomplete
              key={i}
              options={COUNTRIES}
              value={countryFilters[i] || null}
              onChange={(_, newValue) => {
                const updated = [...countryFilters] as [string, string];
                updated[i] = newValue || "";
                setCountryFilters(updated);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Country ${i + 1}`}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black",
                      borderWidth: "1px",
                    },
                  }}
                />
              )}
              size="small"
              sx={{ minWidth: 180 }}
            />
          ))}

        <FormControl
          data-testid="filter-sort"
          size="small"
          sx={{ minWidth: 150, ...selectStyle }}
        >
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            label="Sort By"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          data-testid="filter-tag"
          size="small"
          sx={{ minWidth: 150, ...selectStyle }}
        >
          <InputLabel>Tag</InputLabel>
          <Select
            value={filterTag}
            label="Tag"
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <MenuItem value="All">All Tags</MenuItem>
            <Divider />
            {TAG_CATEGORIES.map((tag: string) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search Notes"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="filter-search"
          sx={{
            minWidth: 220,
            backgroundColor: "white",
            borderRadius: 1,
            ...selectStyle,
          }}
        />

        <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
          {displayedCount !== undefined && (
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid="filter-displayed-count"
              sx={{ whiteSpace: "nowrap" }}
            >
              {displayedCount} {displayedCount === 1 ? "note" : "notes"} shown
            </Typography>
          )}
          {showResetButton && (
            <Button
              variant="contained"
              size="small"
              onClick={onResetFilters}
              data-testid="btn-reset-filters"
              aria-label="Reset all filters"
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FilterControls;
