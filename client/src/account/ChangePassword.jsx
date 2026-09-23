import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, getStoredUser } from "../api";
import { useToast } from "../components/ToastContext";
import "../pages/auth.css";

function backLinkFor(user) {
    if (!user) return "/login";
    switch (user.RoleName) {
        case "Admin":
            return "/admin";
        case "Teacher":
            return "/teacher";
        case "Student":
            return "/student";
        default:
            return "/login";
    }
}

function ChangePassword() {
    const user = getStoredUser();
    const { showToast } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/auth/change-password", {
                method: "PUT",
                body: JSON.stringify({
                    CurrentPassword: currentPassword,
                    NewPassword: newPassword,
                }),
            });

            showToast("Password changed successfully!", "success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link className="auth-back" to={backLinkFor(user)}>
                    ← Back
                </Link>

                <div className="auth-eyebrow">Account</div>
                <h1>Change password</h1>
                <p className="auth-subtitle">Signed in as {user?.FullName}</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Current password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label>New password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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

                    {error && <p className="auth-error">{error}</p>}

                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Change password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;