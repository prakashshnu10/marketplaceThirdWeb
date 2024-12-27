"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BuyDirectListingButton, PayEmbed, ThirdwebProvider, TransactionButton, useActiveWallet, useSendTransaction, useWalletBalance } from "thirdweb/react";
import { createListing, getAllValidListings, newSaleEvent } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { defineChain, getContract, sendTransaction, getUser, createThirdwebClient, getContractEvents, prepareEvent, eth_gasPrice, getRpcClient, eth_estimateGas, prepareTransaction, toSerializableTransaction, readContract, sendAndConfirmTransaction, eth_getTransactionByHash, eth_getTransactionReceipt, eth_getBlockByHash, eth_getBlockByNumber, waitForReceipt } from "thirdweb";
import { CARD_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, PACK_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../const/addresses";
import { buyFromListing, makeOffer } from "thirdweb/extensions/marketplace";
import { approve } from "thirdweb/extensions/erc20";
import { price } from "thirdweb/extensions/farcaster/bundler";
import { getAll, } from "thirdweb/extensions/thirdweb";
import { ethers } from "ethers";
import { getBlock, ThirdwebSDK } from "@thirdweb-dev/react";
import { getNFT } from "thirdweb/extensions/erc1155";
import { getNFT as getNFTDrop, getNFTs } from "thirdweb/extensions/erc721";
import { createWallet } from "thirdweb/wallets";
import { baseSepolia } from "thirdweb/chains";







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

  // const provider = new ethers.providers.JsonRpcProvider("https://11155111.rpc.thirdweb.com");
  // const sdk = new ThirdwebSDK(provider);

      // Define the ABI for the NewSale event
    const marketplaceABI = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "listingCreator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "listingId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "assetContract",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "quantityBought",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalPricePaid",
            "type": "uint256"
          }
        ],
        "name": "NewSale",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "offeror",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "offerId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "assetContract",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "quantityBought",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalPricePaid",
            "type": "uint256"
          }
        ],
        "name": "AcceptedOffer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "offeror",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "offerId",
            "type": "uint256"
          }
        ],
        "name": "CancelledOffer",
        "type": "event"
      },

      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "offeror",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "offerId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "assetContract",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "offerId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "totalPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "expirationTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "offeror",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "assetContract",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "currency",
                "type": "address"
              },
              {
                "internalType": "enum IOffers.TokenType",
                "name": "tokenType",
                "type": "uint8"
              },
              {
                "internalType": "enum IOffers.Status",
                "name": "status",
                "type": "uint8"
              }
            ],
            "indexed": false,
            "internalType": "struct IOffers.Offer",
            "name": "offer",
            "type": "tuple"
          }
        ],
        "name": "NewOffer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "listingCreator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "listingId",
            "type": "uint256"
          }
        ],
        "name": "CancelledListing",
        "type": "event"
      }
      
    ];

  const mintingABI = [

    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    }
  ]

  const PackABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "packId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "opener",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "numOfPacksOpened",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "assetContract",
              "type": "address"
            },
            {
              "internalType": "enum ITokenBundle.TokenType",
              "name": "tokenType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalAmount",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct ITokenBundle.Token[]",
          "name": "rewardUnitsDistributed",
          "type": "tuple[]"
        }
      ],
      "name": "PackOpened",
      "type": "event"
    }
  ]

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const walletInfo = useActiveWallet();
  const account = useActiveAccount();
  const chain = defineChain(84532); // base
  // const chain = defineChain(11155111);

  // const client = createThirdwebClient({
  //   clientId: 'b217676c33d542c07d2a747ab2e20182',
  //   secretKey: 'Wx5OjlMwPkPDldOiPNQnV3ec2dtavWlE5_ZQAeIKPommOWYaC4A8UT1-Zr8r1AS_FnBoob_ETW6prI2D_eorMA'
  // });


  const client = createThirdwebClient({
    clientId: '8bab9537dc62607b3a9f876b3a3ecac9',
    secretKey: 'dBV9ptWxOcj6ovwXj8Ejj_L7qvNUQTyLUdABG_iVdFZURuvvyafG_j3eICT9JEwyXQG-Bh1FXOYGpcz7hD8yGg'
  });  //base

  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const handlePriceChange = (id: string, value: string) => {
    setPrices({
      [id]: value,
    });
  };
  const { mutate: sendTx } = useSendTransaction({
    payModal: {
      supportedTokens: {
        "1": [
          {
            address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            name: "USD Coin",
            symbol: "USDC",

          },
        ],
      },
    },
  });

  const cardsContract = getContract({
    address: CARD_CONTRACT_ADDRESS,
    chain,
    client,
  });

  const market = getContract({
    address: MARKET_CONTRACT_ADDRESS,
    chain,
    client,
  });


  const pack = getContract({
    address: PACK_CONTRACT_ADDRESS,
    chain,
    client,
  });
  useEffect(() => {

    // const fetchNFTEvents = async () => {
    //   const contractAddress = CARD_CONTRACT_ADDRESS; // Replace with your NFT contract address
    //   const nftId = "25"; // Replace with your specific NFT ID
    
    //   try {
    //     // Load the NFT contract
    //     const nftContract = await sdk.getNFTCollection(contractAddress);
    //     const marketContract = await sdk.getMarketplaceV3(MARKET_CONTRACT_ADDRESS);
    
    //     // Fetch all Transfer events
    //     // const nftContarctEvents = await nftContract.events.getEvents("Transfer");
    
    //     // // Filter events by tokenId
    //     // const filteredEvents = nftContarctEvents.filter((event) => {
    //     //   const tokenId = event.data.tokenId.toString(); // Convert BigNumber to string
    //     //   return tokenId === nftId;
    //     // });
    
    //     // console.log("Filtered Events for Token ID:", nftContarctEvents);

    //     // // Log filtered events
    //     // console.log("Filtered Events for Token ID:", filteredEvents);


    //     const marketContarctEvents = await marketContract.events.getEvents("NewSale")

    //     // const filteredEvents = nftContarctEvents.filter((event) => {
    //     //   const tokenId = event.data.tokenId.toString(); // Convert BigNumber to string
    //     //   return tokenId === nftId;
    //     // });
      
    //     console.log("market ::::", marketContarctEvents);

    //   } catch (error) {
    //     console.error("Error fetching NFT events:", error);
    //   }
    // };


    // const fetchMarketplaceEvents = async () => {
    //   // Replace with your specific marketplace contract and NFT ID
    //   const nftId = "31"; // The specific NFT ID to filter (if needed)
    
    //   try {
    //     const provider = new ethers.providers.JsonRpcProvider("https://11155111.rpc.thirdweb.com"); // Replace with your RPC URL
    //     const sdk = new ThirdwebSDK("sepolia");
      
    //     const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
    //     const marketplace = await sdk.getMarketplace(marketplaceAddress);
      
    //     console.log("Marketplace loaded:", marketplace.getAddress());

        
    //     const mintingAddress = CARD_CONTRACT_ADDRESS; // Replace with your contract address
    //     const minting = await sdk.getNFTDrop(mintingAddress);

    //     console.log("Minting loaded:", minting.getAddress());


      

    //     // Fetch Past Events
    //     const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);

    //     const nftContract = await sdk.getNFTCollection(CARD_CONTRACT_ADDRESS);

    
    //     // Fetch all Transfer events
    //     const nftContarctEvents = await nftContract.events.getEvents("Transfer");
    
    //     // // Filter events by tokenId
    //     const filteredEvents = nftContarctEvents.filter((event) => {
    //       const tokenId = event.data.tokenId.toString(); // Convert BigNumber to string
    //       const fromAddress = event.data.from.toString().toLowerCase(); // Ensure consistent casing
        
    //       return tokenId === nftId && fromAddress === "0x0000000000000000000000000000000000000000";
    //     });
        
    //     // console.log("Filtered Events for Token ID:", nftContarctEvents);

    //     // // Log filtered events
    //     console.log("Filtered Events for Token ID:", filteredEvents);
      
    //     const filter = contract.filters.NewSale(); // Define a filter for the event
    //     const pastEvents = await contract.queryFilter(filter);

    //     // console.log("past Events: ", pastEvents);

    //     const filteredEventsMarket = pastEvents.filter((event) => {
    //       const tokenId = event.args?.tokenId.toString(); // Convert BigNumber to string
    //       return tokenId === nftId;
    //     });

    //     console.log("filteredEventsMarket :::: ", filteredEventsMarket);
      
    //     // filteredEventsMarket.forEach((event) => {
    //     //   console.log("Past Event Detected:");
    //     //   console.log("Buyer:", event.args?.buyer);
    //     //   console.log("Seller:", event.args?.listingCreator);
    //     //   console.log("TokenId:", event.args?.tokenId.toString());
    //     //   console.log("Price:", ethers.utils.formatEther(event.args?.totalPricePaid));
    //     // });

    //   } catch (error) {
    //     console.error("Error fetching marketplace events:", error);
    //   }
    // };


    const fetchMarketplaceActivity = async () => {
      const nftId = "31"; // The specific NFT ID to filter
    
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
        const sdk = new ThirdwebSDK("baseSepolia");
    
        const cardAddress = CARD_CONTRACT_ADDRESS; // Replace with your contract address
        const cardContract = new ethers.Contract(cardAddress, mintingABI, provider);
        const nftContarctEvents = await cardContract.events.getEvents("Transfer");
        const filteredEvents = nftContarctEvents
          .filter((event: { data: { tokenId: { toString: () => any; }; from: { toString: () => string; }; }; }) => {
            const tokenId = event.data.tokenId.toString();
            const fromAddress = event.data.from.toString().toLowerCase();
            return tokenId === nftId && fromAddress === "0x0000000000000000000000000000000000000000";
          })
          .map((event: { data: { from: any; to: any; tokenId: { toString: () => any; }; }; }) => ({
            type: "Transfer",
            from: event.data.from,
            to: event.data.to,
            tokenId: event.data.tokenId.toString(),
            price: "0", // Default price for Transfer events
          }));
    
        console.log("Filtered Transfer Events:", filteredEvents);
    
    
        // // Fetch events for "NewSale" and "AcceptedOffer"
        // const eventFilter = contract.filters.NewSale(); // Filter for "NewSale" event
        // const acceptedOfferFilter = contract.filters.AcceptedOffer(); // Filter for "AcceptedOffer" event
    
        // // Fetch all events matching the filters
        // const newSaleEvents = await contract.queryFilter(eventFilter);
        // const acceptedOfferEvents = await contract.queryFilter(acceptedOfferFilter);
    
        // // Combine the events from both filters
        // const allEvents = [...newSaleEvents, ...acceptedOfferEvents];
        // console.log("All Events:", allEvents);

        // // const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
        // const sdk = new ThirdwebSDK("baseSepolia");
    
        // // const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
        // // const marketplace = await sdk.getMarketplace(marketplaceAddress);
    
        // // console.log("Marketplace loaded:", marketplace.getAddress());
    
        // // const mintingAddress = CARD_CONTRACT_ADDRESS; // Replace with your contract address
        // // const minting = await sdk.getNFTDrop(mintingAddress);
    
        // // console.log("Minting loaded:", minting.getAddress());
    
        // // Fetch all Transfer events
        // const nftContract = await sdk.getNFTCollection(CARD_CONTRACT_ADDRESS);
        // const nftContarctEvents = await nftContract.events.getEvents("Transfer");
    
        // // Filter events by tokenId and 'from' address
        // const filteredEvents = nftContarctEvents
        //   .filter((event) => {
        //     const tokenId = event.data.tokenId.toString();
        //     const fromAddress = event.data.from.toString().toLowerCase();
        //     return tokenId === nftId && fromAddress === "0x0000000000000000000000000000000000000000";
        //   })
        //   .map((event) => ({
        //     type: "Transfer",
        //     from: event.data.from,
        //     to: event.data.to,
        //     tokenId: event.data.tokenId.toString(),
        //     price: "0", // Default price for Transfer events
        //   }));
    
        // console.log("Filtered Transfer Events:", filteredEvents);
    
        // // Fetch all NewSale events
        // const contract = new ethers.Contract(marketplaceAddress, marketplaceABI);
        // const filter = contract.filters.NewSale();
        // const pastEvents = await contract.queryFilter(filter);
    
        // const filteredEventsMarket = pastEvents
        //   .filter((event) => {
        //     const tokenId = event.args?.tokenId.toString();
        //     return tokenId === nftId;
        //   })
        //   .map((event) => ({
        //     type: "NewSale",
        //     buyer: event.args?.buyer,
        //     seller: event.args?.listingCreator,
        //     tokenId: event.args?.tokenId.toString(),
        //     price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
        //   }));
    
        // console.log("Filtered Market Events:", filteredEventsMarket);
    
        // // Combine both filtered events into one object
        // const combinedEvents = {
        //   transferEvents: filteredEvents,
        //   marketEvents: filteredEventsMarket,
        // };
    
        console.log("Combined Events Object:", filteredEvents);
    
        return filteredEvents; // Return or use the object as needed
      } catch (error) {
        console.error("Error fetching marketplace events:", error);
      }
    };


    const fetchSoldItem = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
        const sdk = new ThirdwebSDK("baseSepolia");
    
        const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
        const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
    
        // Fetch events for "NewSale" and "AcceptedOffer"
        const eventFilter = contract.filters.NewSale(); // Filter for "NewSale" event
        const acceptedOfferFilter = contract.filters.AcceptedOffer(); // Filter for "AcceptedOffer" event
        const cancelListingFilter = contract.filters.CancelledListing(); // Filter for "AcceptedOffer" event

    
        // Fetch all events matching the filters
        const newSaleEvents = await contract.queryFilter(eventFilter);
        const acceptedOfferEvents = await contract.queryFilter(acceptedOfferFilter);
        const cancelListingEvents =  await contract.queryFilter(cancelListingFilter);
    
        // Combine the events from both filters
        const allEvents = [...newSaleEvents, ...acceptedOfferEvents, ...cancelListingEvents];
        console.log("All Events:", allEvents);
        
        interface CombinedData {
          packData?: any;  // Replace `any` with the appropriate type for packData
          nftData?: any;   // Replace `any` with the appropriate type for nftData
        }

        // Get packData for the given packId
      // Get packData for the given packId
        const packData = await getNFTs({
          contract: cardsContract
        });

        // Initialize combinedData outside of the loop
        let combinedData: CombinedData = {};

        // Extract tokenIds and totalPricePaid from events and create a map
        const eventDataMap = new Map<string, string>();

        allEvents.forEach((event) => {
          if (event.args && event.args.length >= 7) {
            const tokenId = event.args.tokenId ? event.args.tokenId.toString() : "N/A";
            const totalPricePaid = event.args.totalPricePaid ? ethers.utils.formatUnits(event.args.totalPricePaid, "ether") : "0";

            // Store the tokenId and totalPricePaid in the map
            eventDataMap.set(tokenId, totalPricePaid);

            // Log or process the extracted data
            console.log(`Token ID: ${tokenId}, Total Price Paid: ${totalPricePaid} ETH`);
          }
        });

        // Filter packData to include only NFTs that are present in events
        const filteredPackData = packData
          .filter(nft => eventDataMap.has(nft.id.toString()))  // Using nft.id (bigint) instead of tokenId
          .map(nft => ({
            ...nft,
            totalPricePaid: eventDataMap.get(nft.id.toString()) // Add the totalPricePaid to the NFT
          }));

        // Log the filtered packData with totalPricePaid (optional)
        console.log(filteredPackData);

        // Add filtered packData to the combinedData dictionary
        combinedData.packData = filteredPackData;

        // Optionally log the combined data after the loop
        console.log('combinedData :::', combinedData);

      } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
      }
    };
    
    

    const fetchRecentlyRevealed = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
        const sdk = new ThirdwebSDK("baseSepolia");
    
        const marketplaceAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
        const contract = new ethers.Contract(marketplaceAddress, PackABI, provider);
    

        const filter = contract.filters.PackOpened();

        // Fetch all past events
        const allEvents = await contract.queryFilter(filter); // Empty filter to fetch all events
        console.log("All Events:", allEvents);
    
        // Optional: Format events for better readability
        const formattedEvents = allEvents.map((event) => ({
          eventName: event.event,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        }));


        interface CombinedData {
          packData?: any;  // Replace `any` with the appropriate type for packData
          nftData?: any;   // Replace `any` with the appropriate type for nftData
          timeData?: any;
        }
        
        formattedEvents.forEach(async (event, index) => {
          console.log(`Event ${index + 1}:`, event);
        
          // Extract args from the event
          const args = event.args;

          console.log("event --> ", event)
        
          if (args) {
            // Extract packId and tokenId
            const packId = args.packId ? args.packId.toString() : "N/A";
            const rewardUnits = args.rewardUnitsDistributed || [];
            const tokenId = rewardUnits.length > 0 && rewardUnits[0]?.tokenId ? rewardUnits[0].tokenId.toString() : "N/A";
            const blockNum = event.blockNumber;
        
            console.log(`Pack ID: ${packId}`);
            console.log(`Token ID: ${tokenId}`);
            console.log( `Block Number: ${blockNum}`);
        
            if (packId !== "N/A") {
              try {
                // Create an empty dictionary (with defined type) to store the combined data
                let combinedData: CombinedData = {};
        
                // Get packData for the given packId
                const packData = await getNFT({
                  contract: pack,
                  tokenId: packId,
                });
                console.log(`URI for Pack ID ${packId}:`, packData);
        
                // Add packData to the combinedData dictionary
                combinedData.packData = packData;
        
                // Get nftData for the given tokenId
                const nftData = await getNFTDrop({
                  contract: cardsContract,
                  tokenId: tokenId,
                });
                console.log(`URI for Token ID ${tokenId}:`, nftData);
        
                // Add nftData to the combinedData dictionary
                combinedData.nftData = nftData;
        

                const rpcRequest = getRpcClient({ client, chain });
                // const transactionInfo = await eth_getTransactionReceipt(rpcRequest, {
                //   hash: "0x0b2840d3e59a59977c2d00f841d22c7240c1ae427b9690d4bed3dd3fca24a0f0",
                // });


                const block = await eth_getBlockByNumber(rpcRequest, {
                  blockNumber: BigInt(blockNum),
                  includeTransactions: true,
                });
                

                // console.log("Transaction Details :::: ", block);

                    // Calculate time ago
                const transactionTimeAgo = timeAgo(block.timestamp);
                combinedData.timeData = transactionTimeAgo

                
                // Now you can log or return the combined data for each event
                console.log(`Combined Data for Event ${index + 1}:`, combinedData);
                // console.log(`Transaction happened: ${transactionTimeAgo}`);
        
              } catch (error) {
                console.error("Error reading contract:", error);
              }
            } else {
              console.log("Pack ID or Token ID is invalid.");
            }
          } else {
            console.log("No args found for this event.");
          }
        });
        
      


        console.log("Formatted Events:", formattedEvents);
        return formattedEvents;
      } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
      }
    };

    function timeAgo(blockTimestamp:any) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const blockTime = Number(blockTimestamp); // Convert BigInt timestamp to Number
      const timeDifference = currentTime - blockTime; // Time difference in seconds
    
      if (timeDifference < 60) {
        return `${timeDifference} seconds ago`;
      } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(timeDifference / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    }



    const fetchSoldItems = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
        const sdk = new ThirdwebSDK("baseSepolia");
    
        const marketplaceAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
        const contract = new ethers.Contract(marketplaceAddress, PackABI, provider);
    

        const filter = contract.filters.PackOpened();

        // Fetch all past events
        const allEvents = await contract.queryFilter(filter); // Empty filter to fetch all events
        console.log("All Events:", allEvents);
    
        // Optional: Format events for better readability
        const formattedEvents = allEvents.map((event) => ({
          eventName: event.event,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        }));

        // Get the last 4 events
        const lastFourEvents = formattedEvents.slice(-4);

        interface CombinedData {
          packData?: any;  // Replace `any` with the appropriate type for packData
          nftData?: any;   // Replace `any` with the appropriate type for nftData
        }
        
        lastFourEvents.forEach(async (event, index) => {
          console.log(`Event ${index + 1}:`, event);
        
          // Extract args from the event
          const args = event.args;
        
          if (args) {
            // Extract packId and tokenId
            const packId = args.packId ? args.packId.toString() : "N/A";
            const rewardUnits = args.rewardUnitsDistributed || [];
            const tokenId = rewardUnits.length > 0 && rewardUnits[0]?.tokenId ? rewardUnits[0].tokenId.toString() : "N/A";
        
            console.log(`Pack ID: ${packId}`);
            console.log(`Token ID: ${tokenId}`);
        
            if (packId !== "N/A") {
              try {
                // Create an empty dictionary (with defined type) to store the combined data
                let combinedData: CombinedData = {};
        
                // Get packData for the given packId
                const packData = await getNFT({
                  contract: pack,
                  tokenId: packId,
                });
                console.log(`URI for Pack ID ${packId}:`, packData);
        
                // Add packData to the combinedData dictionary
                combinedData.packData = packData;
        
                // Get nftData for the given tokenId
                const nftData = await getNFTDrop({
                  contract: cardsContract,
                  tokenId: tokenId,
                });
                console.log(`URI for Token ID ${tokenId}:`, nftData);
        
                // Add nftData to the combinedData dictionary
                combinedData.nftData = nftData;
        
                // Now you can log or return the combined data for each event
                console.log(`Combined Data for Event ${index + 1}:`, combinedData);
        
              } catch (error) {
                console.error("Error reading contract:", error);
              }
            } else {
              console.log("Pack ID or Token ID is invalid.");
            }
          } else {
            console.log("No args found for this event.");
          }
        });
        
      


        console.log("Formatted Events:", formattedEvents);
        return formattedEvents;
      } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
      }
    };
    


    // const data = await readContract({
    //   contract,
    //   method:
    //     "function uri(uint256 _tokenId) view returns (string)",
    //   params: [_tokenId],
    // });


    const fetchValidListings = async () => {
      try {
        const user = await getUser({
          client,
          walletAddress: account?.address || "",
        });

        // console.log('user_wallet: ', user);

        const lists = await getAllValidListings({
          contract: market,
          start: 0,
          
        });


        // const fees = await getUserOpGasPrice({
        //   options,
        // });
        // console.log("Gas Fee:::: ", fees)


        console.log("p",lists);
        // console.log('Listing : ', lists[7].tokenId)
        setListings(lists);


//         const rpcRequest = getRpcClient({ client, chain });
// const gasPrice = await eth_gasPrice(rpcRequest);

// console.log('gasPrice ::: ', gasPrice);

// const wei = gweiToWei(gasPrice); // Convert Gwei to Wei
// console.log(`${gasPrice} Gwei is equivalent to ${wei} Wei`);


       
 
        // fetchNFTEvents();
        // fetchMarketplaceActivity();

        // fetchUserActivityEvents();
            // Call the function
        // fetchAllEvents();

        //fetchPackEvents();
        // fetchSoldItem();
        // fetchRecentlyRevealed();
        fetchMarketplaceEvents();
        // fetchSoldItem();
        

      } catch (error) {
        console.error("Error fetching valid listings:", error);
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    };
    fetchValidListings();
  }, [market]);


  const fetchMarketplaceEvents = async () => {
    const nftId = "61"; // The specific NFT ID to filter
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/80LaiHDm2TlRUtdonyA4gjIpYAVoC24A"); // Replace with your RPC URL
      const sdk = new ThirdwebSDK(provider);
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
      const marketplace = await sdk.getMarketplace(marketplaceAddress);
      console.log("Marketplace loaded:", marketplace.getAddress());
      const mintingAddress = CARD_CONTRACT_ADDRESS; // Replace with your contract address
      const minting = await sdk.getNFTDrop(mintingAddress);
      console.log("Minting loaded:", minting.getAddress());
      // Fetch all Transfer events
      const nftContract = await sdk.getNFTCollection(CARD_CONTRACT_ADDRESS);
      const nftContarctEvents = await nftContract.events.getEvents("Transfer");
      // Filter events by tokenId and 'from' address
      const filteredEvents = nftContarctEvents
        .filter((event) => {
          const tokenId = event.data.tokenId.toString();
          const fromAddress = event.data.from.toString().toLowerCase();
          return tokenId === nftId && fromAddress === "0x0000000000000000000000000000000000000000";
        })
        .map((event) => ({
          type: "Transfer",
          from: event.data.from,
          to: event.data.to,
          tokenId: event.data.tokenId.toString(),
          price: "0", // Default price for Transfer events
        }));
      console.log("Filtered Transfer Events:", filteredEvents);
      // Fetch all NewSale events
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const filter = contract.filters.NewSale();
      const pastEvents = await contract.queryFilter(filter);
      const filteredEventsMarket = pastEvents
        .filter((event) => {
          const tokenId = event.args?.tokenId.toString();
          return tokenId === nftId;
        })
        .map((event) => ({
          type: "NewSale",
          buyer: event.args?.buyer,
          seller: event.args?.listingCreator,
          tokenId: event.args?.tokenId.toString(),
          price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
        }));
      console.log("Filtered Market Events:", filteredEventsMarket);
      // Combine both filtered events into one object
      const combinedEvents = {
        transferEvents: filteredEvents,
        marketEvents: filteredEventsMarket,
      };
      console.log("Combined Events Object:", combinedEvents);
      return combinedEvents; // Return or use the object as needed
    } catch (error) {
      console.error("Error fetching marketplace events:", error);
    }
  };

  const fetchSoldItems = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com"); // Replace with your RPC URL
      const sdk = new ThirdwebSDK("baseSepolia");
  
      const marketplaceAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
      const contract = new ethers.Contract(marketplaceAddress, PackABI, provider);
  

      const filter = contract.filters.PackOpened();

      // Fetch all past events
      const allEvents = await contract.queryFilter(filter); // Empty filter to fetch all events
      console.log("All Events:", allEvents);
  
      // Optional: Format events for better readability
      const formattedEvents = allEvents.map((event) => ({
        eventName: event.event,
        args: event.args,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      }));

      // Get the last 4 events
      const lastFourEvents = formattedEvents.slice(-4);

      interface CombinedData {
        packData?: any;  // Replace `any` with the appropriate type for packData
        nftData?: any;   // Replace `any` with the appropriate type for nftData
      }
      
      lastFourEvents.forEach(async (event, index) => {
        console.log(`Event ${index + 1}:`, event);
      
        // Extract args from the event
        const args = event.args;
      
        if (args) {
          // Extract packId and tokenId
          const packId = args.packId ? args.packId.toString() : "N/A";
          const rewardUnits = args.rewardUnitsDistributed || [];
          const tokenId = rewardUnits.length > 0 && rewardUnits[0]?.tokenId ? rewardUnits[0].tokenId.toString() : "N/A";
      
          console.log(`Pack ID: ${packId}`);
          console.log(`Token ID: ${tokenId}`);
      
          if (packId !== "N/A") {
            try {
              // Create an empty dictionary (with defined type) to store the combined data
              let combinedData: CombinedData = {};
      
              // Get packData for the given packId
              const packData = await getNFT({
                contract: pack,
                tokenId: packId,
              });
              console.log(`URI for Pack ID ${packId}:`, packData);
      
              // Add packData to the combinedData dictionary
              combinedData.packData = packData;
      
              // Get nftData for the given tokenId
              const nftData = await getNFTDrop({
                contract: cardsContract,
                tokenId: tokenId,
              });
              console.log(`URI for Token ID ${tokenId}:`, nftData);
      
              // Add nftData to the combinedData dictionary
              combinedData.nftData = nftData;
      
              // Now you can log or return the combined data for each event
              console.log(`Combined Data for Event ${index + 1}:`, combinedData);
      
            } catch (error) {
              console.error("Error reading contract:", error);
            }
          } else {
            console.log("Pack ID or Token ID is invalid.");
          }
        } else {
          console.log("No args found for this event.");
        }
      });
      
    


      console.log("Formatted Events:", formattedEvents);
      return formattedEvents;
    } catch (error) {
      console.error("Error fetching all events:", error);
      return [];
    }
  };
  

  // const fetchMarketplaceEvents = async () => {


      
  //     const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/80LaiHDm2TlRUtdonyA4gjIpYAVoC24A"); // Replace with your RPC URL
  //     const sdk = new ThirdwebSDK("baseSepolia");
          
  //     const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
  //     const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
  
  //     // Fetch events for "NewSale" and "AcceptedOffer"
  //     // const eventFilter = contract.filters.NewSale(); // Filter for "NewSale" event
  //     // const acceptedOfferFilter = contract.filters.AcceptedOffer(); // Filter for "AcceptedOffer" event
  //     const cancelListingFilter = contract.filters.CancelledListing(); // Filter for "AcceptedOffer" event

  
  //     // Fetch all events matching the filters
  //     // const newSaleEvents = await contract.queryFilter(eventFilter);
  //     // const acceptedOfferEvents = await contract.queryFilter(acceptedOfferFilter);
  //     const cancelListingEvents =  await contract.queryFilter(cancelListingFilter);
  
  //     // Combine the events from both filters
  //     const allEvents = [...cancelListingEvents];
  //     console.log("All Events:", allEvents);

  //     // Optional: Format events for better readability
  //     // const formattedEvents = allEvents.map((event) => ({
  //     //   eventName: event.event,
  //     //   args: event.args,
  //     //   blockNumber: event.blockNumber,
  //     //   transactionHash: event.transactionHash,
  //     // }));

  //     // console.log("formattedEvents Events Object:", formattedEvents);


  //     // const marketplace = await sdk.getMarketplace(marketplaceAddress);
  //     // console.log("Marketplace loaded:", marketplace.getAddress());
  //     // const mintingAddress = CARD_CONTRACT_ADDRESS; // Replace with your contract address
  //     // const minting = await sdk.getNFTDrop(mintingAddress);
  //     // console.log("Minting loaded:", minting.getAddress());
  //     // // Fetch all Transfer events
  //     // const nftContract = await sdk.getNFTCollection(CARD_CONTRACT_ADDRESS);
  //     // const nftContarctEvents = await nftContract.events.getEvents("Transfer");
  //     // // Filter events by tokenId and 'from' address
  //     // const filteredEvents = nftContarctEvents
  //     //   .filter((event) => {
  //     //     const tokenId = event.data.tokenId.toString();
  //     //     const fromAddress = event.data.from.toString().toLowerCase();
  //     //     return tokenId === nftId && fromAddress === "0x0000000000000000000000000000000000000000";
  //     //   })
  //     //   .map((event) => ({
  //     //     type: "Transfer",
  //     //     from: event.data.from,
  //     //     to: event.data.to,
  //     //     tokenId: event.data.tokenId.toString(),
  //     //     price: "0", // Default price for Transfer events
  //     //   }));
  //     // console.log("Filtered Transfer Events:", filteredEvents);
  //     // // Fetch all NewSale events
  //     // // const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
  //     // const filter = contract.filters.NewSale();
  //     // const pastEvents = await contract.queryFilter(filter);
  //     // const filteredEventsMarket = pastEvents
  //     //   .filter((event) => {
  //     //     const tokenId = event.args?.tokenId.toString();
  //     //     return tokenId === nftId;
  //     //   })
  //     //   .map((event) => ({
  //     //     type: "NewSale",
  //     //     buyer: event.args?.buyer,
  //     //     seller: event.args?.listingCreator,
  //     //     tokenId: event.args?.tokenId.toString(),
  //     //     price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
  //     //   }));
  //     // console.log("Filtered Market Events:", filteredEventsMarket);
  //     // // Combine both filtered events into one object
  //     // const combinedEvents = {
  //     //   transferEvents: filteredEvents,
  //     //   marketEvents: filteredEventsMarket,
  //     // };
 
  //     // return combinedEvents; // Return or use the object as needed
   
  // };


  // function gweiToWei(gwei) {
  //   return BigInt(gwei) * BigInt(10 ** 9);
  // }

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

      const wallet = createWallet("io.metamask");

      const accountExternal = await wallet.connect({ client });
      
      console.log("Approving USDC for marketplace...");
      const amountToApprove = "5000000000000000000"; // Example: 1 USDC (18 decimals)

      const transaction = await approve({
        contract: usdcContract,
        spender: MARKET_CONTRACT_ADDRESS,
        amount: amountToApprove,
      });

      await sendTransaction({ transaction, account: accountExternal });
      console.log("Approved amount for marketplace");
    } catch (error) {
      console.error("Error during USDC approval:", error);
    }
  };
  const makeOfferNFT = async (listingId: number, offerPrice: string) => {

    console.log('Offer NFT Process Started --->',listingId);
    try {
      if (!account) {
        console.error("Account not found");
        return;
      }

      const transaction = makeOffer({
        contract: market,
        assetContractAddress: CARD_CONTRACT_ADDRESS,
        tokenId: BigInt(listingId),
        currencyContractAddress:
          "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        offerExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        totalOffer: offerPrice,
      });

      const gasPrice = BigInt(56400000000000);


      // Prepare the transaction and add the custom gas price
      const tx = await sendTransaction({
        transaction: {
          ...transaction, // Spread existing transaction properties
          gasPrice: gasPrice, // Set the custom gas price (in Wei)
        },
        account,
      });

      console.log('Offer NFT Process Completed --->');

    } catch (error) {
      console.error("Error during offerring:", error);
    }

  }


  // const makeOfferNFT = async (listingId: number, offerPrice: string) => {
  //   console.log('Offer NFT Process Started --->', listingId);
  
  //   try {
  //     // Ensure user account is available
  //     if (!account) {
  //       console.error("Account not found");
  //       return;
  //     }
  
  //     // Create the transaction payload
  //     const transaction = makeOffer({
  //       contract: market,
  //       assetContractAddress: CARD_CONTRACT_ADDRESS,
  //       tokenId: BigInt(listingId),
  //       currencyContractAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  //       offerExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
  //       totalOffer: offerPrice,
  //     });

  //     const rpcRequest = getRpcClient({ client, chain });
  
  //     // Estimate gas for the transaction
  //     const estimatedGas = await eth_estimateGas(rpcRequest, {
  //       to: transaction.to, // The recipient address (marketplace contract)
  //       data: transaction.data, // Encoded calldata
  //       value: transaction.value || "0x0", // Offer price in wei
  //     });
  
  //     console.log(`Estimated Gas: ${estimatedGas}`);
  
  //     // Set the gas price to be 10 wei greater than the estimated gas fee
  //     const gasPrice = BigInt(estimatedGas) + BigInt(10); // Add 10 wei to the estimated gas fee
  //     console.log(`Gas Price (Estimated Gas + 10): ${gasPrice}`);
  
  //     // Prepare the transaction with the estimated gas and calculated gas price
  //     const tx = await sendTransaction({
  //       transaction: {
  //         ...transaction, // Spread existing transaction properties
  //         gasLimit: estimatedGas, // Set the estimated gas limit
  //         gasPrice: gasPrice, // Set the calculated gas price
  //       },
  //       account,
  //     });
  
  //     console.log('Offer NFT Process Completed --->', tx);
  //     return tx; // Return transaction details if needed
  //   } catch (error) {
  //     console.error("Error during offering:", error);
  //   }
  // };

  // const buyNFT = async (listingId: number) => {
  //   console.log('Buying NFT Process Started --->');

  //   if (!account) {
  //     console.error("Account not found");
  //     return;
  //   }

  //   try {

  //     const { mutate: sendTx, data: transactionResult } = useSendTransaction({
  //       payModal: {
  //         supportedTokens: {
  //           "1": [
  //             {
  //               address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  //               name: "USD Coin",
  //               symbol: "USDC"
  //             },
  //           ],
  //         },
  //       },
  //     });


  //     // await approveUSDC();


  //     const transaction = await buyFromListing({
  //       contract: market,
  //       listingId: BigInt(listingId),
  //       quantity: 1n,
  //       recipient: account?.address || "",
  //     });


  //    const gasPrice = BigInt(70000000000);

  //    const result = await sendTx(transaction);

  //    console.log("Result :::", result);




  //     // // Prepare the transaction and add the custom gas price
  //     // const tx = await sendAndConfirmTransaction({
  //     //   transaction: {
  //     //     ...transaction, // Spread existing transaction properties
  //     //     gasPrice: gasPrice, // Set the custom gas price (in Wei)
  //     //   },
  //     //   account: accountExternal,
  //     // });

  //         // Use PayEmbed for fiat integration
  //   // renderPayEmbed(transaction);

  //     // const receipt = await waitForReceipt(tx);

  //     console.log('Buying NFT Process Completed --->');
  //   } catch (error) {

  //     console.error("Error during NFT purchase:", error);
  //   }
  // };


  const buyNFT = async (listingId: number) => {
    console.log("Buying NFT Process Started --->");

    if (!account) {
        console.error("Account not found");
        return;
    }

    try {
        

        // Prepare the transaction
        const transaction = await buyFromListing({
            contract: market,
            listingId: BigInt(listingId),
            quantity: 1n,
            recipient: account?.address || "",
        });


        const result = await sendTx(transaction);


        console.log("Buying NFT Process Completed --->", result);
    } catch (error) {
        console.error("Error during NFT purchase:", error);
    }
};


// //   // Function to render PayEmbed
// // const renderPayEmbed = (transaction: any) => {
// //   return (
// //     <PayEmbed
// //       client={client}
// //       payOptions={{
// //         mode: "transaction",
// //         transaction,
// //         buyWithFiat: {
// //           testMode: true, // Enable test mode for development
// //         },
// //       }}
// //     />
// //   );
// // };

  
  
  
  

console.log("listings",listings)
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


                    

                    

                    <input
                      id={`nftInput-${listing.id}`}
                      style={{ color: 'black' }}
                      value={prices[listing.id] || ''}
                      onChange={(e: { target: { value: string; }; }) => handlePriceChange(listing.id, e.target.value)}
                      placeholder="Enter price"

                    />

                    <button
                      onClick={() => makeOfferNFT(listing.tokenId, prices[listing.id])}
                      className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Make an Offer
                    </button>


                    <TransactionButton 
                      transaction={async () => {

                        console.log("Buying NFT process started::::: ")
                        
                        if (!account) {
                          throw new Error("No wallet connected");
                        }
                        
                        const tx = await buyFromListing({
                          contract: market,
                          listingId: BigInt(listing.id),
                          quantity: 1n,
                          recipient: account?.address || "",
                        });
                        
                        console.log("transaction:: ", tx);

                        console.log("Buying NFT process Completed::::: ")

                        return tx;
                      }}
                    >
                      Buy NFT Using ThirdWeb Pay
                    </TransactionButton>

                   

                  





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
