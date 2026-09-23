import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, clearSession, getStoredUser } from "../api";
import { useToast } from "../components/ToastContext";
import "./teacher.css";

function TeacherDashboard() {
    const navigate = useNavigate();
    const user = getStoredUser();
    const { showToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [myMaterials, setMyMaterials] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    const loadCategories = () => {
        apiFetch("/categories")
            .then((data) => setCategories(data))
            .catch(() => setCategories([]));
    };

    const loadMyMaterials = () => {
        if (!user) return;
        setLoadingList(true);

        apiFetch(`/materials/user/${user.UserID}`)
            .then((data) => setMyMaterials(data))
            .catch(() => setMyMaterials([]))
            .finally(() => setLoadingList(false));
    };

    useEffect(() => {
        loadCategories();
        loadMyMaterials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadMessage(null);

        if (!file) {
            setUploadMessage({ type: "error", text: "Please choose a file" });
            return;
        }
        if (!categoryId) {
            setUploadMessage({
                type: "error",
                text: "Please choose a category",
            });
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("Title", title);
        formData.append("Description", description);
        formData.append("CategoryID", categoryId);
        formData.append("UploadedBy", user.UserID);
        formData.append("file", file);

        try {
            await apiFetch("/materials", {
                method: "POST",
                body: formData,
            });

            setUploadMessage({
                type: "success",
                text: "Uploaded successfully!",
            });
            setTitle("");
            setDescription("");
            setCategoryId("");
            setFile(null);
            e.target.reset();
            loadMyMaterials();
        } catch (err) {
            setUploadMessage({
                type: "error",
                text: err.message || "Upload failed",
            });
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (material) => {
        setEditingId(material.MaterialID);
        setEditTitle(material.Title);
        setEditDescription(material.Description || "");
        setEditCategoryId(material.CategoryID);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const submitEdit = async (materialId) => {
        try {
            await apiFetch(`/materials/${materialId}`, {
                method: "PUT",
                body: JSON.stringify({
                    Title: editTitle,
                    Description: editDescription,
                    CategoryID: editCategoryId,
                }),
            });
            setEditingId(null);
            loadMyMaterials();
            showToast("Material updated", "success");
        } catch (err) {
            showToast(err.message || "Update failed", "error");
        }
    };

    const handleDelete = async (materialId) => {
        if (!window.confirm("Delete this material? This cannot be undone."))
            return;

        try {
            await apiFetch(`/materials/${materialId}`, { method: "DELETE" });
            loadMyMaterials();
            showToast("Material deleted", "success");
        } catch (err) {
            showToast(err.message || "Delete failed", "error");
        }
    };

    return (
        <div className="teacher-page">
            <div className="teacher-header">
                <div>
                    <div className="teacher-eyebrow">EduHub</div>
                    <h1>Teacher Dashboard</h1>
                    <p>Signed in as {user?.FullName}</p>
                </div>
                <nav>
                    <Link to="/materials">Browse materials →</Link>
                    <Link to="/change-password">Change password</Link>
                    <button className="btn-ghost btn-sm" onClick={handleLogout}>
                        Sign out
                    </button>
                </nav>
            </div>

            <h2>Upload a new material</h2>
            <form className="upload-form" onSubmit={handleUpload}>
                <label>
                    Title
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Description
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>

                <label>
                    Category
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        <option value="">-- Choose a category --</option>
                        {categories.map((cat) => (
                            <option key={cat.CategoryID} value={cat.CategoryID}>
                                {cat.CategoryName}
                            </option>
                        ))}
                    </select>
                </label>

                {categories.length === 0 && (
                    <p className="form-message error">
                        No categories exist yet — an Admin needs to create
                        one before you can upload materials.
                    </p>
                )}

                <div className="field-block">
                    <span className="field-label-text">File</span>
                    <div className="file-input-wrapper">
                        <label
                            htmlFor="material-file"
                            className="file-input-button"
                        >
                            Choose file
                        </label>
                        <span className="file-input-name">
                            {file ? file.name : "No file chosen"}
                        </span>
                        <input
                            id="material-file"
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>
                </div>

                {uploadMessage && (
                    <p className={`form-message ${uploadMessage.type}`}>
                        {uploadMessage.text}
                    </p>
                )}

                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>

            <h2>My materials</h2>
            {loadingList ? (
                <p>Loading...</p>
            ) : myMaterials.length === 0 ? (
                <p>You haven't uploaded any materials yet.</p>
            ) : (
                myMaterials.map((material) => (
                    <div className="my-material-row" key={material.MaterialID}>
                        <div className="row-top">
                            <div>
                                <strong>{material.Title}</strong>
                                <div className="row-meta">
                                    Category: {material.CategoryName}
                                </div>
                            </div>

                            <div className="row-actions">
                                <button onClick={() => startEdit(material)}>
                                    Edit
                                </button>
                                <button
                                    className="danger"
                                    onClick={() =>
                                        handleDelete(material.MaterialID)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {editingId === material.MaterialID && (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                />
                                <textarea
                                    rows={2}
                                    value={editDescription}
                                    onChange={(e) =>
                                        setEditDescription(e.target.value)
                                    }
                                />
                                <select
                                    value={editCategoryId}
                                    onChange={(e) =>
                                        setEditCategoryId(e.target.value)
                                    }
                                >
                                    {categories.map((cat) => (
                                        <option
                                            key={cat.CategoryID}
                                            value={cat.CategoryID}
                                        >
                                            {cat.CategoryName}
                                        </option>
                                    ))}
                                </select>
                                <div className="row-actions">
                                    <button
                                        onClick={() =>
                                            submitEdit(material.MaterialID)
                                        }
                                    >
                                        Save
                                    </button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default TeacherDashboard;