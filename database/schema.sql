-- Database Schema for Health Information System

-- Roles Table
CREATE TABLE Role (
    RoleID SERIAL PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

-- Users Table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    RoleID INT REFERENCES Role(RoleID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE Staff (
    StaffID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    FirstName VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL,
    Suffix VARCHAR(10),
    ContactNumber VARCHAR(20)
);

-- Patients Table
CREATE TABLE Patients (
    PatientID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    FirstName VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL,
    Suffix VARCHAR(10),
    Address TEXT,
    Gender VARCHAR(10),
    BirthDate DATE,
    ContactNumber VARCHAR(20)
);

-- Appointments Table
CREATE TABLE Appointment (
    AppointmentID SERIAL PRIMARY KEY,
    ScheduledBy INT REFERENCES Staff(StaffID),
    PatientID INT REFERENCES Patients(PatientID),
    DateTime TIMESTAMP NOT NULL,
    Status VARCHAR(20) DEFAULT 'pending',
    Reason TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnosis Table
CREATE TABLE Diagnosis (
    DiagnosisID SERIAL PRIMARY KEY,
    Description TEXT NOT NULL
);

-- Treatment Table
CREATE TABLE Treatment (
    TreatmentID SERIAL PRIMARY KEY,
    Description TEXT NOT NULL
);

-- Notes Table
CREATE TABLE Notes (
    NoteID SERIAL PRIMARY KEY,
    Content TEXT NOT NULL
);

-- Medical Records Table
CREATE TABLE MedicalRecord (
    RecordID SERIAL PRIMARY KEY,
    AppointmentID INT REFERENCES Appointment(AppointmentID),
    EnteredBy INT REFERENCES Staff(StaffID),
    DiagnosisID INT REFERENCES Diagnosis(DiagnosisID),
    TreatmentID INT REFERENCES Treatment(TreatmentID),
    NoteID INT REFERENCES Notes(NoteID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE Notification (
    NotificationID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    Message TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table for PDPA compliance
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(UserID),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO Role (RoleName) VALUES ('Admin'), ('Nurse'), ('Staff'), ('Patient');
