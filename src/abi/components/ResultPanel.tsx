"use client";

type WinningSide = "NONE" | "UP" | "DOWN";

export default function ResultPanel({
  marketResolved,
  winningSide,
  contractBalance,
  userUpBet,
  userDownBet,
  userClaimed,
  onClaim,
  loading,
}: {
  marketResolved: boolean;
  winningSide: WinningSide;
  contractBalance: string;
  userUpBet: string;
  userDownBet: string;
  userClaimed: boolean;
  onClaim: () => void;
  loading: boolean;
}) {
  const canClaim =
    marketResolved &&
    !userClaimed &&
    ((winningSide === "UP" && parseFloat(userUpBet) > 0) ||
      (winningSide === "DOWN" && parseFloat(userDownBet) > 0) ||
      (winningSide === "NONE" &&
        (parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0)));

  const userWon =
    marketResolved &&
    ((winningSide === "UP" && parseFloat(userUpBet) > 0) ||
      (winningSide === "DOWN" && parseFloat(userDownBet) > 0));

  const userTied =
    marketResolved &&
    winningSide === "NONE" &&
    (parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0);

  return (
    <div className="glass-white rounded-3xl p-6 shadow-2xl border border-blue-400/30 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold gradient-text">Results & Rewards</h3>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      {/* Contract Balance */}
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-50 rounded-2xl border-2 border-blue-300 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <p className="text-sm font-bold text-blue-900">Prize Pool</p>
          </div>
          <p className="text-4xl font-bold gradient-text neon-blue">
            {parseFloat(contractBalance).toFixed(4)} ETH
          </p>
          <p className="text-xs text-blue-600 mt-1">Smart Contract Balance</p>
        </div>
      </div>

      {/* User Result */}
      {marketResolved && (
        <div className="space-y-4 animate-fade-in">
          {userWon && (
            <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 border-3 border-green-400 rounded-2xl shadow-xl animate-pulse-glow">
              <div className="text-center">
                <p className="text-5xl mb-3">🎉</p>
                <p className="text-3xl font-bold text-green-800 mb-2">
                  Congratulations!
                </p>
                <p className="text-lg text-green-700 font-semibold">
                  You predicted correctly!
                </p>
              </div>
            </div>
          )}

          {userTied && (
            <div className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-3 border-yellow-400 rounded-2xl shadow-xl">
              <div className="text-center">
                <p className="text-4xl mb-3">🤝</p>
                <p className="text-2xl font-bold text-yellow-800 mb-2">
                  It&apos;s a Tie!
                </p>
                <p className="text-sm text-yellow-700 font-semibold">
                  Claim your full refund below
                </p>
              </div>
            </div>
          )}

          {marketResolved &&
            !userWon &&
            !userTied &&
            (parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0) && (
              <div className="p-6 bg-gradient-to-br from-gray-100 to-slate-200 border-2 border-gray-400 rounded-2xl">
                <div className="text-center">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-xl font-bold text-gray-800 mb-1">
                    Better Luck Next Time
                  </p>
                  <p className="text-sm text-gray-600">
                    Keep trying - the next market is coming!
                  </p>
                </div>
              </div>
            )}

          {marketResolved &&
            parseFloat(userUpBet) === 0 &&
            parseFloat(userDownBet) === 0 && (
              <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="text-center">
                  <p className="text-2xl mb-2">👀</p>
                  <p className="text-sm text-blue-800 font-semibold">
                    You didn&apos;t participate in this round
                  </p>
                </div>
              </div>
            )}

          {/* Claim Button */}
          {canClaim && (
            <button
              onClick={onClaim}
              disabled={loading}
              className="btn-premium w-full px-8 py-5 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-xl relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="spinner inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full"></span>
                    Claiming...
                  </>
                ) : (
                  <>
                    💰 Claim Your Rewards
                  </>
                )}
              </span>
            </button>
          )}

          {userClaimed && (
            <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl text-center shadow-lg">
              <p className="text-green-800 font-bold text-lg flex items-center justify-center gap-2">
                <span className="text-2xl">✅</span>
                Rewards Successfully Claimed!
              </p>
            </div>
          )}
        </div>
      )}

      {!marketResolved && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl text-center">
          <p className="text-3xl mb-3">⏳</p>
          <p className="text-blue-900 font-bold text-lg mb-1">
            Market In Progress
          </p>
          <p className="text-blue-600 text-sm">
            Results will appear here after resolution
          </p>
        </div>
      )}
    </div>
  );
}
