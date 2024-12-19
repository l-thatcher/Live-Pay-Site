"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, DollarSign, PoundSterling, Euro } from "lucide-react";

type Currency = {
  code: string;
  symbol: string;
  icon: React.ReactNode;
};

type TabType = "hourly" | "yearly";

export default function PayCounter() {
  const [activeTab, setActiveTab] = useState<TabType>("hourly");
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [yearlyRate, setYearlyRate] = useState<number | null>(null);
  const [hourlyInput, setHourlyInput] = useState("");
  const [yearlyInput, setYearlyInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hourlyEarnings, setHourlyEarnings] = useState(0);
  const [yearlyEarnings, setYearlyEarnings] = useState(0);
  const [inputError, setInputError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: "GBP",
    symbol: "£",
    icon: <PoundSterling className="h-5 w-5" />,
  });
  const earningsInterval = useRef<NodeJS.Timeout | null>(null);

  const currencies: Currency[] = [
    { code: "GBP", symbol: "£", icon: <PoundSterling className="h-5 w-5" /> },
    { code: "EUR", symbol: "€", icon: <Euro className="h-5 w-5" /> },
    { code: "USD", symbol: "$", icon: <DollarSign className="h-5 w-5" /> },
  ];

  const calculateYearProgress = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const timeDiff = now.getTime() - startOfYear.getTime();
    const yearProgress = timeDiff / (1000 * 60 * 60 * 24 * 365);
    return yearProgress;
  };

  const calculateYearlyEarnings = () => {
    if (!yearlyRate) return 0;
    return yearlyRate * calculateYearProgress();
  };

  const startCounter = () => {
    if (!hourlyRate || hourlyRate <= 0) {
      setInputError("Please enter a valid hourly rate");
      return;
    }
    setInputError("");
    setIsRunning(true);
  };

  const stopCounter = () => {
    setIsRunning(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (activeTab === "hourly") {
      setHourlyInput(value);
      const numberValue = parseFloat(value);
      setHourlyRate(isNaN(numberValue) ? null : numberValue);
      if (isNaN(numberValue)) setHourlyEarnings(0);
    } else {
      setYearlyInput(value);
      const numberValue = parseFloat(value);
      setYearlyRate(isNaN(numberValue) ? null : numberValue);
      if (isNaN(numberValue)) {
        setYearlyEarnings(0);
      } else {
        setYearlyEarnings(calculateYearlyEarnings());
      }
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = currencies.find((curr) => curr.code === e.target.value);
    if (newCurrency) {
      setSelectedCurrency(newCurrency);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setInputError("");
  };

  useEffect(() => {
    if (yearlyRate) {
      const updateYearlyEarnings = () => {
        setYearlyEarnings(calculateYearlyEarnings());
      };
      updateYearlyEarnings();
      const yearlyInterval = setInterval(updateYearlyEarnings, 1000);
      return () => clearInterval(yearlyInterval);
    }
  }, [yearlyRate]);

  useEffect(() => {
    if (isRunning && hourlyRate) {
      const ratePerMs = hourlyRate / (60 * 60 * 1000);
      earningsInterval.current = setInterval(() => {
        setHourlyEarnings((prev) => prev + ratePerMs * 100);
      }, 100);

      return () => {
        if (earningsInterval.current) {
          clearInterval(earningsInterval.current);
        }
      };
    }
  }, [isRunning, hourlyRate]);

  const handleReset = () => {
    setIsRunning(false);
    setHourlyEarnings(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Pay Counter
        </h1>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange("hourly")}
            className={`flex-1 py-2 rounded-md transition-colors duration-200 ${
              activeTab === "hourly"
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hourly Rate
          </button>
          <button
            onClick={() => handleTabChange("yearly")}
            className={`flex-1 py-2 rounded-md transition-colors duration-200 ${
              activeTab === "yearly"
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly Salary
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label
                htmlFor="rate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {activeTab === "hourly" ? "Hourly Rate" : "Yearly Salary"}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {selectedCurrency.icon}
                </div>
                <input
                  type="number"
                  id="rate"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter ${
                    activeTab === "hourly" ? "rate" : "salary"
                  }`}
                  value={activeTab === "hourly" ? hourlyInput : yearlyInput}
                  onChange={handleInputChange}
                  disabled={activeTab === "hourly" && isRunning}
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Currency
              </label>
              <select
                id="currency"
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCurrency.code}
                onChange={handleCurrencyChange}
                disabled={activeTab === "hourly" && isRunning}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {inputError && (
            <p className="mt-2 text-sm text-red-600">{inputError}</p>
          )}

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {activeTab === "hourly" ? "Current Earnings" : "Earned This Year"}
            </p>
            <p className="text-4xl font-bold text-indigo-600">
              {selectedCurrency.symbol}
              {activeTab === "hourly"
                ? hourlyEarnings.toFixed(2)
                : yearlyEarnings.toFixed(2)}
            </p>
            {activeTab === "yearly" && yearlyRate && (
              <p className="text-sm text-gray-500 mt-2">
                {(calculateYearProgress() * 100).toFixed(1)}% through the year
              </p>
            )}
            {activeTab === "yearly" && isRunning && hourlyRate && (
              <p className="text-sm text-gray-500 mt-2">
                Hourly counter running: {selectedCurrency.symbol}
                {hourlyEarnings.toFixed(2)}
              </p>
            )}
          </div>

          {activeTab === "hourly" && (
            <div className="flex space-x-4">
              <button
                onClick={isRunning ? stopCounter : startCounter}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } transition-colors duration-200`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
