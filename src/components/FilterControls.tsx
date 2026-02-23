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
} from "@mui/material";
import { TAG_CATEGORIES } from "../data/countries";

/**
 * Filter bar for the All Notes page.
 *
 * The Country dropdown doubles as a view-mode switcher:
 * - Selecting "All Countries" or a plain country value keeps the single-list
 *   view (countrySectionCount = 0).
 * - Selecting a "sections_N" option switches to the multi-column grid view
 *   (countrySectionCount = N) and clears the global country filter.
 *
 * The search field sits after Sort By, and Reset Filters is pushed to the far right.
 */
type FilterControlsProps = {
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  // 0 = single-list mode; 1-4 = number of side-by-side country columns
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
}) => {
  // Shared sx snippet that gives all dropdowns a consistent black 1px border.
  const selectStyle = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
      borderWidth: "1px",
    },
  };

  return (
    <Box sx={{ mb: 4 }}>
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
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, ...selectStyle }}>
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
          sx={{
            minWidth: 220,
            backgroundColor: "white",
            borderRadius: 1,
            ...selectStyle,
          }}
        />

        {/* Reset Filters pushed to the far right */}
        {showResetButton && (
          <Button
            variant="contained"
            size="small"
            onClick={onResetFilters}
            sx={{ marginLeft: "auto" }}
          >
            Reset Filters
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FilterControls;
