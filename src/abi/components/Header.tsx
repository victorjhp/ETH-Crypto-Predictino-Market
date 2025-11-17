export default function Header({
  account,
  onConnect,
}: {
  account: string | null;
  onConnect: () => void;
}) {
  return (
    <header className="w-full border-b border-[var(--border-primary)] bg-[var(--bg-primary)] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            PREDICTION
          </h1>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Market
            </a>
            <a href="#" className="text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Portfolio
            </a>
            <a href="#" className="text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              History
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5">
            <div className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full"></div>
            <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Sepolia</span>
          </div>
          {account ? (
            <div className="flex items-center gap-2 px-4 py-2 border border-[var(--border-primary)]">
              <div className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full"></div>
              <span className="font-mono text-xs font-medium text-[var(--text-primary)] tracking-wider">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="btn-clean text-xs"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
