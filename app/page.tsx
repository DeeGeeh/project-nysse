"use client";

import React, { useState, useEffect } from "react";
import { Home, Map } from "lucide-react";

interface Card {
  title: string;
  stats: any;
  loading: boolean;
  error?: any;
  logoSrc?: string;
  logoSizeRatio?: number;
}

const CreateCard = (
  title: string, stats: any, loading: boolean, error?: any, logoSrc?: string, logoSizeRatio?: number): Card => {
  const newCard: Card = {
    title,
    stats,
    loading,
    error,
    logoSrc,
    logoSizeRatio
  };
  return newCard;
};


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
  const [walttiStats, setWalttiStats] = useState({
    totalTrips: 0,
    delayedCount: 0,
    percentage: 0,
  });
  const [hslStats, setHslStats] = useState({
    totalTrips: 0,
    delayedCount: 0,
    percentage: 0,
  });
  const [walttiLoading, setWalttiLoading] = useState(true);
  const [hslLoading, setHslLoading] = useState(true);
  const [walttiError, setWalttiError] = useState(null);
  const [hslError, setHslError] = useState(null);

  useEffect(() => {
    const fetchWalttiData = async () => {
      try {
        const response = await fetch("/api/digitransit/waltti");
        if (!response.ok) throw new Error("Failed to fetch Nysse data");

        const data = await response.json();
        const percentage =
          data.totalTrips > 0 ? (data.delayedCount / data.totalTrips) * 100 : 0;

        setWalttiStats({
          totalTrips: data.totalTrips,
          delayedCount: data.delayedCount,
          percentage,
        });
      } catch (err: any) {
        setWalttiError(err.message);
      } finally {
        setWalttiLoading(false);
      }
    };

    const fetchHslData = async () => {
      try {
        const response = await fetch("/api/digitransit/hsl");
        if (!response.ok) throw new Error("Failed to fetch HSL data");

        const data = await response.json();
        const percentage =
          data.totalTrips > 0 ? (data.delayedCount / data.totalTrips) * 100 : 0;

        setHslStats({
          totalTrips: data.totalTrips,
          delayedCount: data.delayedCount,
          percentage,
        });
      } catch (err: any) {
        setHslError(err.message);
      } finally {
        setHslLoading(false);
      }
    };

    fetchWalttiData();
    fetchHslData();

    const interval = setInterval(() => {
      fetchWalttiData();
      fetchHslData();
    }, 90000);

    return () => clearInterval(interval);
  }, []);

  const renderStats = (card: Card) => (
    <div className="mt-8 bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-center items-center">
        {card.logoSrc && (
          <img
            src={card.logoSrc}
            alt={`${card.title} logo`}
            className="object-contain"
            style={{
              // The nysse logo appears to be bigger to the eye.
              // This makes them look the same size. 
              height: card.logoSizeRatio ? `${card.logoSizeRatio * 2.5}rem` : "3rem",
              width: "auto",
            }}
          />
        )}
      </div>
      <div className="p-6">
        {card.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : card.error ? (
          <div className="text-center text-red-500 p-4">{card.error}</div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-black">
            <PercentageCircle percentage={card.stats.percentage} />
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                {card.stats.delayedCount} out of {card.stats.totalTrips} trips are delayed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const WalttiCard = CreateCard("NYSSE", walttiStats, walttiLoading, walttiError, "/nysse_logo_iso.svg", 0.9);
  const HSLCard = CreateCard("HSL", hslStats, hslLoading, hslError, "/HSL_logo.svg");

  return (
    <div className="h-screen w-full bg-gray">
      <nav
        className="flex justify-between items-center p-4 rounded-t-xl"
        style={{ background: "var(--background)" }}
      >
        <a href="/" className="p-2 hover:bg-slate-100 rounded-lg">
          <Home size={24} />
        </a>
        <span className="font-bold">DelayCheck</span>
        <a href="/map" className="p-2 hover:bg-slate-100 rounded-lg">
          <Map size={24} />
        </a>
      </nav>
      <div className="max-w-4xl mx-auto p-4">
        {renderStats(WalttiCard)}
        {renderStats(HSLCard)}
      </div>
    </div>
  );
};

export default Page;
