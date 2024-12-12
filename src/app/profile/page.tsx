"use client";

import { useEffect, useRef, useState } from "react";
import { useActiveWallet } from "thirdweb/react";
import { CARD_CONTRACT_ADDRESS, PACK_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS } from "../const/addresses";
import { defineChain, getContract, sendTransaction, sendAndConfirmTransaction } from "thirdweb";
import Image from "next/image";
import { client } from "../client";
import { motion, AnimatePresence } from "framer-motion";
import { openPack } from "thirdweb/extensions/pack";
import { useActiveAccount } from "thirdweb/react";
import { getNFTs, getOwnedNFTs as getOwnedERC1155NFTs, isApprovedForAll, setApprovalForAll  } from "thirdweb/extensions/erc1155";
import { getOwnedNFTs as getOwnedERC721NFTs } from "thirdweb/extensions/erc721";
import { getOwnedERC721s } from "../getOwnedERC721s"; // Path to the custom extension
import { createListing } from "thirdweb/extensions/marketplace";
import { sepolia } from "thirdweb/chains";



// Define a type for the NFT metadata structure
type NFT = {
  id: bigint
  metadata: {
    image: string;
    name: string;
    description: string;
    attributes: {
      trait_type: string;
      value: string | number;
    }[];
  };
  quantityOwned: string;
  supply: string;
};

export default function Profile() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [activeTab, setActiveTab] = useState("NFTs");
  const walletInfo = useActiveWallet();
  const chain = defineChain(11155111);
  const walletAddress = walletInfo?.getAccount()?.address ?? "0x";
  const account = useActiveAccount();

  console.log('Chain :', chain)

  const [price, setPrice] = useState('');
  const handlePriceChange = (e:any) => {
    setPrice(e.target.value);
    console.log(price)
  };


  const cardsContract = getContract({
    address: CARD_CONTRACT_ADDRESS,
    chain,
    client,
  }); 

  const packsContract = getContract({
    address: PACK_CONTRACT_ADDRESS,
    chain,
    client,
  });

  const marketContract = getContract({
    address: MARKET_CONTRACT_ADDRESS,
    chain,
    client,
  });
  useEffect(() => {
    if (walletAddress !== "0x") {
      const fetchNfts = async () => {
        try {
          // Fetch ERC721 NFTs (Cards)
          const fetchedNFTs = await getOwnedERC721s({
            contract: cardsContract,
            owner: walletAddress,
          });

          console.log(fetchedNFTs)

          // Fetch ERC1155 NFTs (Packs)
          const fetchedPacks = await getOwnedERC1155NFTs({
            contract: packsContract,
            start: 0,
            count: 10,
            address: walletAddress,
          });

          setNfts(fetchedNFTs);
          setPacks(fetchedPacks);
          console.log('Drops: ', fetchedPacks)
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNfts();
    }
  }, [walletAddress]);

  const formatIpfsUrl = (url: string) => {
    return `https://d391b93f5f62d9c15f67142e43841acc.ipfscdn.io/ipfs/${url}`;
  };

  const handleCardClick = (nft: NFT) => {
    setSelectedNft(nft);
  };

  const handleClose = () => {
    setSelectedNft(null);
  };

  
  const directListing = async (nft: NFT) => {
    try {
      // Ensure the NFT is selected
      setSelectedNft(nft); 
      console.log("Selected NFT:", nft);
      console.log("Token Id:",  nft.id.toString());

      // if (nfts.length === 0) {
      //   console.error("No NFT provided for listing.");
      //   return;
      // }
  
      // const nft = nfts[0]; // Get the first NFT
      // setSelectedNft(nft);
      // console.log("Selected NFT:", nft);
      // console.log("Token NFT:", nft.id);


  
      // Ensure account is defined
      if (!account) {
        console.error("Account is undefined. Please ensure the user is logged in.");
        return;
      }
  
      // Retrieve contract
      const contract = getContract({
        client, // Assuming you have a thirdweb client configured
        chain, // Replace with your blockchain chain ID
        address: "0xCCaaD0C9C3c0E1218aa3344531aDAC318d9484aB", // Use NFT contract address or default
      });

      console.log('account :', account)


      
      // Check if the Account is approved

      const isApproved = await isApprovedForAll({
        contract: cardsContract,
        owner: account.address,
        operator: MARKET_CONTRACT_ADDRESS,
      });

      console.log("Account is approved");

      if (!isApproved) {
        const transaction = setApprovalForAll({
          contract: cardsContract,
          operator: MARKET_CONTRACT_ADDRESS,
          approved: true,
        });

        const approvalData = await sendAndConfirmTransaction({
          transaction,
          account,
        });

        console.log(`Approval Transaction hash: ${approvalData.transactionHash}`);
      }
    
      // Create a listing
      const transaction = await createListing({
        contract, // Pass the contract object
        assetContractAddress: "0xCe333e323fBF82D2173813002741050dfCE09005", // NFT contract address
        tokenId: BigInt(nft.id), // Use NFT's token ID or default
        pricePerToken: price, // Fixed price for now
        currencyContractAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

      });

  
      console.log("Transaction created:", transaction);
      // Send transaction
      await sendTransaction({
        transaction,
        account, // Ensure account is defined
      });
  
      console.log("Transaction sent successfully.");
    } catch (error) {
      console.error("Error in directListing:", error);
    }
  };
  

  const openNewPack = async (packId: number) => {
    const transaction = await openPack({
      contract: packsContract,
      packId: BigInt(packId),
      amountToOpen: BigInt(1),
      overrides: {},
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
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Collection</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("NFTs")}
          className={`px-4 py-2 rounded-lg ${activeTab === "NFTs" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          NFTs
        </button>
        <button
          onClick={() => setActiveTab("Packs")}
          className={`px-4 py-2 rounded-lg ${activeTab === "Packs" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Packs
        </button>
      </div>

      {activeTab === "NFTs" && (
        <div>
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
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </motion.div>
              <h1 className="text-3xl font-bold mb-8 text-center">Loading Lists ...</h1>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {nfts.map((nft, index) => (
                <motion.div
                  key={index}
                  className="bg-transparent rounded-lg shadow-md overflow-hidden flex flex-col w-72 h-[400px] cursor-pointer"
                  onClick={() => handleCardClick(nft)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative h-80 w-full">
                  <img
                  src={nft.metadata.image}
                  alt={nft.metadata.name}
                  />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Packs" && (
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
            {packs.map((pack, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full w-full"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative h-80 w-full">
                  <img
                    src="https://i.seadn.io/gae/ejPj_Qj7_CZcnvWsQICchp6CZ1au2TmAs2ka6LxLJYqOsYne1JLD0uME3vnXtdXzb2YBqQM6AlWRO8dbgnVOhyaXKrv0K-LKVkr2IHs?auto=format&dpr=1&w=1000"
                    alt={pack.metadata.name}
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h2 className="text-xl mb-2 text-black">{pack.metadata.name}</h2>
                  <p className="text-gray-600 text-sm mb-2 h-10 overflow-y-auto">{pack.metadata.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">
                      Amount Owned: {pack.quantityOwned} / {pack.supply}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewPack(pack.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    Open Pack
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedNft && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-96 h-[80%] overflow-y-auto"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedNft.metadata.name}</h2>
              <div className="relative mb-4">
                <img
                  src={selectedNft.metadata.image}
                  alt={selectedNft.metadata.name}
                  width={288}
                  height={320}
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
              <p className="text-gray-700 mb-4">{selectedNft.metadata.description}</p>
              <ul className="text-sm text-gray-500">
                {selectedNft.metadata.attributes.map((attribute, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{attribute.trait_type}</span>
                    <span>{attribute.value}</span>
                  </li>
                ))}
              </ul>
              

              <input
                style={{color:'black'}}
                value={price}
                onChange={handlePriceChange}
                placeholder="Enter price"
              />
              <button
                onClick={() => directListing(selectedNft)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                List On Marketplace
              </button>
              <button
                onClick={handleClose}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
