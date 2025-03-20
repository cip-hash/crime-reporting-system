import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CrimeStatistics = () => {
    const [crimeStats, setCrimeStats] = useState({});

    useEffect(() => {
        fetchCrimeStatistics();
    }, []);

    const fetchCrimeStatistics = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/crime/stats");
            setCrimeStats(response.data);
        } catch (error) {
            console.error("Error fetching crime statistics:", error);
        }
    };

    const chartData = {
        labels: crimeStats.labels || [],
        datasets: [
            {
                label: "Number of Crimes",
                data: crimeStats.data || [],
                backgroundColor: "rgba(75,192,192,0.6)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold">📊 Crime Statistics</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default CrimeStatistics;
