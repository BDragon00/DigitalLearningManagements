import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { apiFetch, clearSession, getStoredUser } from "../api";
import { useToast } from "../components/ToastContext";
import "./adminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const user = getStoredUser();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState("dashboard");

    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDesc, setNewCategoryDesc] = useState("");

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editCategoryDesc, setEditCategoryDesc] = useState("");

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    const loadAll = () => {
        setLoading(true);
        Promise.all([
            apiFetch("/users").catch(() => []),
            apiFetch("/categories").catch(() => []),
            apiFetch("/materials").catch(() => []),
        ]).then(([usersData, categoriesData, materialsData]) => {
            setUsers(usersData);
            setCategories(categoriesData);
            setMaterials(materialsData);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await apiFetch(`/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify({ RoleID: Number(newRoleId) }),
            });
            loadAll();
            showToast("Role updated", "success");
        } catch (err) {
            showToast(err.message || "Failed to update role", "error");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await apiFetch(`/users/${userId}`, { method: "DELETE" });
            loadAll();
            showToast("User deleted", "success");
        } catch (err) {
            showToast(
                err.message ||
                    "Delete failed (the user may still own materials)",
                "error"
            );
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await apiFetch("/categories", {
                method: "POST",
                body: JSON.stringify({
                    CategoryName: newCategoryName,
                    Description: newCategoryDesc,
                }),
            });
            setNewCategoryName("");
            setNewCategoryDesc("");
            loadAll();
            showToast("Category created", "success");
        } catch (err) {
            showToast(err.message || "Failed to create category", "error");
        }
    };

    const startEditCategory = (cat) => {
        setEditingCategoryId(cat.CategoryID);
        setEditCategoryName(cat.CategoryName);
        setEditCategoryDesc(cat.Description || "");
    };

    const submitEditCategory = async (categoryId) => {
        try {
            await apiFetch(`/categories/${categoryId}`, {
                method: "PUT",
                body: JSON.stringify({
                    CategoryName: editCategoryName,
                    Description: editCategoryDesc,
                }),
            });
            setEditingCategoryId(null);
            loadAll();
            showToast("Category updated", "success");
        } catch (err) {
            showToast(err.message || "Update failed", "error");
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await apiFetch(`/categories/${categoryId}`, { method: "DELETE" });
            loadAll();
            showToast("Category deleted", "success");
        } catch (err) {
            showToast(
                err.message ||
                    "Delete failed (materials may still use this category)",
                "error"
            );
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm("Delete this material? This cannot be undone."))
            return;
        try {
            await apiFetch(`/materials/${materialId}`, { method: "DELETE" });
            loadAll();
            showToast("Material deleted", "success");
        } catch (err) {
            showToast(err.message || "Delete failed", "error");
        }
    };

    const studentCount = users.filter((u) => u.RoleID === 1).length;
    const teacherCount = users.filter((u) => u.RoleID === 2).length;

    const tabTitles = {
        dashboard: "Dashboard",
        users: "Users",
        categories: "Categories",
        materials: "Materials",
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>Admin Panel</h2>

                <nav>
                    <button
                        className={activeTab === "dashboard" ? "active" : ""}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        Dashboard
                    </button>
                    <button
                        className={activeTab === "users" ? "active" : ""}
                        onClick={() => setActiveTab("users")}
                    >
                        Users
                    </button>
                    <button
                        className={activeTab === "categories" ? "active" : ""}
                        onClick={() => setActiveTab("categories")}
                    >
                        Categories
                    </button>
                    <button
                        className={activeTab === "materials" ? "active" : ""}
                        onClick={() => setActiveTab("materials")}
                    >
                        Materials
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <Link to="/change-password">Change password</Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>{tabTitles[activeTab]}</h1>
                        <p>
                            Digital Learning Management System · Signed in as{" "}
                            {user?.FullName}
                        </p>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        Log out
                    </button>
                </header>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {activeTab === "dashboard" && (
                            <>
                                <section className="admin-stats">
                                    <div className="stat-card">
                                        <h3>Users</h3>
                                        <p>{users.length}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Teachers</h3>
                                        <p>{teacherCount}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Students</h3>
                                        <p>{studentCount}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Materials</h3>
                                        <p>{materials.length}</p>
                                    </div>
                                </section>

                                <section className="admin-content-card">
                                    <h2>Welcome to the Admin Dashboard</h2>
                                    <p>
                                        Use the menu on the left to manage
                                        users, categories, materials, and
                                        view system statistics.
                                    </p>
                                </section>
                            </>
                        )}

                        {activeTab === "users" && (
                            <section className="admin-content-card">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Full name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.UserID}>
                                                <td>{u.FullName}</td>
                                                <td>{u.Email}</td>
                                                <td>
                                                    <select
                                                        value={u.RoleID}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                u.UserID,
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value={1}>
                                                            Student
                                                        </option>
                                                        <option value={2}>
                                                            Teacher
                                                        </option>
                                                        <option value={3}>
                                                            Admin
                                                        </option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {new Date(
                                                        u.CreatedAt
                                                    ).toLocaleDateString(
                                                        "en-US"
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="danger-link"
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                u.UserID
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {activeTab === "categories" && (
                            <>
                                <section className="admin-content-card">
                                    <h2>Add a new category</h2>
                                    <form
                                        className="inline-form"
                                        onSubmit={handleCreateCategory}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Category name"
                                            value={newCategoryName}
                                            onChange={(e) =>
                                                setNewCategoryName(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={newCategoryDesc}
                                            onChange={(e) =>
                                                setNewCategoryDesc(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button type="submit">Add</button>
                                    </form>
                                </section>

                                <section className="admin-content-card">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Category name</th>
                                                <th>Description</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map((cat) => (
                                                <tr key={cat.CategoryID}>
                                                    {editingCategoryId ===
                                                    cat.CategoryID ? (
                                                        <>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editCategoryName
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setEditCategoryName(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editCategoryDesc
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setEditCategoryDesc(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <button
                                                                    onClick={() =>
                                                                        submitEditCategory(
                                                                            cat.CategoryID
                                                                        )
                                                                    }
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setEditingCategoryId(
                                                                            null
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                {
                                                                    cat.CategoryName
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    cat.Description
                                                                }
                                                            </td>
                                                            <td>
                                                                <button
                                                                    onClick={() =>
                                                                        startEditCategory(
                                                                            cat
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="danger-link"
                                                                    onClick={() =>
                                                                        handleDeleteCategory(
                                                                            cat.CategoryID
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>
                            </>
                        )}

                        {activeTab === "materials" && (
                            <section className="admin-content-card">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Uploaded by</th>
                                            <th>File type</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((m) => (
                                            <tr key={m.MaterialID}>
                                                <td>{m.Title}</td>
                                                <td>{m.CategoryName}</td>
                                                <td>{m.UploaderName}</td>
                                                <td>{m.FileType}</td>
                                                <td>
                                                    <button
                                                        className="danger-link"
                                                        onClick={() =>
                                                            handleDeleteMaterial(
                                                                m.MaterialID
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;