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
  const [role, setRole] = useState("teacher"); // Default to joiner
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        fullName, 
        email, 
        password, 
        role,
        ...(role === "manager" ? { schoolName } : { schoolCode })
      };
      await register(payload);
      showToast("Registration successful", "success");
      nav("/", { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <Card title="Register" subtitle="Join the Student Bank platform">
        <form onSubmit={onSubmit}>
          <div className="auth-role-selector" style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
             <button 
              type="button" 
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => setRole('teacher')}
              style={role === 'teacher' ? activeBtnStyle : btnStyle}
             >
                Join School
             </button>
             <button 
              type="button" 
              className={`role-btn ${role === 'manager' ? 'active' : ''}`}
              onClick={() => setRole('manager')}
              style={role === 'manager' ? activeBtnStyle : btnStyle}
             >
                Start New School
             </button>
          </div>

          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {role === "manager" ? (
            <Input
              label="School name"
              placeholder="e.g. Greenvale Academy"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
          ) : (
            <Input
              label="School join code"
              placeholder="Provided by your manager"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="auth-submit">
             {role === 'manager' ? 'Create School & Rank' : 'Join & Register'}
          </Button>
        </form>
        <p className="auth-switch">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}

const btnStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  background: "white",
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
  transition: "all 0.2s"
};

const activeBtnStyle = {
  ...btnStyle,
  background: "var(--navy)",
  color: "white",
  borderColor: "var(--navy)"
};
