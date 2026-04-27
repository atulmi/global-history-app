import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Typography, TextField, Button, Link, Divider, Alert, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const BG = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const API = "http://localhost:3000/api/auth";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof fieldErrors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
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
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Registration failed"); return; }
      login(data.token, data.user);
      navigate("/");
    } catch {
      setServerError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" fontWeight={700} mb={3}>Create account</Typography>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField label="Full name" fullWidth margin="normal"
          value={name} onChange={(e) => setName(e.target.value)}
          error={!!fieldErrors.name} helperText={fieldErrors.name} />
        <TextField label="Email" type="email" fullWidth margin="normal"
          value={email} onChange={(e) => setEmail(e.target.value)}
          error={!!fieldErrors.email} helperText={fieldErrors.email} />
        <TextField label="Password" type="password" fullWidth margin="normal"
          value={password} onChange={(e) => setPassword(e.target.value)}
          error={!!fieldErrors.password} helperText={fieldErrors.password ?? "Minimum 8 characters"} />
        <TextField label="Confirm password" type="password" fullWidth margin="normal" sx={{ mb: 3 }}
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          error={!!fieldErrors.confirm} helperText={fieldErrors.confirm} />

        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
          sx={{ background: BG, "&:hover": { opacity: 0.9 }, fontWeight: 600, mb: 2 }}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" textAlign="center" mt={2}>
        Already have an account?{" "}
        <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
      </Typography>
    </AuthLayout>
  );
};

export default RegisterPage;