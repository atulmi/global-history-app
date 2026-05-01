import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput } from "@mui/material";
import { TAG_CATEGORIES } from "../data/countries";

type TagsSelectProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  size?: "small" | "medium";
  sx?: object;
};

const TagsSelect: React.FC<TagsSelectProps> = ({
  value,
  onChange,
  size = "medium",
  sx,
}) => {
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
          height: size === "small" ? "40px" : "56px",
          overflow: "hidden",
          minWidth: 0,
        },
        "& .MuiSelect-select": {
          minWidth: "0 !important",
          overflow: "hidden !important",
          textOverflow: "ellipsis !important",
          whiteSpace: "nowrap !important",
        },
        ...sx,
      }}
    >
      <InputLabel size={size === "small" ? "small" : undefined}>
        Tags
      </InputLabel>
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
        renderValue={(selected) =>
          selected.length === 1 ? selected[0] : `${selected.length} tags selected`
        }
      >
        {TAG_CATEGORIES.map((tag) => (
          <MenuItem
            key={tag}
            value={tag}
            sx={{
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: 600,
              },
              "&.Mui-selected:hover": {
                background: "linear-gradient(135deg, #5a70d8 0%, #6a3f98 100%)",
              },
            }}
          >
            {tag}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TagsSelect;
