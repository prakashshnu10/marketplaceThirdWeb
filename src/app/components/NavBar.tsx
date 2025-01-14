"use client";

import { client } from "../client";
import { useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";

import Link from "next/link";
import Image from "next/image";
import { baseSepolia, sepolia } from "thirdweb/chains";

export default function Navbar() {
  const walletInfo = useActiveWallet();
  
  return (
    <nav className="bg-background mb-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              
              <span className="ml-2 text-xl font-bold text-foreground ">
                Tradible
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {walletInfo && (
              <Link href="/shop" className="flex items-center text-white">
                {/* SVG Shop Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3a1 1 0 000 2h2.28l.354 1.06L7.42 11.5a3.75 3.75 0 00-1.16 2.64V16a1 1 0 001 1h12a1 1 0 001-1v-1.86a3.75 3.75 0 00-1.16-2.64l-1.786-5.44L18.72 5H21a1 1 0 100-2H6a1 1 0 00-.98.8L3 3zM7.694 13.34a1.75 1.75 0 00-.44.86h10.492a1.75 1.75 0 00-.44-.86l-1.786-5.44H9.48l-1.786 5.44zm.52 5.16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10.572 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                </svg>
                <span >Marketplace</span>
              </Link>
            )}
            {walletInfo && (
              <Link href="/profile" className="flex items-center text-white">
                {/* SVG Profile Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a3 3 0 100 6 3 3 0 000-6zM4 9a6 6 0 1112 0A6 6 0 014 9zm12 7a5 5 0 00-10 0h10z"
                    clipRule="evenodd"
                  />
                </svg>
                <span >Profile</span>
              </Link>
            )}
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Aliemon TCG",
                url: "https://aliemon.eth",
              }}
              connectButton={{
                label: "Connect Wallet",
                className: "",
              }}
              chain={baseSepolia}
              accountAbstraction={{
                chain: baseSepolia,
                sponsorGas: true,
              }}
              
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
