"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion"; 
import { useActiveWallet, useWalletBalance } from "thirdweb/react";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { defineChain, getContract, sendTransaction, getUser, createThirdwebClient } from "thirdweb";
import { CARD_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../const/addresses";
import { buyFromListing, makeOffer } from "thirdweb/extensions/marketplace";
import { approve } from "thirdweb/extensions/erc20";

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
  tokenId: number
};

export default function Shop() {
  
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const walletInfo = useActiveWallet();
  const account = useActiveAccount();
  const chain = defineChain(11155111);

  const client = createThirdwebClient({
    clientId: 'b217676c33d542c07d2a747ab2e20182',
    secretKey: 'Wx5OjlMwPkPDldOiPNQnV3ec2dtavWlE5_ZQAeIKPommOWYaC4A8UT1-Zr8r1AS_FnBoob_ETW6prI2D_eorMA'
  });

  const [price, setPrice] = useState('');
  const handlePriceChange = (e:any) => {
    setPrice(e.target.value);
    console.log(price)
  };

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

        console.log('user_wallet: ', user);

        const lists = await getAllValidListings({
          contract: market,
          start: 0
        });
        console.log(lists);
        console.log('Listing : ', lists[7].tokenId)
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

  const approveUSDC = async () => {
    if (!account) {
      console.error("Account not found");
      return;
    }
  
    const usdcContract = getContract({
      address: USDC_CONTRACT_ADDRESS,
      chain,
      client,
    });
  
    try {
      console.log("Approving USDC for marketplace...");
      const amountToApprove = "2000000000000000000"; // Example: 1 USDC (18 decimals)

      const transaction = await approve({
        contract: usdcContract,
        spender: MARKET_CONTRACT_ADDRESS,
        amount: amountToApprove,
      });

      await sendTransaction({ transaction, account });
      console.log("Approved amount for marketplace");
    } catch (error) {
      console.error("Error during USDC approval:", error);
    }
  };

  const makeOfferNFT = async (listingId: number) => {

    try{
      if (!account) {
        console.error("Account not found");
        return;
      }
  
      const transaction = makeOffer({
        contract:market,
        assetContractAddress: CARD_CONTRACT_ADDRESS,
        tokenId: BigInt(listingId),
        currencyContractAddress:
          "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        offerExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        totalOffer: price,
      });
  
      const gasPrice = BigInt(34000000000);
  
  
      // Prepare the transaction and add the custom gas price
      const tx = await sendTransaction({
        transaction: {
          ...transaction, // Spread existing transaction properties
          gasPrice: gasPrice, // Set the custom gas price (in Wei)
        },
        account,
      });

      console.log('Buying NFT Process Completed --->');

    } catch(error){
      console.error("Error during NFT purchase:", error);
    }

  }

  const buyNFT = async (listingId: number) => {
    console.log('Buying NFT Process Started --->');

    if (!account) {
      console.error("Account not found");
      return;
    }

    try {
      // Ensure the user has approved USDC for spending
      await approveUSDC();

      const transaction = await buyFromListing({
        contract: market,
        listingId: BigInt(listingId),
        quantity: 1n,
        recipient: account?.address || "",

      });

      const gasPrice = BigInt(34000000000);


      // Prepare the transaction and add the custom gas price
      const tx = await sendTransaction({
        transaction: {
          ...transaction, // Spread existing transaction properties
          gasPrice: gasPrice, // Set the custom gas price (in Wei)
        },
        account,
      });

      console.log('Buying NFT Process Completed --->');
    } catch (error) {
      
      console.error("Error during NFT purchase:", error);
    }
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
            Loading Listings ...
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
                    {listing.currencyValuePerToken.displayValue} USDC
                  </span>
                </div>
                {!account ? (
                  <p>Please Connect Wallet</p>
                ) : (
<>
                  
                  <button
                    onClick={buyNFT.bind(null, listing.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    Buy Now
                  </button>

                    
                    
                    
                    
                    
                    </>

                    



                )}

                
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
