import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Typography, TextField, Button, Link, Divider, Alert, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const BG = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const API = "http://localhost:3000/api/auth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof fieldErrors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Login failed"); return; }
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
      <Typography variant="h5" fontWeight={700} mb={3}>Sign in</Typography>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField label="Email" type="email" fullWidth margin="normal"
          value={email} onChange={(e) => setEmail(e.target.value)}
          error={!!fieldErrors.email} helperText={fieldErrors.email} />
        <TextField label="Password" type="password" fullWidth margin="normal"
          value={password} onChange={(e) => setPassword(e.target.value)}
          error={!!fieldErrors.password} helperText={fieldErrors.password} />

        <Box sx={{ textAlign: "right", mt: 0.5, mb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">Forgot password?</Link>
        </Box>

        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
          sx={{ background: BG, "&:hover": { opacity: 0.9 }, fontWeight: 600, mb: 2 }}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" textAlign="center" mt={2}>
        Don't have an account?{" "}
        <Link component={RouterLink} to="/register" fontWeight={600}>Register</Link>
      </Typography>
    </AuthLayout>
  );
};

export default LoginPage;