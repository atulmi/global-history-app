import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip,
} from "@mui/material";
import { TAG_CATEGORIES } from "../data/countries";

type TagsSelectProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  size?: "small" | "medium";
  sx?: object;
};

const TagsSelect: React.FC<TagsSelectProps> = ({ value, onChange, size = "medium", sx }) => {
  const [open, setOpen] = useState(false);

  return (
    <FormControl
      fullWidth
      size={size}
      data-testid="tags-select"
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "#fafafa",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
        },
        ...sx,
      }}
    >
      <InputLabel size={size === "small" ? "small" : undefined}>Tags</InputLabel>
      <Select
        multiple
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value}
        onChange={(e) => {
          onChange(e.target.value as string[]);
          setOpen(false);
        }}
        input={<OutlinedInput label="Tags" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((t) => t !== tag));
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ))}
          </Box>
        )}
      >
        {TAG_CATEGORIES.map((tag) => (
          <MenuItem key={tag} value={tag}>
            {tag}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TagsSelect;
