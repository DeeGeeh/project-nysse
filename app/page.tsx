"use client";

import React, { useState, useEffect } from 'react';
import { Home, Map, Clock } from 'lucide-react';

const PercentageCircle = ({ percentage = 0 }) => (
  <div className="relative w-48 h-48">
    <svg className="w-full h-full" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
      />
      {/* Percentage circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${percentage * 2.83} 283`}
        transform="rotate(-90 50 50)"
      />
      {/* Percentage text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="0.3em"
        className="text-2xl font-bold"
        fill="currentColor"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  </div>
);

const Page = () => {
  const [stats, setStats] = useState({ 
    totalTrips: 0, 
    delayedCount: 0,
    percentage: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/digitransit');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        const percentage = data.totalTrips > 0 
          ? (data.delayedCount / data.totalTrips) * 100 
          : 0;
          
        setStats({
          totalTrips: data.totalTrips,
          delayedCount: data.delayedCount,
          percentage: percentage
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 90000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-gray">
     <nav className="flex justify-between items-center p-4 rounded-t-xl" style={{ background: 'var(--background)' }}>
        <a href="/" className="p-2 hover:bg-slate-100 rounded-lg">
          <Home size={24} />
        </a>
        <span className="font-bold">Project</span>
        <a href="/map" className="p-2 hover:bg-slate-100 rounded-lg">
          <Map size={24} />
        </a>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl text-black font-bold">Live Transit Status</h2>
            <Clock className="text-black" />
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                Error loading data: {error}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-black">
                <PercentageCircle percentage={stats.percentage} />
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    {stats.delayedCount} out of {stats.totalTrips} trips are delayed
                  </p>
                  <p>swag</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;