export default function WalletButton({
  connected,
  onClick,
  loading,
}: {
  connected: boolean;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
        connected
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : "bg-gradient-to-r from-indigo-600 to-purple-600"
      } text-white`}
    >
      {loading ? "⏳ Connecting..." : connected ? "✅ Connected" : "🔗 Connect Wallet"}
    </button>
  );
}
