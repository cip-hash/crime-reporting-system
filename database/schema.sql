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
    harassment INTEGER,
    other INTEGER,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    
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
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    
);

--updated lat,long
update crime_statistics set latitude=10.779333,longitude=78.715782 where subdivision like 'Golden%';
update crime_statistics set latitude=12.498351,longitude=78.560196 where subdivision='Tirupathur';
update crime_statistics set latitude=10.329152,longitude=76.957747 where subdivision like 'Valparai';
update crime_statistics set latitude=12.263612,longitude=79.060888 where subdivision like '%ai Rural';
update crime_statistics set latitude=10.899917,longitude=78.618096 where subdivision like 'Jeeya%';
update crime_statistics set latitude=12.926575,longitude=79.132226 where subdivision like 'Vellore';
update crime_statistics set latitude=12.6678099,longitude=79.5408085 where subdivision like 'Cheyyar';
update crime_statistics set latitude=12.5108678,longitude=79.8894578 where subdivision like 'Mathura%';
update crime_statistics set latitude=10.8076301,longitude=78.6831533 where subdivision like 'Cant%';
update crime_statistics set latitude=9.5140080,longitude=78.0993446 where subdivision like 'Arupp%';
update crime_statistics set latitude=11.0011306,longitude=77.5635306 where subdivision like 'Kang%';
update crime_statistics set latitude=11.0891948,longitude=77.3330509 where subdivision like 'KVR%';
update crime_statistics set latitude=10.81622,longitude=78.695155 where subdivision like 'Gandh%';
update crime_statistics set latitude=10.877613,longitude=78.81803737 where subdivision like 'Lal%';
update crime_statistics set latitude=10.9533146,longitude=78.4440229 where subdivision like 'Mus%';
update crime_statistics set latitude=11.09943148,longitude=77.39347962 where subdivision like 'Nallur%';
update crime_statistics set latitude=12.93160735,longitude=78.935474 where subdivision like 'Gudiy%';
update crime_statistics set latitude=12.2526788999,longitude=79.415881028 where subdivision like 'Ging%';
update crime_statistics set latitude=9.5124464,longitude=77.63449716 where subdivision like 'Srivi%';
update crime_statistics set latitude=11.14101237,longitude=77.32327566 where subdivision like 'Anup%';
update crime_statistics set latitude=11.95824616,longitude=79.8350933 where subdivision like 'Kottak%';
update crime_statistics set latitude=10.9971373,longitude=77.279110909 where subdivision like 'Pallad%';
update crime_statistics set latitude=9.353222915,longitude=77.922537459 where subdivision like 'Satt%';
update crime_statistics set latitude=12.264244,longitude=78.5372784 where subdivision like 'Uthan%';
update crime_statistics set latitude=10.731528439,longitude=77.5257062 where subdivision like 'Dhara%';
update crime_statistics set latitude=12.23048459,longitude=79.07090111 where subdivision like '%ai Town%';
update crime_statistics set latitude=13.33261001,longitude=80.19530556 where subdivision like '%Ponne%';
update crime_statistics set latitude=11.659376612,longitude=78.182366364 where subdivision like '%mma%';
update crime_statistics set latitude=9.455160565,longitude=77.556470326 where subdivision like '%aja%';
update crime_statistics set latitude=11.347208452,longitude=78.9494381 where subdivision like '%Manga%';
update crime_statistics set latitude=9.58454304,longitude=77.94206365 where subdivision like '%Virudhun%';
update crime_statistics set latitude=12.3038472,longitude=78.793334799 where subdivision like '%Chengam%';
update crime_statistics set latitude=10.57312706,longitude=78.789064114 where subdivision like '%Keer%';
update crime_statistics set latitude=12.50717724,longitude= 79.604520918 where subdivision like '%andav%';
update crime_statistics set latitude=9.465943287,longitude= 77.7788438 where subdivision like '%Sivakasi%';
update crime_statistics set latitude=13.16794606,longitude= 79.61045735 where subdivision like '%Thiruthani%';
update crime_statistics set latitude=10.85740728,longitude= 78.6900044 where subdivision like '%Sriran%';
update crime_statistics set latitude=13.33517264,longitude=79.89583329 where subdivision like '%Uthu%';
update crime_statistics set latitude=12.686964354,longitude=78.61857106 where subdivision like '%Vani%';
update crime_statistics set latitude=10.791213,longitude=78.71226 where subdivision like 'Trichy%';
update crime_statistics set latitude=10.75715136,longitude=78.689237276 where subdivision like '%K.K.%';
update crime_statistics set latitude=10.8819652561,longitude=79.609870158 where subdivision like '%Nannilam%';
update crime_statistics set latitude=10.66943781,longitude=79.44605436 where subdivision like '%Mannargudi%';
update crime_statistics set latitude=10.608368517,longitude=78.4221458 where subdivision like '%anapparai%';
update crime_statistics set latitude=11.4800678,longitude=76.42231799 where subdivision like '%anapparai%';
update crime_statistics set latitude=12.2262105,longitude=79.65000918 where subdivision like '%Tindivanam%';
update crime_statistics set latitude=10.58524046,longitude=77.244468029 where subdivision like '%Udumal%';
update crime_statistics set latitude=10.971357045,longitude= 76.9143078 where subdivision like '%Perur%';
update crime_statistics set latitude=10.94748094,longitude= 76.9499633 where subdivision like '%Kuniyamuthur%';
update crime_statistics set latitude=10.9658980,longitude= 76.98555553 where subdivision like '%Podanur%';





CREATE TABLE complaints (
    complaint_id VARCHAR(20) PRIMARY KEY,
    
    -- Complainant Information
    complainant_name VARCHAR(255) NOT NULL,
    complainant_phone VARCHAR(50) NOT NULL,
    complainant_email VARCHAR(100) NOT NULL,
    relation_to_victim VARCHAR(100),
    
    -- Victim Information
    victim_name VARCHAR(255),
    victim_phone VARCHAR(50),
    victim_age_gender VARCHAR(50),
    victim_relation VARCHAR(100),
    
    -- Incident Details
    incident_type VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    date DATE NOT NULL,
    time TIME WITHOUT TIME ZONE NOT NULL,
    district VARCHAR(50) NOT NULL,
    subdivision VARCHAR(50) NOT NULL,
    exact_address TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Suspect Information
    suspect TEXT,
    suspect_marks TEXT,
    suspect_complexion TEXT,
    suspect_address TEXT,
    
    -- Witness Details
    witness TEXT,
    witness_contact TEXT,
    witness_statement TEXT,
    
    -- Evidence and Status
    evidence_files JSONB,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Legacy fields (kept for compatibility)
    victim_details TEXT,
    
    CONSTRAINT fk_complaints_crime_stats FOREIGN KEY (district, subdivision) 
    REFERENCES crime_statistics (district, subdivision)
);