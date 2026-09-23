import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch, getToken } from "../api";
import { useToast } from "../components/ToastContext";
import { getFileUrl, isImage, getFileBadge } from "./fileDisplay";
import "./materials.css";

function MaterialDetail() {
    const { id } = useParams();
    const { showToast } = useToast();

    const [material, setMaterial] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        Promise.all([
            apiFetch(`/materials/${id}`),
            apiFetch(`/materials/${id}/statistics`).catch(() => null),
        ])
            .then(([materialData, statsData]) => {
                setMaterial(materialData);
                setStats(statsData);

                apiFetch("/material-views", {
                    method: "POST",
                    body: JSON.stringify({ MaterialID: Number(id) }),
                }).catch(() => {});
            })
            .catch((err) =>
                setError(err.message || "Failed to load material")
            )
            .finally(() => setLoading(false));
    }, [id]);

    const handleDownload = async () => {
        try {
            const token = getToken();
            const response = await fetch(
                `http://localhost:5000/api/materials/${id}/download`,
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

    if (loading) {
        return (
            <div className="materials-page">
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="materials-page">
                <Link className="back-link" to="/materials">
                    ← Back to list
                </Link>
                <p className="materials-error">
                    {error || "Material not found"}
                </p>
            </div>
        );
    }

    return (
        <div className="materials-page">
            <Link className="back-link" to="/materials">
                ← Back to list
            </Link>

            <div className="material-detail-card">
                {isImage(material.FileType) ? (
                    <div className="material-detail-thumb">
                        <img
                            src={getFileUrl(material.FilePath)}
                            alt={material.Title}
                        />
                    </div>
                ) : (
                    (() => {
                        const badge = getFileBadge(
                            material.FileType,
                            material.FileName
                        );
                        return (
                            <div
                                className="material-detail-thumb badge"
                                style={{ background: badge.color }}
                            >
                                <span className="badge-label">
                                    {badge.label}
                                </span>
                            </div>
                        );
                    })()
                )}

                <h1>{material.Title}</h1>
                {material.Description && <p>{material.Description}</p>}

                <div className="material-meta">
                    Category: {material.CategoryName} <br />
                    Uploaded by: {material.UploaderName} <br />
                    File type: {material.FileType} · Size:{" "}
                    {formatFileSize(material.FileSize)} <br />
                    Uploaded on:{" "}
                    {new Date(material.CreatedAt).toLocaleDateString("en-US")}
                </div>

                {stats && (
                    <div className="material-stats">
                        <span>Views: {stats.ViewCount}</span>
                        <span>Downloads: {stats.DownloadCount}</span>
                        <span>Favorites: {stats.FavoriteCount}</span>
                    </div>
                )}

                <div className="material-actions" style={{ marginTop: 16 }}>
                    <button onClick={handleDownload}>Download</button>
                </div>
            </div>
        </div>
    );
}

function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default MaterialDetail;