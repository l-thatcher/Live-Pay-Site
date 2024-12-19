"use client";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  DollarSign,
  PoundSterling,
  Euro,
  ChevronDown,
} from "lucide-react";

type Currency = {
  code: string;
  symbol: string;
  icon: React.ReactNode;
};

type TabType = "hourly" | "yearly";

type TimeProgress = {
  year: number;
  month: number;
  week: number;
  day: number;
};

type ExpandedSections = {
  month: boolean;
  week: boolean;
  day: boolean;
};

export default function PayCounter() {
  const [activeTab, setActiveTab] = useState<TabType>("hourly");
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [yearlyRate, setYearlyRate] = useState<number | null>(null);
  const [hourlyInput, setHourlyInput] = useState("");
  const [yearlyInput, setYearlyInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hourlyEarnings, setHourlyEarnings] = useState(0);
  const [periodEarnings, setPeriodEarnings] = useState<TimeProgress>({
    year: 0,
    month: 0,
    week: 0,
    day: 0,
  });
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    month: false,
    week: false,
    day: false,
  });
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

  const calculateTimeProgress = (): TimeProgress => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const msInYear = 365 * 24 * 60 * 60 * 1000;
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const msInMonth = daysInMonth * 24 * 60 * 60 * 1000;
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const msInDay = 24 * 60 * 60 * 1000;

    return {
      year: (now.getTime() - startOfYear.getTime()) / msInYear,
      month: (now.getTime() - startOfMonth.getTime()) / msInMonth,
      week: (now.getTime() - startOfWeek.getTime()) / msInWeek,
      day: (now.getTime() - startOfDay.getTime()) / msInDay,
    };
  };

  const calculatePeriodEarnings = () => {
    if (!yearlyRate) return;
    const progress = calculateTimeProgress();
    setPeriodEarnings({
      year: yearlyRate * progress.year,
      month: (yearlyRate / 12) * progress.month,
      week: (yearlyRate / 52) * progress.week,
      day: (yearlyRate / 365) * progress.day,
    });
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
        setPeriodEarnings({
          year: 0,
          month: 0,
          week: 0,
          day: 0,
        });
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
    if (tab === "hourly") {
      setHourlyEarnings(0);
      setIsRunning(false);
    } else {
      setPeriodEarnings({
        year: 0,
        month: 0,
        week: 0,
        day: 0,
      });
    }
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleReset = () => {
    setIsRunning(false);
    setHourlyEarnings(0);
  };

  useEffect(() => {
    if (yearlyRate) {
      calculatePeriodEarnings();
      const periodInterval = setInterval(calculatePeriodEarnings, 1000);
      return () => clearInterval(periodInterval);
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

  const renderProgressSection = (
    period: "month" | "week" | "day",
    amount: number,
    isExpanded: boolean,
    yearlyDivisor: number
  ) => {
    if (!yearlyRate) return null;

    const progress = (amount / (yearlyRate / yearlyDivisor)) * 100;

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-2">
        <button
          onClick={() => toggleSection(period)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <p className="text-sm text-gray-600 capitalize">This {period}</p>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="p-4 border-t border-gray-100">
            <p className="text-2xl font-bold text-indigo-600 mb-4">
              {selectedCurrency.symbol}
              {amount.toFixed(2)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-500">
                {period === "month" && "Since start of month"}
                {period === "week" && "Since Sunday"}
                {period === "day" && "Since midnight"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 my-16 w-full max-w-md transform transition-all duration-500 hover:scale-102 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center animate-fade-in">
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

          <div className="bg-gray-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:shadow-md">
            {activeTab === "hourly" ? (
              <div className="animate-fade-in">
                <p className="text-sm text-gray-600 mb-2">Current Earnings</p>
                <p className="text-4xl font-bold text-indigo-600">
                  {selectedCurrency.symbol}
                  {hourlyEarnings.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {yearlyRate ? (
                  <>
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">This Year</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {selectedCurrency.symbol}
                        {periodEarnings.year.toFixed(2)}
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>
                            {((periodEarnings.year / yearlyRate) * 100).toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (periodEarnings.year / yearlyRate) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          Since January 1st
                        </div>
                      </div>
                    </div>
                    {renderProgressSection(
                      "month",
                      periodEarnings.month,
                      expandedSections.month,
                      12
                    )}
                    {renderProgressSection(
                      "week",
                      periodEarnings.week,
                      expandedSections.week,
                      52
                    )}
                    {renderProgressSection(
                      "day",
                      periodEarnings.day,
                      expandedSections.day,
                      365
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 py-4">
                    Enter a yearly salary to see earnings breakdown
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === "hourly" && (
            <div className="flex space-x-4 animate-fade-in">
              <button
                onClick={isRunning ? stopCounter : startCounter}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transform transition-all duration-300 hover:scale-105 ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 w-5 mr-2" />
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
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transform transition-all duration-300 hover:scale-105"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx global>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          .scale-102 {
            transform: scale(1.02);
          }
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
