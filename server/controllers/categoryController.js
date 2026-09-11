const { sql } = require("../config/db");

const getCategories = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                CategoryID,
                CategoryName,
                Description,
                CreatedAt
            FROM Categories
            ORDER BY CategoryID
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get categories failed:", error);

        res.status(500).json({
            message: "Failed to get categories",
            error: error.message
        });
    }
};

// Create category
const createCategory = async (req, res) => {
    try {
        const {
            CategoryName,
            Description
        } = req.body;

        const result = await sql.query`
            INSERT INTO Categories (
                CategoryName,
                Description
            )
            OUTPUT
                INSERTED.CategoryID,
                INSERTED.CategoryName,
                INSERTED.Description,
                INSERTED.CreatedAt
            VALUES (
                ${CategoryName},
                ${Description}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create category failed:", error);

        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT
                CategoryID,
                CategoryName,
                Description,
                CreatedAt
            FROM Categories
            WHERE CategoryID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get category by ID failed:", error);

        res.status(500).json({
            message: "Failed to get category",
            error: error.message
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            CategoryName,
            Description
        } = req.body;

        const result = await sql.query`
            UPDATE Categories
            SET
                CategoryName = ${CategoryName},
                Description = ${Description}
            OUTPUT
                INSERTED.CategoryID,
                INSERTED.CategoryName,
                INSERTED.Description,
                INSERTED.CreatedAt
            WHERE CategoryID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Update category failed:", error);

        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            DELETE FROM Categories
            OUTPUT
                DELETED.CategoryID,
                DELETED.CategoryName
            WHERE CategoryID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully",
            category: result.recordset[0]
        });
    } catch (error) {
        console.error("Delete category failed:", error);

        res.status(500).json({
            message: "Failed to delete category",
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};