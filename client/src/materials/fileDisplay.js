const BASE_URL = "http://localhost:5000";

// Build the public URL for an uploaded file (server serves the uploads folder statically at root)
export function getFileUrl(filePath) {
    if (!filePath) return "";
    const fileName = filePath.split(/[/\\]/).pop();
    return `${BASE_URL}/${fileName}`;
}

export function isImage(fileType) {
    return typeof fileType === "string" && fileType.startsWith("image/");
}

// Return a label + color to display for non-image file types
export function getFileBadge(fileType = "", fileName = "") {
    const type = fileType.toLowerCase();
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    if (type.includes("pdf") || ext === "pdf") {
        return { label: "PDF", color: "#C1554A" };
    }
    if (type.includes("word") || ["doc", "docx"].includes(ext)) {
        return { label: "DOC", color: "#4C7EA8" };
    }
    if (type.includes("presentation") || ["ppt", "pptx"].includes(ext)) {
        return { label: "PPT", color: "#C98A3E" };
    }
    if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx"].includes(ext)) {
        return { label: "XLS", color: "#4F9169" };
    }
    if (type.includes("zip") || type.includes("rar") || ["zip", "rar"].includes(ext)) {
        return { label: "ZIP", color: "#8C6FB0" };
    }
    if (type.startsWith("text/") || ext === "txt") {
        return { label: "TXT", color: "#7C8B85" };
    }
    if (type.startsWith("video/")) {
        return { label: "VIDEO", color: "#B0557A" };
    }
    if (type.startsWith("audio/")) {
        return { label: "AUDIO", color: "#5A8FA6" };
    }

    return { label: ext ? ext.toUpperCase() : "FILE", color: "#6E8880" };
}