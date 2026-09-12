USE DigitalLearningManagement;
GO

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'Student',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE Materials (
    MaterialID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    FileType VARCHAR(50) NOT NULL,
    FileSize BIGINT NOT NULL,
    CategoryID INT NOT NULL,
    UploadedBy INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Materials_Categories
        FOREIGN KEY (CategoryID)
        REFERENCES Categories(CategoryID),

    CONSTRAINT FK_Materials_Users
        FOREIGN KEY (UploadedBy)
        REFERENCES Users(UserID)
);
GO

CREATE TABLE Downloads (
    DownloadID INT IDENTITY(1,1) PRIMARY KEY,
    MaterialID INT NOT NULL,
    UserID INT NOT NULL,
    DownloadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Downloads_Materials
        FOREIGN KEY (MaterialID)
        REFERENCES Materials(MaterialID),

    CONSTRAINT FK_Downloads_Users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
);
GO

CREATE TABLE Favorites (
    FavoriteID INT IDENTITY(1,1) PRIMARY KEY,
    MaterialID INT NOT NULL,
    UserID INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Favorites_Materials
        FOREIGN KEY (MaterialID)
        REFERENCES Materials(MaterialID),

    CONSTRAINT FK_Favorites_Users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID),

    CONSTRAINT UQ_Favorites_User_Material
        UNIQUE (UserID, MaterialID)
);
GO

CREATE TABLE MaterialViews (
    ViewID INT IDENTITY(1,1) PRIMARY KEY,
    MaterialID INT NOT NULL,
    UserID INT NULL,
    ViewedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_MaterialViews_Materials
        FOREIGN KEY (MaterialID)
        REFERENCES Materials(MaterialID),

    CONSTRAINT FK_MaterialViews_Users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
);
GO

CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);
GO
INSERT INTO Roles (RoleName, Description)
VALUES
('Student', N'Hoc vien hoac sinh vien'),
('Teacher',N'Giang vien hoac nguoi dang tai hoc lieu'),
('Admin',N'Quan tri vien');
GO

ALTER TABLE Users
DROP CONSTRAINT DF__Users__Role__4BAC3F29;
GO

ALTER TABLE Users
DROP COLUMN Role;
GO

ALTER TABLE Users
ADD RoleID INT NOT NULL;
GO

ALTER TABLE Users
ADD CONSTRAINT FK_Users_Roles
    FOREIGN KEY (RoleID)
    REFERENCES Roles(RoleID);
GO

USE DigitalLearningManagement;
GO

INSERT INTO Users (
    FullName,
    Email,
    PasswordHash,
    RoleID
)
VALUES (
    N'Nguyễn Văn A',
    'student@example.com',
    'test-password-hash',
    1
);
GO
SELECT *
FROM Categories
WHERE CategoryID = 1;