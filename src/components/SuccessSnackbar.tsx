import React from "react";
import { Snackbar, Alert } from "@mui/material";

type SuccessSnackbarProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

const SuccessSnackbar: React.FC<SuccessSnackbarProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
