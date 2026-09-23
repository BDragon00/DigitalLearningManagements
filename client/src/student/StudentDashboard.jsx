import { Link, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../api";
import "./student.css";

function StudentDashboard() {
    const navigate = useNavigate();
    const user = getStoredUser();

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <div className="student-page">
            <div className="student-header">
                <div>
                    <div className="student-eyebrow">EduHub</div>
                    <h1>Student Dashboard</h1>
                    <p>Signed in as {user?.FullName}</p>
                </div>
                <nav>
                    <Link to="/change-password">Change password</Link>
                    <button
                        className="btn-ghost btn-sm"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </nav>
            </div>

            <div className="student-cta-card">
                <h2>Learning Materials Library</h2>
                <p>
                    Browse, search, download, and save your favorite study
                    materials.
                </p>
                <Link className="btn" to="/materials">
                    Browse materials →
                </Link>
            </div>
        </div>
    );
}

export default StudentDashboard;