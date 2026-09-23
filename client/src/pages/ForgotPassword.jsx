import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import "./auth.css";

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFindQuestion = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch(
                `/auth/security-question?email=${encodeURIComponent(email)}`
            );
            setQuestion(data.SecurityQuestion);
            setStep(2);
        } catch (err) {
            setError(
                err.message ||
                    "No security question found for this email"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/auth/reset-password", {
                method: "PUT",
                body: JSON.stringify({
                    Email: email,
                    SecurityAnswer: answer,
                    NewPassword: newPassword,
                }),
            });
            setSuccess("Password reset successfully! You can now sign in.");
            setStep(3);
        } catch (err) {
            setError(err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link className="auth-back" to="/login">
                    ← Back to sign in
                </Link>

                <div className="auth-eyebrow">EduHub</div>
                <h1>Forgot password</h1>

                {step === 1 && (
                    <>
                        <p className="auth-subtitle">
                            Enter the email you registered with to find your
                            security question.
                        </p>
                        <form
                            className="auth-form"
                            onSubmit={handleFindQuestion}
                        >
                            <div className="field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="auth-error">{error}</p>
                            )}

                            <button
                                className="btn"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Continue"}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="auth-subtitle">
                            Answer your security question to set a new
                            password.
                        </p>
                        <form
                            className="auth-form"
                            onSubmit={handleResetPassword}
                        >
                            <div className="field">
                                <label>{question}</label>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) =>
                                        setAnswer(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>New password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="At least 6 characters"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Confirm new password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <p className="auth-error">{error}</p>
                            )}

                            <button
                                className="btn"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset password"}
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <p className="auth-success">{success}</p>
                        <Link className="btn" to="/login">
                            Go to sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;