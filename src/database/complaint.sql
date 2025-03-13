CREATE TABLE complaints (
    complaint_id VARCHAR(20) PRIMARY KEY,
    incident_type VARCHAR(255),
    title VARCHAR(255),
    date DATE,
    time TIME,
    location TEXT,
    description TEXT,
    suspect_details TEXT,
    victim_details TEXT,
    witness_details TEXT,
    evidence_files JSONB, -- Array of file names/paths
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW()
);
