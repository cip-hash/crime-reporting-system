import React, { useState } from 'react';
import axios from 'axios';

function SuspectFinder() {
  const [form, setForm] = useState({
    crime_type: '',
    identifying_mark: '',
    complexion: '',
    last_known_address: ''
  });
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/police/find_suspects", form);
      setResults(response.data.data);
      setMessage(response.data.message || '');
    } catch (error) {
      setMessage("Server error. Try again later.");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔍 Suspect Finder</h2>
      
      {/* Search Form */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="text" name="crime_type" placeholder="Crime Type" className="border p-2" onChange={handleChange} />
        <input type="text" name="identifying_mark" placeholder="Identifying Mark" className="border p-2" onChange={handleChange} />
        <input type="text" name="complexion" placeholder="Complexion" className="border p-2" onChange={handleChange} />
        <input type="text" name="last_known_address" placeholder="Last Known Address" className="border p-2" onChange={handleChange} />
      </div>

      {/* Search Button */}
      <button onClick={handleSearch} className="bg-blue-600 text-white py-2 px-4 rounded">Search Suspects</button>

      {/* Error or Info Message */}
      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">Matching Suspects:</h3>
          <table className="table-auto w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Gender</th>
                <th className="p-2 border">Age</th>
                <th className="p-2 border">Height</th>
                <th className="p-2 border">Weight</th>
                <th className="p-2 border">Eye Color</th>
                <th className="p-2 border">Hair Color</th>
                <th className="p-2 border">Complexion</th>
                <th className="p-2 border">Identifying Mark</th>
                <th className="p-2 border">Build</th>
                <th className="p-2 border">Last Known Address</th>
                <th className="p-2 border">Occupation</th>
                <th className="p-2 border">Previous Convictions</th>
                <th className="p-2 border">Types of Crimes</th>
                <th className="p-2 border">Gang Affiliation</th>
              </tr>
            </thead>
            <tbody>
              {results.map((suspect, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="border p-1">{suspect.ID}</td>
                  <td className="border p-1">{suspect.Name}</td>
                  <td className="border p-1">{suspect.Gender}</td>
                  <td className="border p-1">{suspect.Age}</td>
                  <td className="border p-1">{suspect.Height}</td>
                  <td className="border p-1">{suspect.Weight}</td>
                  <td className="border p-1">{suspect["Eye Color"]}</td>
                  <td className="border p-1">{suspect["Hair Color"]}</td>
                  <td className="border p-1">{suspect.Complexion}</td>
                  <td className="border p-1">{suspect["Identifying Mark"]}</td>
                  <td className="border p-1">{suspect.Build}</td>
                  <td className="border p-1">{suspect["Last Known Address"]}</td>
                  <td className="border p-1">{suspect.Occupation}</td>
                  <td className="border p-1">{suspect["Previous Convictions"]}</td>
                  <td className="border p-1">{suspect["Types of Crimes"]}</td>
                  <td className="border p-1">{suspect["Gang Affiliation"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SuspectFinder;
