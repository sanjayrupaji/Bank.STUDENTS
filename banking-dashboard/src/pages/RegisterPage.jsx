import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";
import { Input } from "../components/Input.jsx";
import { Card } from "../components/Card.jsx";
import "./auth.css";

export function RegisterPage() {
  const { register, user, loading: authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="auth-page">
        <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  const { showToast } = useToast();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ fullName, email, password });
      showToast("Account created", "success");
      nav("/", { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card title="Create account" subtitle="8+ characters with letters and numbers">
        <form onSubmit={onSubmit}>
          <Input
            label="Full name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="auth-submit">
            Register
          </Button>
        </form>
        <p className="auth-switch">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
