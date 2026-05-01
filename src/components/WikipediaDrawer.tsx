import React, { useState, useEffect } from "react";
import QuillEditor from "./QuillEditor";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { type WikipediaArticle } from "../services/wikipediaApi";
import TagsSelect from "./TagsSelect";

type WikipediaDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedCountry: string | null;
  article: WikipediaArticle | null;
  articleText: string;
  onArticleTextChange: (text: string) => void;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onAddAsNote: (tags?: string[]) => void;
};

const PURPLE = "#667eea";
const PURPLE_DARK = "#764ba2";

const WikipediaDrawer: React.FC<WikipediaDrawerProps> = ({
  open,
  onClose,
  selectedCountry,
  article,
  articleText,
  onArticleTextChange,
  loading,
  error,
  onReload,
  onAddAsNote,
}) => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setTags([]);
  }, [article]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid="wikipedia-drawer"
      aria-label="Wikipedia article viewer"
      slotProps={{ paper: { role: "dialog", "aria-modal": "true" } }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "440px" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        },
      }}
    >
      {/* Loading strip */}
      {(loading || !article) && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            pt: 1.5,
            pb: 1,
            borderBottom: "1px solid rgba(102,126,234,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            {loading ? `Loading article on ${selectedCountry}…` : ""}
          </Typography>
          <IconButton
            onClick={onClose}
            data-testid="btn-drawer-close"
            aria-label="Close article viewer"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {loading && (
        <Box
          role="status"
          aria-label="Loading article"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }} fontWeight={500}>
            Loading article...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {article && !loading && (
        <>
          {/* Header */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              pt: 2,
              pb: 1.5,
              borderBottom: "1px solid rgba(102,126,234,0.15)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EditIcon sx={{ fontSize: 18, color: PURPLE_DARK }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: PURPLE_DARK, letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  Random Article — edit and save
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                data-testid="btn-drawer-close"
                aria-label="Close article viewer"
                size="small"
                sx={{ flexShrink: 0 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {article.country && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                <Chip label={article.country} color="primary" size="small" />
                <Chip
                  label="Load New Article"
                  icon={<RefreshIcon />}
                  onClick={onReload}
                  color="warning"
                  size="small"
                  data-testid="btn-drawer-reload"
                  aria-label={`Load new article for ${selectedCountry ?? "selected country"}`}
                  sx={{ cursor: "pointer" }}
                />
              </Box>
            )}
          </Box>

          {/* Scrollable body */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2.5,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Article title */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              data-testid="drawer-article-title"
              sx={{ lineHeight: 1.3 }}
            >
              {article.title}
            </Typography>

            <Box
              sx={{
                "& .ql-container": { fontSize: "0.875rem", height: "340px" },
                "& .ql-editor": { lineHeight: 1.7, overflowY: "auto", background: "#fff" },
                "& .ql-toolbar.ql-snow": { borderRadius: "4px 4px 0 0", background: "#f0f0f0" },
                "& .ql-container.ql-snow": { borderRadius: "0 0 4px 4px", background: "#fff" },
              }}
            >
              <QuillEditor
                value={articleText}
                onChange={onArticleTextChange}
                data-testid="drawer-article-text"
              />
            </Box>

            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 500, fontSize: "0.85rem" }}
            >
              Read more on Wikipedia →
            </Link>

            <TagsSelect size="small" value={tags} onChange={setTags} />

            <Box sx={{ mt: 1, pb: 3 }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<NoteAddOutlinedIcon />}
                onClick={() => onAddAsNote(tags)}
                data-testid="btn-drawer-save"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
                  boxShadow: "0 4px 14px rgba(102,126,234,0.4)",
                  "&:hover": {
                    background: `linear-gradient(135deg, #5a70d8 0%, #6a3f98 100%)`,
                  },
                }}
              >
                Save summary as note
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default WikipediaDrawer;
