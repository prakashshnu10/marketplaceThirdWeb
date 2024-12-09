# Aliemon TCG Frontend Application

This repository contains the **complete frontend application** for the **Aliemon TCG** project, built using the **Thirdweb SDK**. The app provides a seamless interface for managing NFTs, opening packs, and exploring a marketplace.

---

## Features

- **Wallet Integration**: Easy wallet connections (e.g., MetaMask).
- **NFT Showcase**: Dynamic display of user-owned NFTs with rich visuals.
- **Pack Interaction**: Purchase and open packs to unlock new cards.
- **Marketplace**: Browse, buy, and sell cards and packs with ease.
- **Responsive Design**: Built with **Tailwind CSS** for mobile and desktop compatibility.

---

## Tech Stack

- **React** (Frontend Framework)
- **Next.js** (Routing and SSR)
- **Thirdweb SDK** (Blockchain Integration)
- **Tailwind CSS** (Styling)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thirdweb-example/aliemon-tcg-complete-project
   cd aliemon-tcg-complete-project
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the root directory and add:
   ```bash
   NEXT_PUBLIC_TEMPLATE_CLIENT_ID=""
   THIRDWEB_SECRET_KEY=""
   PRIVATE_KEY=""
   ```

4. **Add contract addresses:**  
   In `src/const/addresses.ts`, configure the contract addresses:
   ```typescript
   export const PACK_CONTRACT_ADDRESS = "";
   export const CARD_CONTRACT_ADDRESS = "";
   export const MARKET_CONTRACT_ADDRESS = "";
   ```

5. **Configure IPFS domains:**  
   In `next.config.mjs`, add IPFS and external configuration:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
     webpack: (config) => {
       config.externals.push("pino-pretty", "lokijs", "encoding");
       return config;
     },
     images: {
       domains: ["ipfs.io", "exampleID.ipfscdn.io"],
     },
   };

   export default nextConfig;
   ```

6. **Run the development server:**
   ```bash
   yarn dev
   ```

---

## Usage

1. **Connect Wallet:** Log in with a blockchain wallet to access features.
2. **Browse NFTs:** View your collection and interact with your cards.
3. **Open Packs:** Redeem packs to unlock new Aliemon cards.
4. **Marketplace:** Trade cards and packs using the marketplace interface.

---

## Purpose

This completed application provides a robust framework for blockchain-powered gaming using **Thirdweb SDK**. It is fully functional and designed for further customization and expansion.