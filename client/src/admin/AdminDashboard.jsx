import "./adminDashboard.css";

function AdminDashboard() {
    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <h2>Admin Panel</h2>

                <nav>
                    <button>Dashboard</button>
                    <button>Users</button>
                    <button>Categories</button>
                    <button>Materials</button>
                    <button>Statistics</button>
                </nav>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Digital Learning Management System</p>
                    </div>

                    <button className="logout-button">
                        Logout
                    </button>
                </header>

                {/* Statistics cards */}
                <section className="admin-stats">
                    <div className="stat-card">
                        <h3>Users</h3>
                        <p>0</p>
                    </div>

                    <div className="stat-card">
                        <h3>Teachers</h3>
                        <p>0</p>
                    </div>

                    <div className="stat-card">
                        <h3>Students</h3>
                        <p>0</p>
                    </div>

                    <div className="stat-card">
                        <h3>Materials</h3>
                        <p>0</p>
                    </div>
                </section>

                {/* Welcome section */}
                <section className="admin-content-card">
                    <h2>Welcome to Admin Dashboard</h2>

                    <p>
                        Use the menu on the left to manage users,
                        categories, materials and system statistics.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;