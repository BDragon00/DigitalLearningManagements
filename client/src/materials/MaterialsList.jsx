import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, getStoredUser, getToken } from "../api";
import { useToast } from "../components/ToastContext";
import { getFileUrl, isImage, getFileBadge } from "./fileDisplay";
import "./materials.css";

function MaterialsList() {
    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [favoritesByMaterial, setFavoritesByMaterial] = useState({});
    const [keyword, setKeyword] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const user = getStoredUser();
    const { showToast } = useToast();

    useEffect(() => {
        apiFetch("/categories")
            .then((data) => setCategories(data))
            .catch(() => setCategories([]));
    }, []);

    const loadFavorites = () => {
        if (!user) return;

        apiFetch(`/favorites/user/${user.UserID}`)
            .then((data) => {
                const map = {};
                data.forEach((fav) => {
                    map[fav.MaterialID] = fav.FavoriteID;
                });
                setFavoritesByMaterial(map);
            })
            .catch(() => setFavoritesByMaterial({}));
    };

    useEffect(() => {
        loadFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMaterials = async (overrideKeyword) => {
        setLoading(true);
        setError("");

        const activeKeyword =
            overrideKeyword !== undefined ? overrideKeyword : keyword;

        try {
            let data;

            if (activeKeyword && activeKeyword.trim() !== "") {
                data = await apiFetch(
                    `/materials/search?keyword=${encodeURIComponent(
                        activeKeyword.trim()
                    )}`
                );
            } else if (categoryId) {
                data = await apiFetch(`/materials/category/${categoryId}`);
            } else {
                data = await apiFetch("/materials");
            }

            setMaterials(data);
        } catch (err) {
            setError(err.message || "Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMaterials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadMaterials();
    };

    const handleToggleFavorite = async (materialId) => {
        const existingFavoriteId = favoritesByMaterial[materialId];

        try {
            if (existingFavoriteId) {
                await apiFetch(`/favorites/${existingFavoriteId}`, {
                    method: "DELETE",
                });
            } else {
                await apiFetch("/favorites", {
                    method: "POST",
                    body: JSON.stringify({ MaterialID: materialId }),
                });
            }
            loadFavorites();
            showToast(
                existingFavoriteId
                    ? "Removed from favorites"
                    : "Added to favorites",
                "success"
            );
        } catch (err) {
            showToast(err.message || "Failed to update favorite", "error");
        }
    };

    const handleDownload = async (material) => {
        try {
            const token = getToken();
            const response = await fetch(
                `http://localhost:5000/api/materials/${material.MaterialID}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Download failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = material.FileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast("Downloaded", "success");
        } catch (err) {
            showToast(err.message || "Download failed", "error");
        }
    };

    return (
        <div className="materials-page">
            <div className="materials-header">
                <div>
                    <div className="materials-eyebrow">EduHub</div>
                    <h1>Learning Materials</h1>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    <Link to="/change-password">Change password</Link>
                    <Link to={backLinkFor(user)}>← Back to home</Link>
                </div>
            </div>

            <form className="materials-filters" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                    value={categoryId}
                    onChange={(e) => {
                        setKeyword("");
                        setCategoryId(e.target.value);
                    }}
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.CategoryID} value={cat.CategoryID}>
                            {cat.CategoryName}
                        </option>
                    ))}
                </select>

                <button type="submit">Search</button>
            </form>

            {error && <p className="materials-error">{error}</p>}

            {loading ? (
                <p>Loading...</p>
            ) : materials.length === 0 ? (
                <p className="materials-empty">No materials yet.</p>
            ) : (
                materials.map((material) => (
                    <div className="material-card" key={material.MaterialID}>
                        <div className="material-card-top">
                            <div className="material-thumb">
                                {isImage(material.FileType) ? (
                                    <img
                                        src={getFileUrl(material.FilePath)}
                                        alt={material.Title}
                                    />
                                ) : (
                                    (() => {
                                        const badge = getFileBadge(
                                            material.FileType,
                                            material.FileName
                                        );
                                        return (
                                            <div
                                                style={{
                                                    background: badge.color,
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {badge.label}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>

                            <div className="material-info">
                                <h3>{material.Title}</h3>
                                {material.Description && (
                                    <p>{material.Description}</p>
                                )}
                                <div className="material-meta">
                                    Category: {material.CategoryName} ·
                                    Uploaded by: {material.UploaderName} ·
                                    File type: {material.FileType}
                                </div>
                            </div>
                        </div>

                        <div className="material-actions">
                            <Link to={`/materials/${material.MaterialID}`}>
                                View details
                            </Link>

                            <button onClick={() => handleDownload(material)}>
                                Download
                            </button>

                            <button
                                className={
                                    favoritesByMaterial[material.MaterialID]
                                        ? "favorited"
                                        : ""
                                }
                                onClick={() =>
                                    handleToggleFavorite(material.MaterialID)
                                }
                            >
                                {favoritesByMaterial[material.MaterialID]
                                    ? "Unfavorite"
                                    : "Favorite"}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

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

export default MaterialsList;