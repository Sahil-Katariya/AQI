import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [aqiData, setAqiData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const aqiRef = ref(db, "sensors/node1");

    const unsubscribe = onValue(aqiRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAqiData(data);
        setHistory((prev) => {
          const updated = [
            ...prev,
            { time: new Date().toLocaleTimeString(), ...data },
          ];
          return updated.slice(-10); // Keep last 10 readings
        });
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Function to get badge color + label
  const getAqiBadge = (pm25) => {
    if (pm25 <= 50) return { label: "Good", color: "success" };
    if (pm25 <= 100) return { label: "Moderate", color: "warning" };
    return { label: "Hazardous", color: "danger" };
  };

  const badge = getAqiBadge(aqiData?.pm25 || 0);

  return (
    <div className="dashboard-card">
      <h2 className="mb-3">📊 Live AQI Readings</h2>

      {aqiData ? (
        <>
          {/* AQI Badge */}
          <div className="mb-3">
            <span className={`badge bg-${badge.color} p-2`}>
              AQI Status: {badge.label}
            </span>
          </div>

          {/* Current AQI readings */}
          <ul className="list-unstyled aqi-list mb-4">
            <li>
              <b>PM2.5:</b> {aqiData.pm25} µg/m³
            </li>
            <li>
              <b>PM10:</b> {aqiData.pm10} µg/m³
            </li>
            <li>
              <b>CO₂:</b> {aqiData.co2} ppm
            </li>
            <li>
              <b>NOx:</b> {aqiData.nox} ppm
            </li>
          </ul>

          {/* Line Chart for last 10 readings */}
          <h5 className="mb-3">📈 Last 10 Readings</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  stroke="#0d6efd"
                  name="PM2.5"
                />
                <Line
                  type="monotone"
                  dataKey="pm10"
                  stroke="#ffc107"
                  name="PM10"
                />
                <Line
                  type="monotone"
                  dataKey="co2"
                  stroke="#198754"
                  name="CO₂"
                />
                <Line
                  type="monotone"
                  dataKey="nox"
                  stroke="#dc3545"
                  name="NOx"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AQI Info */}
          <div className="mt-4">
            <h5>ℹ️ AQI Levels Explained</h5>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className="badge bg-success">Good (0–50)</span>
              <span className="badge bg-warning text-dark">Moderate (51–100)</span>
              <span className="badge bg-danger">Hazardous (100+)</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted">Loading data...</p>
      )}
    </div>
  );
}

export default Dashboard;
