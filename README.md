# Prediction Market (Next.js)

A minimal on-chain prediction market interface built with Next.js and Chainlink Price Feeds. The application displays a live ETH/USD chart using real data from the Chainlink Aggregator contract and provides a modular UI for prediction market interactions.

## Features

- Live ETH/USD price pulled directly from Chainlink (`latestRoundData`)
- Rolling 20-minute chart, updated every 2 minutes
- Prefilled initial chart history for clean initial rendering
- Modular components for prediction flows
- Typed blockchain reads using TypeScript and viem

## Tech Stack

Next.js (App Router), TypeScript, viem, Recharts.

## Environment Setup

Create a `.env.local` file:

NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/
<YOUR_KEY>
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CHAINLINK_ETHUSD_ADDRESS=0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419

## Getting Started

Install dependencies:

npm install

Start the development server:

npm run dev

Open `http://localhost:3000` in a browser.

## Project Structure

src/
└─ abi/
├─ AggregatorV3Interface.json
├─ SimplePredictionMarket.json
└─ components/
├─ LivePriceChart.tsx
├─ MarketCard.tsx
├─ BetPanel.tsx
├─ ResultPanel.tsx
└─ WalletButton.tsx
app/
├─ layout.tsx
├─ page.tsx
└─ globals.css

## Chainlink Price Feed (Core Logic)

const result = await client.readContract({
address: process.env.NEXT_PUBLIC_CHAINLINK_ETHUSD_ADDRESS as 0x${string},
abi: AggregatorV3Interface,
functionName: "latestRoundData",
});

const price = Number(result[1]) / 1e8;

## Deployment

npm run build
npm run start

## License

MIT
