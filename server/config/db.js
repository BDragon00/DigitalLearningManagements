const sql = require("mssql/msnodesqlv8");

const dbConfig = {
    server: "(localdb)\\MSSQLLocalDB",
    database: "DigitalLearningManagement",
    driver: "ODBC Driver 18 for SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

const connectDB = async () => {
    try {
        await sql.connect(dbConfig);
        console.log("SQL Server connected successfully!");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

module.exports = {
    sql,
    connectDB
};