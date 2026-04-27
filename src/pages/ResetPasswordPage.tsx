import React, { useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Typography, TextField, Button, Link, Alert, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AuthLayout from "../components/AuthLayout";

const BG = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const API = "http://localhost:3000/api/auth";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: typeof fieldErrors = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Reset failed"); return; }
      setSuccess(true);
    } catch {
      setServerError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" fontWeight={700} mb={1}>Set new password</Typography>

      {!token && (
        <Alert severity="error" sx={{ mb: 2 }}>Invalid reset link. Please request a new one.</Alert>
      )}

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      {success ? (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>Password updated successfully.</Alert>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate("/login")}
            sx={{ background: BG, "&:hover": { opacity: 0.9 }, fontWeight: 600 }}>
            Sign in
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField label="New password" type="password" fullWidth margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password} helperText={fieldErrors.password ?? "Minimum 8 characters"}
            disabled={!token} />
          <TextField label="Confirm new password" type="password" fullWidth margin="normal" sx={{ mb: 3 }}
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            error={!!fieldErrors.confirm} helperText={fieldErrors.confirm}
            disabled={!token} />
          <Button type="submit" variant="contained" fullWidth size="large"
            disabled={loading || !token}
            sx={{ background: BG, "&:hover": { opacity: 0.9 }, fontWeight: 600, mb: 2 }}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </Box>
      )}

      <Link component={RouterLink} to="/login" variant="body2"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <ArrowBackIcon fontSize="small" /> Back to sign in
      </Link>
    </AuthLayout>
  );
};

export default ResetPasswordPage;