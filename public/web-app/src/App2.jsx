import React from "react";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <header className="w-full p-4 bg-blue-600  text-center shadow-md">
        <h1 className="text-2xl font-bold">🌍 Real-time AQI Monitoring</h1>
        <p className="text-sm">Powered by ESP32 + Firebase + React</p>
      </header>

      <main className="flex-grow w-full max-w-2xl p-6">
        <Dashboard />
      </main>

      <footer className="w-full p-4 text-center text-sm bg-gray-200">
        Hackathon Prototype © 2025
      </footer>
    </div>
  );
}

export default App;
