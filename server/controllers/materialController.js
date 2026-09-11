const { sql } = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all materials
const getMaterials = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                m.MaterialID,
                m.Title,
                m.Description,
                m.FileName,
                m.FilePath,
                m.FileType,
                m.FileSize,
                m.CategoryID,
                c.CategoryName,
                m.UploadedBy,
                u.FullName AS UploaderName,
                m.CreatedAt
            FROM Materials m
            INNER JOIN Categories c
                ON m.CategoryID = c.CategoryID
            INNER JOIN Users u
                ON m.UploadedBy = u.UserID
            ORDER BY m.MaterialID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get materials failed:", error);

        res.status(500).json({
            message: "Failed to get materials",
            error: error.message
        });
    }
};

// Create material
const createMaterial = async (req, res) => {
    try {
        const {
            Title,
            Description,
            CategoryID,
            UploadedBy
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        const FileName = req.file.originalname;
        const FilePath = req.file.path;
        const FileType = req.file.mimetype;
        const FileSize = req.file.size;

        const result = await sql.query`
            INSERT INTO Materials (
                Title,
                Description,
                FileName,
                FilePath,
                FileType,
                FileSize,
                CategoryID,
                UploadedBy
            )
            OUTPUT
                INSERTED.MaterialID,
                INSERTED.Title,
                INSERTED.Description,
                INSERTED.FileName,
                INSERTED.FilePath,
                INSERTED.FileType,
                INSERTED.FileSize,
                INSERTED.CategoryID,
                INSERTED.UploadedBy,
                INSERTED.CreatedAt
            VALUES (
                ${Title},
                ${Description},
                ${FileName},
                ${FilePath},
                ${FileType},
                ${FileSize},
                ${CategoryID},
                ${UploadedBy}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create material failed:", error);

        res.status(500).json({
            message: "Failed to create material",
            error: error.message
        });
    }
};

// Get material by ID
const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                m.Description,
                m.FileName,
                m.FilePath,
                m.FileType,
                m.FileSize,
                m.CategoryID,
                c.CategoryName,
                m.UploadedBy,
                u.FullName AS UploaderName,
                m.CreatedAt
            FROM Materials m
            INNER JOIN Categories c
                ON m.CategoryID = c.CategoryID
            INNER JOIN Users u
                ON m.UploadedBy = u.UserID
            WHERE m.MaterialID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get material by ID failed:", error);

        res.status(500).json({
            message: "Failed to get material",
            error: error.message
        });
    }
};

// Search materials
const searchMaterials = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.trim() === "") {
            return res.status(400).json({
                message: "Keyword is required"
            });
        }

        const searchKeyword = `%${keyword.trim()}%`;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                m.Description,
                m.FileName,
                m.FilePath,
                m.FileType,
                m.FileSize,
                m.CategoryID,
                c.CategoryName,
                m.UploadedBy,
                u.FullName AS UploaderName,
                m.CreatedAt
            FROM Materials m
            INNER JOIN Categories c
                ON m.CategoryID = c.CategoryID
            INNER JOIN Users u
                ON m.UploadedBy = u.UserID
            WHERE m.Title LIKE ${searchKeyword}
            ORDER BY m.MaterialID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Search materials failed:", error);

        res.status(500).json({
            message: "Failed to search materials",
            error: error.message
        });
    }
};

// Update material
const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Title,
            Description,
            CategoryID
        } = req.body;

        const result = await sql.query`
            UPDATE Materials
            SET
                Title = COALESCE(${Title}, Title),
                Description = COALESCE(${Description}, Description),
                CategoryID = COALESCE(${CategoryID}, CategoryID)
            OUTPUT
                INSERTED.MaterialID,
                INSERTED.Title,
                INSERTED.Description,
                INSERTED.FileName,
                INSERTED.FilePath,
                INSERTED.FileType,
                INSERTED.FileSize,
                INSERTED.CategoryID,
                INSERTED.UploadedBy,
                INSERTED.CreatedAt
            WHERE MaterialID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Update material failed:", error);

        res.status(500).json({
            message: "Failed to update material",
            error: error.message
        });
    }
};

// Delete material
const deleteMaterial = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        const { id } = req.params;

        await transaction.begin();

        // Get material file information before deleting
        const materialRequest = new sql.Request(transaction);

        materialRequest.input("id", sql.Int, id);

        const materialResult = await materialRequest.query(`
            SELECT
                MaterialID,
                Title,
                FilePath
            FROM Materials
            WHERE MaterialID = @id
        `);

        if (materialResult.recordset.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                message: "Material not found"
            });
        }

        const material = materialResult.recordset[0];

        // Delete related downloads
        const downloadRequest = new sql.Request(transaction);
        downloadRequest.input("id", sql.Int, id);

        await downloadRequest.query(`
            DELETE FROM Downloads
            WHERE MaterialID = @id
        `);

        // Delete related favorites
        const favoriteRequest = new sql.Request(transaction);
        favoriteRequest.input("id", sql.Int, id);

        await favoriteRequest.query(`
            DELETE FROM Favorites
            WHERE MaterialID = @id
        `);

        // Delete related views
        const viewRequest = new sql.Request(transaction);
        viewRequest.input("id", sql.Int, id);

        await viewRequest.query(`
            DELETE FROM MaterialViews
            WHERE MaterialID = @id
        `);

        // Delete material
        const materialDeleteRequest = new sql.Request(transaction);
        materialDeleteRequest.input("id", sql.Int, id);

        await materialDeleteRequest.query(`
            DELETE FROM Materials
            WHERE MaterialID = @id
        `);

        await transaction.commit();

        // Delete physical file after successful database transaction
        if (material.FilePath) {
            const filePath = path.resolve(__dirname, "..", material.FilePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({
            message: "Material and file deleted successfully",
            material: {
                MaterialID: material.MaterialID,
                Title: material.Title
            }
        });
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }

        console.error("Delete material failed:", error);

        res.status(500).json({
            message: "Failed to delete material",
            error: error.message
        });
    }
};

// Get materials by category
const getMaterialsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                m.Description,
                m.FileName,
                m.FilePath,
                m.FileType,
                m.FileSize,
                m.CategoryID,
                c.CategoryName,
                m.UploadedBy,
                u.FullName AS UploaderName,
                m.CreatedAt
            FROM Materials m
            INNER JOIN Categories c
                ON m.CategoryID = c.CategoryID
            INNER JOIN Users u
                ON m.UploadedBy = u.UserID
            WHERE m.CategoryID = ${categoryId}
            ORDER BY m.MaterialID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get materials by category failed:", error);

        res.status(500).json({
            message: "Failed to get materials by category",
            error: error.message
        });
    }
};

// Get materials by user
const getMaterialsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                m.Description,
                m.FileName,
                m.FilePath,
                m.FileType,
                m.FileSize,
                m.CategoryID,
                c.CategoryName,
                m.UploadedBy,
                u.FullName AS UploaderName,
                m.CreatedAt
            FROM Materials m
            INNER JOIN Categories c
                ON m.CategoryID = c.CategoryID
            INNER JOIN Users u
                ON m.UploadedBy = u.UserID
            WHERE m.UploadedBy = ${userId}
            ORDER BY m.MaterialID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get materials by user failed:", error);

        res.status(500).json({
            message: "Failed to get materials by user",
            error: error.message
        });
    }
};

// Get download count of a material
const getMaterialDownloadCount = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                COUNT(d.DownloadID) AS DownloadCount
            FROM Materials m
            LEFT JOIN Downloads d
                ON m.MaterialID = d.MaterialID
            WHERE m.MaterialID = ${id}
            GROUP BY
                m.MaterialID,
                m.Title
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get material download count failed:", error);

        res.status(500).json({
            message: "Failed to get material download count",
            error: error.message
        });
    }
};

// Get view count of a material
const getMaterialViewCount = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                COUNT(v.ViewID) AS ViewCount
            FROM Materials m
            LEFT JOIN MaterialViews v
                ON m.MaterialID = v.MaterialID
            WHERE m.MaterialID = ${id}
            GROUP BY
                m.MaterialID,
                m.Title
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get material view count failed:", error);

        res.status(500).json({
            message: "Failed to get material view count",
            error: error.message
        });
    }
};

// Get favorite count of a material
const getMaterialFavoriteCount = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                COUNT(f.FavoriteID) AS FavoriteCount
            FROM Materials m
            LEFT JOIN Favorites f
                ON m.MaterialID = f.MaterialID
            WHERE m.MaterialID = ${id}
            GROUP BY
                m.MaterialID,
                m.Title
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get material favorite count failed:", error);

        res.status(500).json({
            message: "Failed to get material favorite count",
            error: error.message
        });
    }
};

// Get material statistics
const getMaterialStatistics = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                m.MaterialID,
                m.Title,
                COUNT(DISTINCT d.DownloadID) AS DownloadCount,
                COUNT(DISTINCT v.ViewID) AS ViewCount,
                COUNT(DISTINCT f.FavoriteID) AS FavoriteCount
            FROM Materials m
            LEFT JOIN Downloads d
                ON m.MaterialID = d.MaterialID
            LEFT JOIN MaterialViews v
                ON m.MaterialID = v.MaterialID
            LEFT JOIN Favorites f
                ON m.MaterialID = f.MaterialID
            WHERE m.MaterialID = ${id}
            GROUP BY
                m.MaterialID,
                m.Title
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get material statistics failed:", error);

        res.status(500).json({
            message: "Failed to get material statistics",
            error: error.message
        });
    }
};

// Download material file
const downloadMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                MaterialID,
                Title,
                FileName,
                FilePath
            FROM Materials
            WHERE MaterialID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        const material = result.recordset[0];

        if (!material.FilePath) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const filePath = path.resolve(
            __dirname,
            "..",
            material.FilePath
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Physical file not found"
            });
        }

        // Record download for the authenticated user
        await sql.query`
            INSERT INTO Downloads (
                MaterialID,
                UserID
            )
            VALUES (
                ${material.MaterialID},
                ${req.user.UserID}
            )
        `;

        res.download(
            filePath,
            material.FileName,
            (error) => {
                if (error) {
                    console.error("Send file failed:", error);

                    if (!res.headersSent) {
                        res.status(500).json({
                            message: "Failed to download file",
                            error: error.message
                        });
                    }
                }
            }
        );
    } catch (error) {
        console.error("Download material failed:", error);

        res.status(500).json({
            message: "Failed to download material",
            error: error.message
        });
    }
};

module.exports = {
    getMaterials,
    getMaterialById,
    searchMaterials,
    getMaterialsByCategory,
    getMaterialsByUser,
    getMaterialDownloadCount,
    getMaterialViewCount,
    getMaterialFavoriteCount,
    getMaterialStatistics,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    downloadMaterial
};