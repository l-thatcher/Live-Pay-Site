"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [hourlyRate, setHourlyRate] = useState("");
  const [earnings, setEarnings] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        setEarnings((elapsedSeconds / 3600) * parseFloat(hourlyRate));
      }, 100);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime, hourlyRate]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Live Earnings Counter
        </h1>
        <div className="mb-4">
          <label
            htmlFor="hourlyRate"
            className="block text-gray-600 font-medium mb-2"
          >
            Hourly Rate (£):
          </label>
          <input
            type="number"
            id="hourlyRate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your hourly rate"
          />
        </div>
        <div className="mb-6">
          <h2 className="text-xl text-gray-800 font-medium">
            Money Earned:{" "}
            <span className="font-bold text-green-600">
              £{earnings.toFixed(2)}
            </span>
          </h2>
        </div>
        <button
          onClick={handleStartStop}
          className={`w-full px-4 py-2 rounded-md font-medium text-white ${
            isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}
