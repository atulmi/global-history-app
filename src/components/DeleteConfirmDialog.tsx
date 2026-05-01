import React from "react";
import { Dialog, Typography, Button, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type DeleteConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  body?: string;
};

const PURPLE = "#667eea";
const PURPLE_DARK = "#764ba2";

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Note?",
  body = "Are you sure you want to delete this note? This action cannot be undone.",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      data-testid="delete-confirm-dialog"
      aria-labelledby="delete-dialog-heading"
      aria-describedby="delete-dialog-body"
      slotProps={{
        paper: { sx: { borderRadius: "18px", overflow: "hidden", boxShadow: "0 24px 60px rgba(229, 57, 53, 0.15), 0 8px 20px rgba(0,0,0,0.1)" } },
        backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.75)" } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <DeleteOutlineIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 22 }} />
        <Typography
          id="delete-dialog-heading"
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "#fff", letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1, backgroundColor: "#fdfdff" }}>
        <Typography id="delete-dialog-body" variant="body2" sx={{ color: "#555", lineHeight: 1.7 }}>
          {body}
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          backgroundColor: "#fdfdff",
          borderTop: "1px solid rgba(229, 57, 53, 0.1)",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#888",
            borderRadius: "10px",
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#f5f5f5", color: "#555" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          data-testid="btn-delete-confirm"
          sx={{
            backgroundColor: "#e53935",
            borderRadius: "10px",
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(229, 57, 53, 0.35)",
            "&:hover": {
              backgroundColor: "#c62828",
              boxShadow: "0 6px 18px rgba(229, 57, 53, 0.45)",
            },
          }}
        >
          Delete
        </Button>
      </Box>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
