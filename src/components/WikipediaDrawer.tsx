import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { type WikipediaArticle } from "../services/wikipediaApi";
import TagsSelect from "./TagsSelect";

type WikipediaDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedCountry: string | null;
  article: WikipediaArticle | null;
  articleText: string;
  onArticleTextChange: (text: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onSave: () => void;
};

const WikipediaDrawer: React.FC<WikipediaDrawerProps> = ({
  open,
  onClose,
  selectedCountry,
  article,
  articleText,
  onArticleTextChange,
  tags,
  onTagsChange,
  loading,
  error,
  onReload,
  onSave,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "500px" },
          padding: "20px",
          background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {article ? article.title : `Loading article on ${selectedCountry}...`}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ marginTop: 2 }} fontWeight={500}>
            Loading article...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: "20px" }}>
          {error}
        </Alert>
      )}

      {article && !loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {article.country && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
              <Chip label={article.country} color="primary" size="small" />
              <Chip
                label="Load New Article"
                icon={<RefreshIcon />}
                onClick={onReload}
                color="warning"
                size="small"
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              />
            </Box>
          )}
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={articleText}
            onChange={(e) => onArticleTextChange(e.target.value)}
            sx={{
              marginBottom: 2,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              "& .MuiInputBase-root": {
                height: "100%",
                alignItems: "flex-start",
              },
              "& .MuiOutlinedInput-input": {
                lineHeight: 1.7,
                height: "100% !important",
                overflowY: "auto !important",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                zIndex: 1,
              },
            }}
          />
          <TagsSelect value={tags} onChange={onTagsChange} sx={{ marginBottom: 2 }} />
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "block", marginBottom: 2, fontWeight: 500 }}
          >
            Read more on Wikipedia →
          </Link>
          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            fullWidth
            size="large"
          >
            Save as Note
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default WikipediaDrawer;
