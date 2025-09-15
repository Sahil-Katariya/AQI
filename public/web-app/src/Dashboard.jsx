import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase"; // Assuming this is your firebase config file
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
import { Wifi, Thermometer, Droplets, Wind, Cloud, Mountain, Gauge } from 'lucide-react';

// Main Dashboard Component
function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({ text: 'Connecting...', className: 'status-connecting' });

  // --- Helper Function to Determine AQI Level ---
  // Updated to the 6-level Indian AQI standard
  const getAqiInfo = (pm25) => {
    if (pm25 === null || pm25 === undefined) return { label: 'Unknown', colorClass: 'aqi-unknown', bgClass: 'aqi-unknown-bg' };
    if (pm25 <= 30) return { label: 'Good', colorClass: 'aqi-good', bgClass: 'aqi-good-bg' };
    if (pm25 <= 60) return { label: 'Satisfactory', colorClass: 'aqi-satisfactory', bgClass: 'aqi-satisfactory-bg' };
    if (pm25 <= 90) return { label: 'Moderate', colorClass: 'aqi-moderate', bgClass: 'aqi-moderate-bg' };
    if (pm25 <= 120) return { label: 'Poor', colorClass: 'aqi-poor', bgClass: 'aqi-poor-bg' };
    if (pm25 <= 250) return { label: 'Very Poor', colorClass: 'aqi-very-poor', bgClass: 'aqi-very-poor-bg' };
    return { label: 'Severe', colorClass: 'aqi-severe', bgClass: 'aqi-severe-bg' };
  };

  // --- Effect Hook to Fetch Data from Firebase ---
  useEffect(() => {
    const aqiRef = ref(db, "sensors/node1");

    const unsubscribe = onValue(aqiRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData(data);
        setConnectionStatus({ text: 'Live', className: 'status-live' });

        setHistory((prev) => {
          const updated = [
            ...prev,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...data },
          ];
          // Keep the last 30 data points for a better trend view
          return updated.slice(-30);
        });
      } else {
        setConnectionStatus({ text: 'No Data', className: 'status-no-data' });
      }
    }, (error) => {
      console.error("Firebase read failed: ", error);
      setConnectionStatus({ text: 'Error', className: 'status-error' });
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const aqiInfo = getAqiInfo(sensorData?.pm25);

  return (
    <div className="space-y-8">
      {/* Header & Connection Status */}
      <div className="flex-container">
        <h2>Live Sensor Readings</h2>
        <div id="connection-status" className={connectionStatus.className}>
          <Wifi size={16} />
          <span>{connectionStatus.text}</span>
        </div>
      </div>

      {/* Main AQI Display Card */}
      {sensorData ? (
        <>
          <div id="main-aqi-display" className={aqiInfo.bgClass}>
            <h3>PM2.5 Air Quality Index</h3>
            <p id="main-aqi-value" className={aqiInfo.colorClass}>
              {parseFloat(sensorData.pm25 || 0).toFixed(1)}
            </p>
            <p id="main-aqi-label" className={aqiInfo.colorClass}>{aqiInfo.label}</p>
            <p>Based on Indian AQI Standards</p>
          </div>

          {/* Sensor Cards Grid */}
          <div className="cards-grid">
             <SensorCard icon={<Wind size={24} />} title="PM10" value={sensorData.pm10} unit="µg/m³" iconClass="icon-pm10" />
             <SensorCard icon={<Cloud size={24} />} title="Carbon Dioxide (CO₂)" value={sensorData.co2} unit="ppm" iconClass="icon-co2" />
             <SensorCard icon={<Mountain size={24} />} title="Nitrogen Oxides (NOx)" value={sensorData.nox} unit="ppm" iconClass="icon-nox" />
             <SensorCard icon={<Gauge size={24} />} title="Air Quality Index" value={sensorData.mq135} unit="ppm" iconClass="icon-temp" />
             <SensorCard icon={<Thermometer size={24} />} title="Temperature" value={sensorData.temperature} unit="°C" iconClass="icon-temp" />
             <SensorCard icon={<Droplets size={24} />} title="Humidity" value={sensorData.humidity} unit="%" iconClass="icon-humidity" />
          </div>

          {/* Chart Container */}
          <div className="chart-container">
            <h3>📈 Historical Trends</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer>
                <LineChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#F9FAFB' }}
                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
                  <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#f87171" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm10" name="PM10" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="co2" name="CO₂" stroke="#d1d5db" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="nox" name="NOx" stroke="#c084fc" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mq135" name="AQI (MQ135)" stroke="#f472b6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AQI Legend */}
          <div className="chart-container">
            <h3>ℹ️ PM2.5 AQI Levels Explained</h3>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className="badge aqi-good-bg aqi-good p-2">Good (0-30)</span>
              <span className="badge aqi-satisfactory-bg aqi-satisfactory p-2">Satisfactory (31-60)</span>
              <span className="badge aqi-moderate-bg aqi-moderate p-2">Moderate (61-90)</span>
              <span className="badge aqi-poor-bg aqi-poor p-2">Poor (91-120)</span>
              <span className="badge aqi-very-poor-bg aqi-very-poor p-2">Very Poor (121-250)</span>
              <span className="badge aqi-severe-bg aqi-severe p-2">Severe (250+)</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted">Loading live data...</p>
      )}
    </div>
  );
}

// A reusable card component for individual sensor readings
const SensorCard = ({ icon, title, value, unit, iconClass }) => {
  const displayValue = (value === null || value === undefined) ? '--' : parseFloat(value).toFixed(1);
  return (
    <div className="sensor-card">
      <div className={`icon-container ${iconClass}`}>
        {icon}
      </div>
      <div>
        <h4>{title}</h4>
        <p>
          {displayValue} <span className="unit">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;