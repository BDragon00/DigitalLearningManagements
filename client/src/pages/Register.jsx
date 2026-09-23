import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./auth.css";

const SECURITY_QUESTIONS = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your first school?",
];

function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState(
        SECURITY_QUESTIONS[0]
    );
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (!securityAnswer.trim()) {
            setError("Please answer the security question");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify({
                    FullName: fullName,
                    Email: email,
                    PasswordHash: password,
                    SecurityQuestion: securityQuestion,
                    SecurityAnswer: securityAnswer,
                }),
            });

            navigate("/login");
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-eyebrow">EduHub</div>
                <h1>Create an account</h1>
                <p className="auth-subtitle">
                    New accounts default to the Student role. An Admin can
                    change this later.
                </p>

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="field">
                        <label>Full name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jane Doe"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Confirm password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Security question</label>
                        <select
                            value={securityQuestion}
                            onChange={(e) =>
                                setSecurityQuestion(e.target.value)
                            }
                        >
                            {SECURITY_QUESTIONS.map((q) => (
                                <option key={q} value={q}>
                                    {q}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Your answer</label>
                        <input
                            type="text"
                            value={securityAnswer}
                            onChange={(e) =>
                                setSecurityAnswer(e.target.value)
                            }
                            placeholder="Used to reset your password later"
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;