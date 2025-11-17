"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import abi from "../src/abi/SimplePredictionMarket.json";
import Header from "../src/abi/components/Header";
import LivePriceChart from "../src/abi/components/LivePriceChart";

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const SEPOLIA_CHAIN_ID = 11155111;

type WinningSide = "NONE" | "UP" | "DOWN";

export default function Home() {
  // Wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Market state
  const [owner, setOwner] = useState<string>("");
  const [marketOpened, setMarketOpened] = useState(false);
  const [marketResolved, setMarketResolved] = useState(false);
  const [startPrice, setStartPrice] = useState<string>("0");
  const [endPrice, setEndPrice] = useState<string>("0");
  const [bettingDeadline, setBettingDeadline] = useState<number>(0);
  const [totalUpBet, setTotalUpBet] = useState<string>("0");
  const [totalDownBet, setTotalDownBet] = useState<string>("0");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [winningSide, setWinningSide] = useState<WinningSide>("NONE");

  // User state
  const [userUpBet, setUserUpBet] = useState<string>("0");
  const [userDownBet, setUserDownBet] = useState<string>("0");
  const [userClaimed, setUserClaimed] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [message, setMessage] = useState("");
  const [betAmount, setBetAmount] = useState("0.001");

  // Load market data
  const loadMarketState = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const [
        ownerAddr,
        opened,
        resolved,
        sPrice,
        ePrice,
        deadline,
        upTotal,
        downTotal,
        balance,
        userUp,
        userDown,
        claimed,
      ] = await Promise.all([
        contract.owner(),
        contract.marketOpened(),
        contract.marketResolved(),
        contract.startPrice(),
        contract.endPrice(),
        contract.bettingDeadline(),
        contract.totalUpBet(),
        contract.totalDownBet(),
        contract.getContractBalance(),
        contract.upBets(account),
        contract.downBets(account),
        contract.claimed(account),
      ]);

      setOwner(ownerAddr.toLowerCase());
      setMarketOpened(opened);
      setMarketResolved(resolved);
      setStartPrice(ethers.formatUnits(sPrice, 8));
      setEndPrice(ethers.formatUnits(ePrice, 8));
      setBettingDeadline(Number(deadline));
      setTotalUpBet(ethers.formatEther(upTotal));
      setTotalDownBet(ethers.formatEther(downTotal));
      setContractBalance(ethers.formatEther(balance));
      setUserUpBet(ethers.formatEther(userUp));
      setUserDownBet(ethers.formatEther(userDown));
      setUserClaimed(claimed);

      if (resolved) {
        const winner = await contract.getWinningSide();
        setWinningSide(winner === 0 ? "NONE" : winner === 1 ? "UP" : "DOWN");
      }
    } catch (error) {
      console.error("Error loading market state:", error);
    }
  }, [contract, account]);

  // Connect wallet
  async function connectWallet() {
    if (!window.ethereum) {
      setMessage("Please install MetaMask!");
      return;
    }

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
          });
        } catch (switchError) {
          console.error("Switch error:", switchError);
          setMessage("Please switch to Sepolia Testnet manually!");
        }
        return;
      }

      setWrongNetwork(false);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contractInstance = new Contract(CONTRACT_ADDRESS, abi, signer);

      setAccount(address);
      setContract(contractInstance);
      setMessage("Wallet connected!");
    } catch (error: unknown) {
      console.error("Connection error:", error);
      setMessage("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  // Bet functions
  async function handleBetUp() {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage("Placing UP bet...");
      const tx = await contract.betUp({ value: ethers.parseEther(betAmount) });
      await tx.wait();
      setMessage("UP bet placed successfully!");
      await loadMarketState();
    } catch (error: unknown) {
      console.error("Bet error:", error);
      setMessage("Failed to place bet");
    } finally {
      setTxPending(false);
    }
  }

  async function handleBetDown() {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage("Placing DOWN bet...");
      const tx = await contract.betDown({
        value: ethers.parseEther(betAmount),
      });
      await tx.wait();
      setMessage("DOWN bet placed successfully!");
      await loadMarketState();
    } catch (error: unknown) {
      console.error("Bet error:", error);
      setMessage("Failed to place bet");
    } finally {
      setTxPending(false);
    }
  }

  // Claim function
  async function handleClaim() {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage("Claiming rewards...");
      const tx = await contract.claim();
      await tx.wait();
      setMessage("Rewards claimed successfully!");
      await loadMarketState();
    } catch (error: unknown) {
      console.error("Claim error:", error);
      setMessage("Failed to claim rewards");
    } finally {
      setTxPending(false);
    }
  }

  // Admin functions
  async function handleOpenMarket(duration: number) {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage("Opening market...");
      const tx = await contract.openMarket(duration);
      await tx.wait();
      setMessage("Market opened successfully!");
      await loadMarketState();
    } catch (error: unknown) {
      console.error("Open market error:", error);
      setMessage("Failed to open market");
    } finally {
      setTxPending(false);
    }
  }

  async function handleResolveMarket() {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage("Resolving market...");
      const tx = await contract.resolveMarket();
      await tx.wait();
      setMessage("Market resolved successfully!");
      await loadMarketState();
    } catch (error: unknown) {
      console.error("Resolve market error:", error);
      setMessage("Failed to resolve market");
    } finally {
      setTxPending(false);
    }
  }

  // Auto-refresh
  useEffect(() => {
    if (contract && account) {
      loadMarketState();
      const interval = setInterval(loadMarketState, 15000);
      return () => clearInterval(interval);
    }
  }, [contract, account, loadMarketState]);

  const isOwner = account && owner && account.toLowerCase() === owner;

  const totalPool = parseFloat(totalUpBet) + parseFloat(totalDownBet);
  const upPercentage =
    totalPool > 0
      ? ((parseFloat(totalUpBet) / totalPool) * 100).toFixed(1)
      : "50.0";
  const downPercentage =
    totalPool > 0
      ? ((parseFloat(totalDownBet) / totalPool) * 100).toFixed(1)
      : "50.0";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, bettingDeadline - now);
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [bettingDeadline]);

  const canClaim =
    marketResolved &&
    !userClaimed &&
    ((winningSide === "UP" && parseFloat(userUpBet) > 0) ||
      (winningSide === "DOWN" && parseFloat(userDownBet) > 0) ||
      (winningSide === "NONE" &&
        (parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0)));

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Header account={account} onConnect={connectWallet} />

      <div className="max-w-[1400px] mx-auto px-8 py-16">
        {message && (
          <div className="mb-8 p-4 border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <p className="text-sm text-[var(--text-primary)] text-center">
              {message}
            </p>
          </div>
        )}

        {wrongNetwork && (
          <div className="mb-8 p-4 border border-[var(--accent-red)] bg-[var(--bg-card)]">
            <p className="text-sm text-[var(--accent-red)] text-center">
              ⚠️ Please switch to Sepolia Testnet
            </p>
          </div>
        )}

        {!account ? (
          <div className="space-y-20 py-20 animate-fade-in">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Text Content */}
              <div className="flex flex-col justify-center">
                <h2 className="text-6xl font-light tracking-tight mb-8 text-[var(--text-primary)] leading-tight">
                  My Crypto Prediction Model,
                  <br />
                  <span className="italic">Beat to Win!</span>
                </h2>
                <p className="text-lg text-[var(--text-secondary)] mb-12 leading-relaxed">
                  Predict Ethereum price movements with decentralized markets.
                  Built on Chainlink price feeds.
                </p>
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn-clean text-xs w-fit"
                >
                  {loading ? "Connecting..." : "Connect Wallet —"}
                </button>
              </div>

              {/* Right Column: Chart */}
              <div className="lg:sticky lg:top-24 h-fit">
                <LivePriceChart
                  startPrice={startPrice}
                  endPrice={endPrice}
                  marketResolved={marketResolved}
                />
              </div>
            </div>

            {/* Betting Feature Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left: Market Status Preview */}
              <div className="clean-card p-8 opacity-60">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                      Market Status
                    </p>
                    <h3 className="text-2xl font-light text-[var(--text-primary)]">
                      Not Started
                    </h3>
                  </div>
                </div>

                <div className="divider mb-8"></div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                      Start Price
                    </p>
                    <p className="text-3xl font-light text-[var(--text-primary)]">
                      $3,245.00
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                      Current
                    </p>
                    <p className="text-3xl font-light text-[var(--text-primary)]">
                      $3,245.00
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Betting Panel Preview */}
              <div className="clean-card p-8 opacity-60">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-6">
                  Place Bet
                </p>

                <div className="mb-6">
                  <input
                    type="number"
                    value="0.001"
                    disabled
                    className="w-full px-4 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-lg font-light focus:outline-none opacity-50 cursor-not-allowed"
                    placeholder="0.001"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mb-8">
                  {["0.001", "0.01", "0.05", "0.1"].map((amount) => (
                    <button
                      key={amount}
                      disabled
                      className="px-4 py-2 text-xs uppercase tracking-wider border border-[var(--border-primary)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled
                    className="px-6 py-4 border border-[var(--accent-green)] text-[var(--accent-green)] text-xs uppercase tracking-wider opacity-50 cursor-not-allowed"
                  >
                    BET UP
                  </button>
                  <button
                    disabled
                    className="px-6 py-4 border border-[var(--accent-red)] text-[var(--accent-red)] text-xs uppercase tracking-wider opacity-50 cursor-not-allowed"
                  >
                    BET DOWN
                  </button>
                </div>
              </div>
            </div>

            {/* Pool Distribution Preview */}
            <div className="clean-card p-8 opacity-60">
              <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Pool Distribution
              </p>
              <p className="text-4xl font-light text-[var(--text-primary)] mb-8">
                0.0000 ETH
              </p>

              <div className="divider mb-8"></div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-[var(--accent-green)] uppercase tracking-wider">
                      UP
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">
                      0.0000 ETH (50.0%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[var(--border-primary)]">
                    <div
                      className="h-1 bg-[var(--accent-green)] transition-all duration-500"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-[var(--accent-red)] uppercase tracking-wider">
                      DOWN
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">
                      0.0000 ETH (50.0%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[var(--border-primary)]">
                    <div
                      className="h-1 bg-[var(--accent-red)] transition-all duration-500"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <div className="space-y-16">
              {/* Market Status */}
              <div className="clean-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                      Market Status
                    </p>
                    <h3 className="text-2xl font-light text-[var(--text-primary)]">
                      {marketResolved
                        ? "Resolved"
                        : marketOpened
                        ? "Live"
                        : "Not Started"}
                    </h3>
                  </div>
                  {marketOpened && !marketResolved && timeLeft > 0 && (
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        Time Remaining
                      </p>
                      <p className="text-3xl font-light font-mono text-[var(--text-primary)]">
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="divider mb-8"></div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                      Start Price
                    </p>
                    <p className="text-3xl font-light text-[var(--text-primary)]">
                      $
                      {parseFloat(startPrice) > 0
                        ? parseFloat(startPrice).toFixed(2)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                      {marketResolved ? "End Price" : "Current"}
                    </p>
                    <p className="text-3xl font-light text-[var(--text-primary)]">
                      $
                      {marketResolved
                        ? parseFloat(endPrice).toFixed(2)
                        : parseFloat(startPrice).toFixed(2)}
                    </p>
                  </div>
                </div>

                {marketResolved && (
                  <>
                    <div className="divider my-8"></div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                        Result
                      </p>
                      <p className="text-xl font-light text-[var(--text-primary)]">
                        {winningSide === "UP" && "UP WINS"}
                        {winningSide === "DOWN" && "DOWN WINS"}
                        {winningSide === "NONE" && "TIE — REFUNDS"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Pool Distribution */}
              <div className="clean-card p-8">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Pool Distribution
                </p>
                <p className="text-4xl font-light text-[var(--text-primary)] mb-8">
                  {totalPool.toFixed(4)} ETH
                </p>

                <div className="divider mb-8"></div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-[var(--accent-green)] uppercase tracking-wider">
                        UP
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {parseFloat(totalUpBet).toFixed(4)} ETH ({upPercentage}
                        %)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[var(--border-primary)]">
                      <div
                        className="h-1 bg-[var(--accent-green)] transition-all duration-500"
                        style={{ width: `${upPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-[var(--accent-red)] uppercase tracking-wider">
                        DOWN
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {parseFloat(totalDownBet).toFixed(4)} ETH (
                        {downPercentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[var(--border-primary)]">
                      <div
                        className="h-1 bg-[var(--accent-red)] transition-all duration-500"
                        style={{ width: `${downPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Betting Panel */}
              <div className="clean-card p-8">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-6">
                  Place Bet
                </p>

                <div className="mb-6">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    disabled={
                      !marketOpened ||
                      marketResolved ||
                      Date.now() / 1000 >= bettingDeadline ||
                      txPending
                    }
                    className="w-full px-4 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-lg font-light focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-30 transition-colors"
                    placeholder="0.001"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mb-8">
                  {["0.001", "0.01", "0.05", "0.1"].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={!marketOpened || marketResolved || txPending}
                      className="px-4 py-2 text-xs uppercase tracking-wider border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-30"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={handleBetUp}
                    disabled={
                      !marketOpened ||
                      marketResolved ||
                      Date.now() / 1000 >= bettingDeadline ||
                      txPending
                    }
                    className="px-6 py-4 border border-[var(--accent-green)] text-[var(--accent-green)] text-xs uppercase tracking-wider hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {txPending ? "..." : "BET UP"}
                  </button>
                  <button
                    onClick={handleBetDown}
                    disabled={
                      !marketOpened ||
                      marketResolved ||
                      Date.now() / 1000 >= bettingDeadline ||
                      txPending
                    }
                    className="px-6 py-4 border border-[var(--accent-red)] text-[var(--accent-red)] text-xs uppercase tracking-wider hover:bg-[var(--accent-red)] hover:text-[var(--bg-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {txPending ? "..." : "BET DOWN"}
                  </button>
                </div>

                {(parseFloat(userUpBet) > 0 || parseFloat(userDownBet) > 0) && (
                  <>
                    <div className="divider mb-6"></div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                        Your Bets
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-[var(--border-primary)]">
                          <p className="text-xs uppercase tracking-wider text-[var(--accent-green)] mb-2">
                            UP
                          </p>
                          <p className="text-lg font-light text-[var(--text-primary)]">
                            {parseFloat(userUpBet).toFixed(4)} ETH
                          </p>
                        </div>
                        <div className="p-4 border border-[var(--border-primary)]">
                          <p className="text-xs uppercase tracking-wider text-[var(--accent-red)] mb-2">
                            DOWN
                          </p>
                          <p className="text-lg font-light text-[var(--text-primary)]">
                            {parseFloat(userDownBet).toFixed(4)} ETH
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Rewards */}
              <div className="clean-card p-8">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Prize Pool
                </p>
                <p className="text-4xl font-light text-[var(--text-primary)] mb-8">
                  {parseFloat(contractBalance).toFixed(4)} ETH
                </p>

                {canClaim && (
                  <button
                    onClick={handleClaim}
                    disabled={txPending}
                    className="w-full btn-clean-filled text-xs"
                  >
                    {txPending ? "Claiming..." : "Claim Rewards —"}
                  </button>
                )}

                {userClaimed && (
                  <div className="p-4 border border-[var(--accent-green)]">
                    <p className="text-xs uppercase tracking-wider text-[var(--accent-green)] text-center">
                      Rewards Claimed
                    </p>
                  </div>
                )}
              </div>

              {/* Admin */}
              {isOwner && (
                <div className="clean-card p-8 border-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-6">
                    Admin Controls
                  </p>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="number"
                        id="duration"
                        defaultValue="300"
                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-30 transition-colors"
                        disabled={marketOpened && !marketResolved}
                        placeholder="Duration (seconds)"
                      />
                    </div>

                    <button
                      onClick={() => {
                        const duration = (
                          document.getElementById(
                            "duration"
                          ) as HTMLInputElement
                        )?.value;
                        handleOpenMarket(Number(duration) || 300);
                      }}
                      disabled={
                        (marketOpened && !marketResolved) ||
                        txPending ||
                        !contract
                      }
                      className="w-full btn-clean text-xs"
                    >
                      Open Market —
                    </button>

                    <button
                      onClick={handleResolveMarket}
                      disabled={
                        !marketOpened ||
                        marketResolved ||
                        Date.now() / 1000 < bettingDeadline ||
                        txPending ||
                        !contract
                      }
                      className="w-full btn-clean text-xs"
                    >
                      Resolve Market —
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Chart */}
            <div className="lg:sticky lg:top-24 h-fit">
              <LivePriceChart
                startPrice={startPrice}
                endPrice={endPrice}
                marketResolved={marketResolved}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
