--complaints table /*  nextval('complaints_id_seq'::regclass)  */
CREATE TABLE complaints (
    complaint_id VARCHAR(20) PRIMARY KEY,
    incident_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME WITHOUT TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    suspect_details TEXT,
    victim_details TEXT,
    witness_details TEXT,
    evidence_files JSONB,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    district VARCHAR(50) NOT NULL,
    subdivision VARCHAR(50) NOT NULL,
    complainant_email VARCHAR(100) NOT NULL,
    CONSTRAINT fk_complaints_crime_stats FOREIGN KEY (district, subdivision) REFERENCES crime_statistics (district, subdivision)
);

--crime_statistics
CREATE TABLE crime_statistics (
    district VARCHAR(100) NOT NULL,
    subdivision VARCHAR(100) NOT NULL,
    murder INTEGER,
    murderforgain INTEGER,
    dacoity INTEGER,
    robbery INTEGER,
    graveburglary INTEGER,
    gravetheft INTEGER,
    other INTEGER,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    harassment INTEGER,
    PRIMARY KEY (district, subdivision)
);
ALTER TABLE crime_statistics 
ADD COLUMN totalcrimes INTEGER  GENERATED ALWAYS AS (
    murder + murderforgain + dacoity + robbery + graveburglary + gravetheft + harassment+ other
) STORED;


--police
CREATE TABLE police (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    district VARCHAR(50) NOT NULL,
    subdivision VARCHAR(50) NOT NULL
);


--user
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
);
