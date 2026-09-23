import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, saveSession } from "../api";
import "./auth.css";

function Login() {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const expired = searchParams.get("expired") === "1";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ Email, Password }),
            });

            saveSession(data.token, data.user);

            switch (data.user.RoleName) {
                case "Admin":
                    navigate("/admin");
                    break;
                case "Teacher":
                    navigate("/teacher");
                    break;
                case "Student":
                    navigate("/student");
                    break;
                default:
                    navigate("/login");
            }
        } catch (err) {
            setError(err.message || "Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-eyebrow">EduHub</div>
                <h1>Sign in</h1>
                <p className="auth-subtitle">
                    Access the platform to view and manage learning materials.
                </p>

                {expired && (
                    <p className="auth-error">
                        Your session has expired. Please sign in again.
                    </p>
                )}

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="field">
                        <div className="field-row">
                            <label>Password</label>
                            <Link className="field-link" to="/forgot-password">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;