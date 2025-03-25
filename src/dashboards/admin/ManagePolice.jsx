import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiSearch } from "react-icons/fi";

const ManagePolice = () => {
    const [policeList, setPoliceList] = useState([]);
    const [newPolice, setNewPolice] = useState({ name: "", email: "", password: "", district: "", subdivision: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingPolice, setIsAddingPolice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [districts, setDistricts] = useState([]);
    const [subdivisions, setSubdivisions] = useState([]);

    useEffect(() => {
        fetchPoliceList();
        fetchDistricts();
    }, []);

    const fetchPoliceList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/police");
            setPoliceList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching police list", error);
            setPoliceList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDistricts = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/crime/districts");
            // console.log("Fetched Districts:", response.data);
            setDistricts(response.data);
        } catch (error) {
            console.error("Error fetching districts", error);
            setDistricts([]);
        }
    };

    const fetchSubdivisions = async (district) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/crime/subdivisions?district=${district}`);
            // console.log("Fetched Subdivisions:", response.data);
            setSubdivisions(response.data);
        } catch (error) {
            console.error("Error fetching subdivisions", error);
            setSubdivisions([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPolice((prev) => ({ ...prev, [name]: value }));

        if (name === "district") {
            fetchSubdivisions(value);
            setNewPolice((prev) => ({ ...prev, subdivision: "" }));
        }
    };

    const handleAddPolice = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/police/add", newPolice);
            setNewPolice({ name: "", email: "", password: "", district: "", subdivision: "" });
            setIsAddingPolice(false);
            fetchPoliceList();
        } catch (error) {
            console.error("Error adding police", error);
            alert("Failed to add police officer. Please try again.");
        }
    };

    const handleRemovePolice = async (id, name) => {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/police/remove/${id}`);
                fetchPoliceList();
            } catch (error) {
                console.error("Error removing police", error);
                alert("Failed to remove police officer.");
            }
        }
    };

    const filteredPoliceList = policeList.filter(police =>
        police.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        police.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Police Officers</h1>
                <button 
                    onClick={() => setIsAddingPolice(!isAddingPolice)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <FiPlus className="mr-2" /> Add New Officer
                </button>
            </div>

            <div className="mb-6 relative">
                <input
                    type="text"
                    className="w-full p-2 pl-10 border border-gray-300 rounded"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {isAddingPolice && (
                <div className="mb-6 p-4 border border-gray-200 rounded">
                    <form onSubmit={handleAddPolice}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Officer Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Full Name"
                                    value={newPolice.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Email"
                                    value={newPolice.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Password"
                                    value={newPolice.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">District</label>
                                <select
                                    name="district"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={newPolice.district}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select District</option>
                                    {districts.map((districtObj, index) => (
                                        <option key={index} value={districtObj.district}>
                                            {districtObj.district}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subdivision</label>
                                <select
                                    name="subdivision"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={newPolice.subdivision}
                                    onChange={handleChange}
                                    required
                                    disabled={!newPolice.district}
                                >
                                    <option value="">Select Subdivision</option>
                                    {subdivisions.map((sub,index) => (
                                        <option key={index} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                Add Officer
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManagePolice;
