import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Typography, TextField, Button, Link, Alert, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AuthLayout from "../components/AuthLayout";

const BG = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const API = "http://localhost:3000/api/auth";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const err = validate();
    if (err) { setEmailError(err); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Request failed"); return; }
      setSubmitted(true);
    } catch {
      setServerError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password">
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your email and we'll send you a link to reset your password.
      </Typography>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      {submitted ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          If an account exists for <strong>{email}</strong>, a reset link has been sent.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField label="Email" type="email" fullWidth margin="normal" sx={{ mb: 3 }}
            value={email} onChange={(e) => setEmail(e.target.value)}
            error={!!emailError} helperText={emailError} />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ background: BG, "&:hover": { opacity: 0.9 }, fontWeight: 600, mb: 2 }}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </Box>
      )}

      <Link component={RouterLink} to="/login" variant="body2"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <ArrowBackIcon fontSize="small" /> Back to login page
      </Link>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;