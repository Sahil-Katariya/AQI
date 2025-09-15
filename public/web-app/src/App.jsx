import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wifi, Thermometer, Droplets, Wind, Cloud, Mountain, Gauge } from 'lucide-react';
import "./App.css";

// --- Firebase Configuration ---
const firebaseConfig = {
 apiKey: "AIzaSyDPki4OvYu3DRXf__FsQj81vuZXsF-n380",
 authDomain: "aqi-hackathon-150925.firebaseapp.com",
 databaseURL: "https://aqi-hackathon-150925-default-rtdb.asia-southeast1.firebasedatabase.app/",
 projectId: "aqi-hackathon-150925",
 storageBucket: "aqi-hackathon-150925.firebasestorage.app",
 messagingSenderId: "688524802229",
 appId: "1:688524802229:web:3a7bcda5d877cb15a2e6fc",
 measurementId: "G-4144PCG7J4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Helper Functions & Constants ---

// ✨ IMPROVED: Determines the color and label for a given PM2.5 AQI value based on Indian standards.
const getAqiInfo = (pm25) => {
 if (pm25 === null || pm25 === undefined) return { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-700' };
 if (pm25 <= 30) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500/20' };
 if (pm25 <= 60) return { label: 'Satisfactory', color: 'text-lime-400', bg: 'bg-lime-500/20' };
 if (pm25 <= 90) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
 if (pm25 <= 120) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/20' };
 if (pm25 <= 250) return { label: 'Very Poor', color: 'text-red-500', bg: 'bg-red-500/20' };
 return { label: 'Severe', color: 'text-rose-600', bg: 'bg-rose-500/20' };
};


// --- Components ---

/**
* AQI Card: A reusable card to display a single sensor reading.
*/
const AQICard = ({ icon, title, value, unit, color }) => {
 const displayValue = (value === null || value === undefined) ? '--' : parseFloat(value).toFixed(1);
 return (
  <div className="bg-slate-800/60 p-5 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105 hover:bg-slate-800">
   <div className={`p-3 rounded-full ${color || 'bg-cyan-500/20 text-cyan-400'}`}>
    {icon}
   </div>
   <div>
    <h4 className="text-sm font-medium text-gray-400">{title}</h4>
    <p className="text-2xl font-bold text-white">
     {displayValue} <span className="text-base font-normal text-gray-400">{unit}</span>
    </p>
   </div>
  </div>
 );
};


/**
* Data Chart: Visualizes historical sensor data using Recharts.
*/
const DataChart = ({ data }) => {
 return (
  <div className="bg-slate-800/60 p-6 rounded-xl shadow-lg mt-8">
   <h3 className="text-xl font-semibold text-white mb-4">📊 Historical Trends</h3>
   <div className="w-full h-80">
    <ResponsiveContainer>
     <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
      <Tooltip
       contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', borderRadius: '0.5rem' }}
       itemStyle={{ color: '#F9FAFB' }}
       cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
      />
      <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
      <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#F87171" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="pm10" name="PM10" stroke="#60A5FA" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="co2" name="CO₂" stroke="#34D399" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="nox" name="NOx" stroke="#A78BFA" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="mq135" name="Air Quality Index" stroke="#F472B6" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#FBBF24" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#7DD3FC" strokeWidth={2} dot={false} />
     </LineChart>
    </ResponsiveContainer>
   </div>
  </div>
 );
};


/**
* Dashboard: The main component that fetches and displays data.
*/
const Dashboard = () => {
 const [sensorData, setSensorData] = useState({});
 const [historicalData, setHistoricalData] = useState([]);
 const [connectionStatus, setConnectionStatus] = useState({ text: 'Connecting...', color: 'bg-yellow-500/20 text-yellow-400' });

 useEffect(() => {
  const sensorDataRef = ref(db, 'sensors/node1');

  const unsubscribe = onValue(sensorDataRef, (snapshot) => {
   if (snapshot.exists()) {
    const data = snapshot.val();
    setSensorData(data);
    setConnectionStatus({ text: 'Live', color: 'bg-green-500/20 text-green-400' });

    setHistoricalData(prevData => {
     const now = new Date();
     const newDataPoint = {
      ...data,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
     };
     // ✨ IMPROVED: Keep the last 30 data points for a better trend view
     return [...prevData, newDataPoint].slice(-30);
    });
   } else {
    setSensorData({});
    setConnectionStatus({ text: 'No Data', color: 'bg-red-500/20 text-red-400' });
   }
  }, (error) => {
   console.error("Firebase read failed: ", error);
   setConnectionStatus({ text: 'Error', color: 'bg-red-500/20 text-red-400' });
  });

  return () => unsubscribe();
 }, []);

 const aqiInfo = getAqiInfo(sensorData.pm25);

 return (
  <div className="space-y-8">
   {/* Header and Connection Status */}
   <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold text-white">Live Dashboard</h2>
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${connectionStatus.color}`}>
     <Wifi size={16} />
     <span>{connectionStatus.text}</span>
    </div>
   </div>

   {/* Main AQI Display */}
   <div className={`p-8 rounded-2xl shadow-2xl text-center ${aqiInfo.bg}`}>
    <h3 className="text-lg font-medium text-gray-300">PM2.5 Air Quality Index</h3>
    <p className={`text-7xl font-extrabold my-2 ${aqiInfo.color}`}>
     {(sensorData.pm25 !== null && sensorData.pm25 !== undefined) ? parseFloat(sensorData.pm25).toFixed(1) : '--'}
    </p>
    <p className={`text-2xl font-semibold ${aqiInfo.color}`}>{aqiInfo.label}</p>
    <p className="text-gray-400 text-sm mt-1">Based on Indian AQI Standards</p>
   </div>

   {/* Grid of all sensors */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <AQICard icon={<Wind size={24} />} title="PM10" value={sensorData.pm10} unit="µg/m³" color="bg-blue-500/20 text-blue-400" />
    <AQICard icon={<Cloud size={24} />} title="Carbon Dioxide (CO₂)" value={sensorData.co2} unit="ppm" color="bg-gray-500/20 text-gray-300" />
    <AQICard icon={<Mountain size={24} />} title="Nitrogen Oxides (NOx)" value={sensorData.nox} unit="ppm" color="bg-purple-500/20 text-purple-400" />
    <AQICard icon={<Gauge size={24} />} title="Air Quality Index" value={sensorData.mq135} unit="ppm" color="bg-pink-500/20 text-pink-400" />
    <AQICard icon={<Thermometer size={24} />} title="Temperature" value={sensorData.temperature} unit="°C" color="bg-amber-500/20 text-amber-400" />
    <AQICard icon={<Droplets size={24} />} title="Humidity" value={sensorData.humidity} unit="%" color="bg-sky-500/20 text-sky-400" />
   </div>

   {/* Chart */}
   <DataChart data={historicalData} />

   {/* AQI Info */}
   {/* ✨ IMPROVED: Updated legend to match the new 6-level AQI scale */}
   <div className="bg-slate-800/60 p-6 rounded-xl shadow-lg mt-8">
    <h3 className="text-xl font-semibold text-white mb-4">ℹ️ PM2.5 AQI Levels Explained</h3>
    <div className="flex flex-wrap gap-3 mt-2">
     <span className="badge bg-green-500/20 text-green-400 p-2">Good (0-30)</span>
     <span className="badge bg-lime-500/20 text-lime-400 p-2">Satisfactory (31-60)</span>
     <span className="badge bg-yellow-500/20 text-yellow-400 p-2">Moderate (61-90)</span>
     <span className="badge bg-orange-500/20 text-orange-400 p-2">Poor (91-120)</span>
     <span className="badge bg-red-500/20 text-red-400 p-2">Very Poor (121-250)</span>
     <span className="badge bg-rose-500/20 text-rose-600 p-2">Severe (250+)</span>
    </div>
   </div>
  </div>
 );
};


/**
* Main App Component
*/
export default function App() {
 return (
  <div className="min-h-screen bg-slate-900 text-white font-sans">
   <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
    <header className="text-center mb-10">
     <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400 sm:text-5xl">
      IoT Air Quality Monitoring System
     </h1>
     <p className="mt-4 text-lg text-gray-400">
      Real-time AQI data for Tier-2/3 cities, built for Hackathon 2025.
     </p>
    </header>

    {/* Main Content */}
    <main>
     <Dashboard />
    </main>

    {/* Footer */}
    <footer className="text-center py-8 mt-10 text-gray-500 text-sm border-t border-gray-700">
     <p>
      Current time in Bhavnagar, Gujarat, India is {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric' })}.
     </p>
     <p>&copy; {new Date().getFullYear()} AQI 2025 Team. All rights reserved.</p>
    </footer>
   </div>
  </div>
 );
}

// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue } from 'firebase/database';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Wifi, Thermometer, Droplets, Wind, Cloud, Mountain } from 'lucide-react';
// import "./App.css";

// // --- Firebase Configuration ---
// // IMPORTANT: You MUST replace these placeholder values with your own
// // Firebase project configuration for the app to work correctly.
// // You can find these details in your Firebase project settings.

// const firebaseConfig = {
//   apiKey: "AIzaSyDPki4OvYu3DRXf__FsQj81vuZXsF-n380",
//   authDomain: "aqi-hackathon-150925.firebaseapp.com",
//   databaseURL: "https://aqi-hackathon-150925-default-rtdb.asia-southeast1.firebasedatabase.app/",
//   projectId: "aqi-hackathon-150925",
//   storageBucket: "aqi-hackathon-150925.firebasestorage.app",
//   messagingSenderId: "688524802229",
//   appId: "1:688524802229:web:3a7bcda5d877cb15a2e6fc",
//   measurementId: "G-4144PCG7J4"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// // --- Helper Functions & Constants ---

// // Determines the color and label for a given PM2.5 AQI value.
// const getAqiInfo = (pm25) => {
//   if (pm25 === null || pm25 === undefined) return { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-700' };
//   if (pm25 <= 30) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500/20' };
//   if (pm25 <= 60) return { label: 'Satisfactory', color: 'text-lime-400', bg: 'bg-lime-500/20' };
//   if (pm25 <= 90) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
//   if (pm25 <= 120) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/20' };
//   if (pm25 <= 250) return { label: 'Very Poor', color: 'text-red-500', bg: 'bg-red-500/20' };
//   return { label: 'Severe', color: 'text-rose-600', bg: 'bg-rose-500/20' };
// };


// // --- Components ---

// /**
//  * AQI Card: A reusable card to display a single sensor reading.
//  */
// const AQICard = ({ icon, title, value, unit, color }) => {
//   const displayValue = (value === null || value === undefined) ? '--' : parseFloat(value).toFixed(1);
//   return (
//     <div className="bg-slate-800/60 p-5 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105 hover:bg-slate-800">
//       <div className={`p-3 rounded-full ${color || 'bg-cyan-500/20 text-cyan-400'}`}>
//         {icon}
//       </div>
//       <div>
//         <h4 className="text-sm font-medium text-gray-400">{title}</h4>
//         <p className="text-2xl font-bold text-white">
//           {displayValue} <span className="text-base font-normal text-gray-400">{unit}</span>
//         </p>
//       </div>
//     </div>
//   );
// };


// /**
//  * Data Chart: Visualizes historical sensor data using Recharts.
//  */
// const DataChart = ({ data }) => {
//   return (
//     <div className="bg-slate-800/60 p-6 rounded-xl shadow-lg mt-8">
//       <h3 className="text-xl font-semibold text-white mb-4">Historical Trends</h3>
//       <div className="w-full h-72">
//         <ResponsiveContainer>
//           <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//             <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
//             <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
//             <Tooltip
//               contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', borderRadius: '0.5rem' }}
//               itemStyle={{ color: '#F9FAFB' }}
//               cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
//             />
//             <Legend wrapperStyle={{ fontSize: "14px" }} />
//             <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#F87171" strokeWidth={2} dot={false} />
//             <Line type="monotone" dataKey="pm10" name="PM10" stroke="#60A5FA" strokeWidth={2} dot={false} />
//             <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#FBBF24" strokeWidth={2} dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };


// /**
//  * Dashboard: The main component that fetches and displays data.
//  */
// const Dashboard = () => {
//   const [sensorData, setSensorData] = useState({});
//   const [historicalData, setHistoricalData] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState({ text: 'Connecting...', color: 'bg-yellow-500/20 text-yellow-400' });

//   useEffect(() => {
//     // Reference to the 'sensorData' node in Firebase Realtime Database
//     const sensorDataRef = ref(db, 'sensorData');

//     const unsubscribe = onValue(sensorDataRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         setSensorData(data);
//         setConnectionStatus({ text: 'Live', color: 'bg-green-500/20 text-green-400' });

//         setHistoricalData(prevData => {
//           const now = new Date();
//           const newDataPoint = {
//             ...data,
//             timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           };
//           // Keep the last 30 data points for a clean chart
//           return [...prevData, newDataPoint].slice(-30);
//         });
//       } else {
//         setSensorData({});
//         setConnectionStatus({ text: 'No Data', color: 'bg-red-500/20 text-red-400' });
//       }
//     }, (error) => {
//       console.error("Firebase read failed: ", error);
//       setConnectionStatus({ text: 'Error', color: 'bg-red-500/20 text-red-400' });
//     });

//     // Cleanup subscription on component unmount
//     return () => unsubscribe();
//   }, []);

//   const aqiInfo = getAqiInfo(sensorData.pm25);

//   return (
//     <div className="space-y-8">
//       {/* Header and Connection Status */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-white">Live Dashboard</h2>
//         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${connectionStatus.color}`}>
//           <Wifi size={16} />
//           <span>{connectionStatus.text}</span>
//         </div>
//       </div>

//       {/* Main AQI Display */}
//       <div className={`p-8 rounded-2xl shadow-2xl text-center ${aqiInfo.bg}`}>
//         <h3 className="text-lg font-medium text-gray-300">PM2.5 Air Quality Index</h3>
//         <p className={`text-7xl font-extrabold my-2 ${aqiInfo.color}`}>
//           {(sensorData.pm25 !== null && sensorData.pm25 !== undefined) ? parseFloat(sensorData.pm25).toFixed(1) : '--'}
//         </p>
//         <p className={`text-2xl font-semibold ${aqiInfo.color}`}>{aqiInfo.label}</p>
//         <p className="text-gray-400 text-sm mt-1">Based on Indian AQI Standards</p>
//       </div>

//       {/* Grid of all sensors */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <AQICard icon={<Wind size={24} />} title="PM10" value={sensorData.pm10} unit="µg/m³" color="bg-blue-500/20 text-blue-400" />
//         <AQICard icon={<Cloud size={24} />} title="Carbon Dioxide (CO₂)" value={sensorData.co2} unit="ppm" color="bg-gray-500/20 text-gray-300" />
//         <AQICard icon={<Mountain size={24} />} title="Nitrogen Oxides (NOx)" value={sensorData.nox} unit="ppb" color="bg-purple-500/20 text-purple-400" />
//         <AQICard icon={<Thermometer size={24} />} title="Temperature" value={sensorData.temperature} unit="°C" color="bg-amber-500/20 text-amber-400" />
//         <AQICard icon={<Droplets size={24} />} title="Humidity" value={sensorData.humidity} unit="%" color="bg-sky-500/20 text-sky-400" />
//       </div>

//       {/* Chart */}
//       <DataChart data={historicalData} />
//     </div>
//   );
// };


// /**
//  * Main App Component
//  */
// export default function App() {
//   return (
//     <div className="min-h-screen bg-slate-900 text-white font-sans">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <header className="text-center mb-10">
//           <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400 sm:text-5xl">
//             IoT Air Quality Monitoring System
//           </h1>
//           <p className="mt-4 text-lg text-gray-400">
//             Real-time AQI data for Tier-2/3 cities, built for Hackathon 2025.
//           </p>
//         </header>

//         {/* Main Content */}
//         <main>
//           <Dashboard />
//         </main>

//         {/* Footer */}
//         <footer className="text-center py-8 mt-10 text-gray-500 text-sm border-t border-gray-700">
//           <p>
//             Current time in Bhavnagar, Gujarat, India is {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric' })}.
//           </p>
//           <p>&copy; {new Date().getFullYear()} AQI 2025 Team. All rights reserved.</p>
//         </footer>
//       </div>
//     </div>
//   );
// }

