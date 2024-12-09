/** @type {import('next').NextConfig} */
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: ["ipfs.io", "exampleID.ipfscdn.io"],
    domains: [
      "d391b93f5f62d9c15f67142e43841acc.ipfscdn.io", // Add this hostname
      "ipfs.io", // Include other IPFS gateways if needed
    ],
    domains: ['d391b93f5f62d9c15f67142e43841acc.ipfscdn.io'],
  },
};

export default nextConfig;
