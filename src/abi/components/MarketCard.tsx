"use client";

import { useEffect, useState } from "react";

type WinningSide = "NONE" | "UP" | "DOWN";

export default function MarketCard({
  marketOpened,
  marketResolved,
  startPrice,
  endPrice,
  bettingDeadline,
  winningSide,
}: {
  marketOpened: boolean;
  marketResolved: boolean;
  startPrice: string;
  endPrice: string;
  bettingDeadline: number;
  winningSide: WinningSide;
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, bettingDeadline - now);
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [bettingDeadline]);

  // Calculate price change directly
  const getPriceChange = () => {
    if (marketResolved) {
      const start = parseFloat(startPrice);
      const end = parseFloat(endPrice);
      if (start > 0 && end > 0) {
        return ((end - start) / start) * 100;
      }
    }
    return 0;
  };

  const priceChange = getPriceChange();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num > 0 ? `$${num.toFixed(2)}` : "N/A";
  };

  const getStatusColor = () => {
    if (marketResolved) return "from-blue-500 to-blue-700";
    if (marketOpened) return "from-green-500 to-emerald-600";
    return "from-gray-500 to-gray-700";
  };

  const getStatusText = () => {
    if (marketResolved) return "✅ Market Resolved";
    if (marketOpened) return "🔴 LIVE - Betting Active";
    return "⏸️ Market Not Started";
  };

  return (
    <div className="glass-white rounded-3xl p-6 shadow-2xl border border-blue-400/30 card-hover animate-fade-in relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-shimmer"></div>

      {/* Status Badge */}
      <div className="flex justify-between items-center mb-6">
        <div
          className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${getStatusColor()} text-white text-sm font-bold shadow-xl animate-pulse-glow`}
        >
          {getStatusText()}
        </div>
        {marketOpened && !marketResolved && timeLeft > 0 && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full border border-orange-300">
            <span className="text-xl">⏱️</span>
            <span className="text-xl font-bold font-mono bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Live Market Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-1">ETH/USD Market</h3>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-gray-600">Live Chainlink Price Feed</p>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-lg transform transition-all hover:scale-105">
          <p className="text-xs text-blue-600 font-semibold mb-2">START PRICE</p>
          <p className="text-3xl font-bold gradient-text">
            {formatPrice(startPrice)}
          </p>
        </div>

        <div className="text-center p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 shadow-lg transform transition-all hover:scale-105">
          <p className="text-xs text-cyan-600 font-semibold mb-2">
            {marketResolved ? "END PRICE" : "CURRENT"}
          </p>
          <p className="text-3xl font-bold gradient-text">
            {marketResolved ? formatPrice(endPrice) : formatPrice(startPrice)}
          </p>
        </div>
      </div>

      {/* Price Change Indicator */}
      {marketResolved && priceChange !== 0 && (
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            priceChange > 0
              ? "bg-green-100 border border-green-300"
              : "bg-red-100 border border-red-300"
          }`}>
            <span className="text-2xl">{priceChange > 0 ? "📈" : "📉"}</span>
            <span className={`text-lg font-bold ${
              priceChange > 0 ? "text-green-700" : "text-red-700"
            }`}>
              {priceChange > 0 ? "+" : ""}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Winner Display */}
      {marketResolved && (
        <div className="text-center animate-fade-in">
          <div
            className={`inline-block px-8 py-4 rounded-2xl font-bold text-white text-xl shadow-2xl ${
              winningSide === "UP"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse-glow"
                : winningSide === "DOWN"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse-glow"
                  : "bg-gradient-to-r from-gray-600 to-gray-800"
            }`}
          >
            {winningSide === "UP" && "🚀 UP WINS!"}
            {winningSide === "DOWN" && "📉 DOWN WINS!"}
            {winningSide === "NONE" && "🤝 TIE - REFUNDS"}
          </div>
        </div>
      )}

      {/* Betting Closed */}
      {marketOpened && !marketResolved && timeLeft === 0 && (
        <div className="mt-4 text-center bg-orange-100 border border-orange-300 rounded-xl p-3 animate-pulse">
          <p className="text-orange-700 font-bold">⚠️ Betting Closed - Awaiting Resolution</p>
        </div>
      )}
    </div>
  );
}
