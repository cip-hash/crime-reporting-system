const {Pool} = require("pg");

const pool= new Pool({
    user:"postgres",
    password:"dbms",
    host:"localhost",
    port: 5432,
    database:'cip' 
})
const fs = require('fs');
const csv = require('csv-parser');


// Columns from your CSV
const columns = [
  'District', 'Subdivision', 'Murder', 'Murder for Gain', 'Dacoity', 
  'Robbery', 'Grave Burglary', 'Grave Theft', 'Other', 
  'Total Crimes', 'Latitude', 'Longitude'
];


// Function to import CSV
async function importCSV() {
  const results = [];

  fs.createReadStream('../assets/crime_statistics_full_corrected_sorted.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`📥 CSV read successfully! ${results.length} records found.`);

      for (const row of results) {
        try {
          const insertQuery = `
            INSERT INTO crime_stats (
              district, subdivision, murder, murderforgain, dacoity, robbery,
              graveburglary, gravetheft, other, totalcrimes, latitude, longitude
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
          `;

          const values = [
            row['District'],
            row['Subdivision'],
            parseInt(row['Murder']) || 0,
            parseInt(row['Murder for Gain']) || 0,
            parseInt(row['Dacoity']) || 0,
            parseInt(row['Robbery']) || 0,
            parseInt(row['Grave Burglary']) || 0,
            parseInt(row['Grave Theft']) || 0,
            parseInt(row['Other']) || 0,
            parseInt(row['Total Crimes']) || 0,
            parseFloat(row['Latitude']) || 0.0,
            parseFloat(row['Longitude']) || 0.0
          ];

          await pool.query(insertQuery, values);
        } catch (err) {
          console.error('❌ Error inserting row:', err);
        }
      }

      console.log('✅ All rows inserted successfully!');
      await pool.end(); // Close DB connection
    });
}

// Run the import process
(async () => { 
  importCSV(); // Start importing data
})();
