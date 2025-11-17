"use client";

export default function BetPanel({
  onBetUp,
  onBetDown,
  totalUpBet,
  totalDownBet,
  userUpBet,
  userDownBet,
  betAmount,
  setBetAmount,
  disabled,
  loading,
}: {
  onBetUp: () => void;
  onBetDown: () => void;
  totalUpBet: string;
  totalDownBet: string;
  userUpBet: string;
  userDownBet: string;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const totalPool = parseFloat(totalUpBet) + parseFloat(totalDownBet);
  const upPercentage =
    totalPool > 0
      ? ((parseFloat(totalUpBet) / totalPool) * 100).toFixed(1)
      : "50.0";
  const downPercentage =
    totalPool > 0
      ? ((parseFloat(totalDownBet) / totalPool) * 100).toFixed(1)
      : "50.0";

  const quickAmounts = ["0.001", "0.01", "0.05", "0.1"];

  return (
    <div className="glass-white rounded-3xl p-6 shadow-2xl border border-blue-400/30 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold gradient-text">Place Your Bet</h3>
        <div className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-full">
          <p className="text-xs font-bold text-blue-700">Live Market</p>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-blue-900 mb-3">
          💰 Bet Amount (ETH)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={disabled || loading}
            className="w-full px-6 py-4 text-lg font-bold border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-inner transition-all"
            placeholder="0.001"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">
            ETH
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={disabled || loading}
              className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-cyan-100 hover:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-blue-700"
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Betting Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={onBetUp}
          disabled={disabled || loading}
          className="btn-premium px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">
            {loading ? "⏳" : "🚀"} BET UP
          </span>
        </button>
        <button
          onClick={onBetDown}
          disabled={disabled || loading}
          className="btn-premium px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">
            {loading ? "⏳" : "📉"} BET DOWN
          </span>
        </button>
      </div>

      {/* Pool Stats */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-blue-900">Total Pool Size:</span>
          <span className="font-bold text-lg gradient-text">
            {totalPool.toFixed(4)} ETH
          </span>
        </div>

        {/* UP Pool */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              UP Pool
            </span>
            <span className="font-bold text-green-700">
              {parseFloat(totalUpBet).toFixed(4)} ETH ({upPercentage}%)
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${upPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* DOWN Pool */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-red-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              DOWN Pool
            </span>
            <span className="font-bold text-red-700">
              {parseFloat(totalDownBet).toFixed(4)} ETH ({downPercentage}%)
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-rose-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${downPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Your Bets */}
      {(parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0) && (
        <div className="mt-6 pt-5 border-t-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-blue-900">Your Active Bets:</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600 font-semibold mb-1">UP</p>
              <p className="font-bold text-green-700">{parseFloat(userUpBet).toFixed(4)} ETH</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-center">
              <p className="text-xs text-red-600 font-semibold mb-1">DOWN</p>
              <p className="font-bold text-red-700">{parseFloat(userDownBet).toFixed(4)} ETH</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
