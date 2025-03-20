CREATE DATABASE register;

USE register;
--MYSQL
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--POSTGRES
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



 CREATE TABLE crime_reports (
    id SERIAL PRIMARY KEY,
     incident_type VARCHAR(50) NOT NULL,
     date DATE NOT NULL,
     time TIME NOT NULL,
     district VARCHAR(100) NOT NULL,
     subdivision VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    suspect TEXT,
    victim TEXT,
    witness TEXT,
    evidence TEXT[], -- Array of file paths for evidence storage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from crime_reports;
CREATE TABLE crime_statistics (
    id SERIAL PRIMARY KEY,
    district TEXT,
    subdivision TEXT,
    murder INT,
    murder_for_gain INT,
    dacoity INT,
    robbery INT,
    grave_burglary INT,
    grave_theft INT,
    other INT,
    total_crimes INT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
        user_id INT
);





