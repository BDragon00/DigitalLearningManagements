const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const roleRoutes = require("./routes/roleRoutes");
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const materialRoutes = require("./routes/materialRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const materialViewRoutes = require("./routes/materialViewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const authRoutes = require("./routes/authRoutes");
const sql = db.sql;
const connectDB = db.connectDB;

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
app.use("/api", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/material-views", materialViewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/auth", authRoutes);


// Test API
app.get("/", (req, res) => {
    res.send("Digital Learning Management API is running!");
});

// Connect Database
console.log("Starting database connection...");

connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});