"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion"; // Import framer-motion
import { useActiveWallet } from "thirdweb/react";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { defineChain, getContract, sendTransaction, getUser, createThirdwebClient } from "thirdweb";
// import { client } from "../client";
import { MARKET_CONTRACT_ADDRESS } from "../const/addresses";
import { buyFromListing } from "thirdweb/extensions/marketplace";
type Listing = {
  asset: {
    metadata: {
      name: string;
      image: string;
      description: string;
    };
    supply: bigint;
  };
  currencyValuePerToken: {
    displayValue: string;
  };
};
export default function Shop() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const walletInfo = useActiveWallet();
  const account = useActiveAccount();
  const chain = defineChain(walletInfo?.getChain()?.id ?? 11155111);
  
  const client = createThirdwebClient({
    clientId: 'b217676c33d542c07d2a747ab2e20182',
    secretKey: 'Wx5OjlMwPkPDldOiPNQnV3ec2dtavWlE5_ZQAeIKPommOWYaC4A8UT1-Zr8r1AS_FnBoob_ETW6prI2D_eorMA'
  });
  
  const market = getContract({
    address: MARKET_CONTRACT_ADDRESS,
    chain,
    client,
  });
  



  useEffect(() => {
    const fetchValidListings = async () => {
      try {
        const user = await getUser({
          client,
          walletAddress: account?.address || "",
        });

        console.log('user_wallet: ', user)
        const lists = await getAllValidListings({
          contract: market,
          start: 0,
          count: BigInt(10),
        });
        console.log(lists)
        setListings(lists);
      } catch (error) {
        console.error("Error fetching valid listings:", error);
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    };
    fetchValidListings();
  }, [market]);
  const formatIpfsUrl = (url: string) => {
    return "ipfs://QmVsefCnYWEcEm2v36ZLF6LWQ4as5BHpLbUbpM6671p1f7/10.jpg";
  };
  const buyNFtT = async (listingId: number) => {
    const transaction = await buyFromListing({
      contract: market,
      listingId: BigInt(listingId),
      quantity: 1n,
      recipient: account?.address || "",
    });
    if (!account) {
      console.error("Account not found");
      return;
    }
    await sendTransaction({
      transaction,
      account: account,
    });
  };
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Tradible Marketplace
      </h1>
      {isLoading ? (
        <div>
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut", repeat: Infinity }}
          >
            <motion.div
              className="border-t-4 border-blue-500 rounded-full w-16 h-16"
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold mb-8 text-center">
            Loading Lists ...
          </h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full max-w-xs"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative h-80 w-full">
                <img
                  src={listing.asset.metadata.image}
                  alt={listing.asset.metadata.name}
                />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <h2 className="text-xl mb-2 text-black">
                  {listing.asset.metadata.name}
                </h2>
                <p className="text-gray-600 text-sm mb-2 h-10 overflow-y-auto">
                  {listing.asset.metadata.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">
                    Amount left: {listing.quantity.toString()}
                  </span>
                  <span className="font-bold text-green-600">
                    {listing.currencyValuePerToken.displayValue} ETH
                  </span>
                </div>
                {!account ? (
                  <p>Please Connect Wallet</p>
                ) : (
                  <button
                    onClick={buyNFtT.bind(null, listing.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}