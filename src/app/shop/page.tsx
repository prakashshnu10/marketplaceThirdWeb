"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BuyDirectListingButton, PayEmbed, ThirdwebProvider, TransactionButton, useActiveWallet, useSendTransaction, useWalletBalance } from "thirdweb/react";
import { createListing, getAllListings, getAllValidListings, newSaleEvent, totalListings } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { defineChain, getContract, sendTransaction, getUser, createThirdwebClient, getContractEvents, prepareEvent, eth_gasPrice, getRpcClient, eth_estimateGas, prepareTransaction, toSerializableTransaction, readContract, sendAndConfirmTransaction, eth_getTransactionByHash, eth_getTransactionReceipt, eth_getBlockByHash, eth_getBlockByNumber, waitForReceipt } from "thirdweb";
import { CARD_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, PACK_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../const/addresses";
import { buyFromListing, makeOffer } from "thirdweb/extensions/marketplace";
import { approve } from "thirdweb/extensions/erc20";
import { price } from "thirdweb/extensions/farcaster/bundler";
import { getAll, } from "thirdweb/extensions/thirdweb";
import { ethers } from "ethers";
import { getBlock, ThirdwebSDK } from "@thirdweb-dev/react";
import { getNFT, getOwnedNFTs, openPack } from "thirdweb/extensions/erc1155";
import { claimTo, getNFT as getNFTDrop, getNFTs } from "thirdweb/extensions/erc721";
import { createWallet, privateKeyToAccount, smartWallet } from "thirdweb/wallets";
import { base, baseSepolia, ethereum } from "thirdweb/chains";
import { getOwnedERC721s } from "../getOwnedERC721s";
import { convertCryptoToFiat } from "thirdweb/pay";







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
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "assetContract",
                "type": "address"
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
                "internalType": "address",
                "name": "currency",
                "type": "address"
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
              }
            ],
            "internalType": "struct IOffers.OfferParams",
            "name": "_params",
            "type": "tuple"
          }
        ],
        "name": "makeOffer",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "_offerId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
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
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
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
  console.log("Active Account ::", account);
  const chain = defineChain(84532); // base
  // const chain = defineChain(11155111);

  // const client = createThirdwebClient({
  //   clientId: 'b217676c33d542c07d2a747ab2e20182',
  //   secretKey: 'Wx5OjlMwPkPDldOiPNQnV3ec2dtavWlE5_ZQAeIKPommOWYaC4A8UT1-Zr8r1AS_FnBoob_ETW6prI2D_eorMA'
  // });


  const client = createThirdwebClient({
    clientId: '8bab9537dc62607b3a9f876b3a3ecac9',
    secretKey: 'dBV9ptWxOcj6ovwXj8Ejj_L7qvNUQTyLUdABG_iVdFZURuvvyafG_j3eICT9JEwyXQG-Bh1FXOYGpcz7hD8yGg',

  });  //base

  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const handlePriceChange = (id: string, value: string) => {
    setPrices({
      [id]: value,
    });
  };
  


  const cardsContract = getContract({
    address: CARD_CONTRACT_ADDRESS,
    chain,
    client,
  });

  // console.log("Cards Contract:  ", cardsContract);

  const market = getContract({
    address: MARKET_CONTRACT_ADDRESS,
    chain,
    client,
  });

  const contract = getContract({
    client,
    chain: defineChain(84532),
    address: "0x59fB76653A7D3DD25102bD58ac1B5Cc6225eCfd0",
  });




  const pack = getContract({
    address: PACK_CONTRACT_ADDRESS,
    chain,
    client,
  });
  useEffect(() => {

   
 



    


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

        const result = await totalListings({
          contract,
        });
        console.log(result - 1n)

        const lists = await getAllValidListings({
          contract: market,
          start: 0,  
          count: result - 1n
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
        // fetchMarketplaceEvents();
        // fetchSoldItem();

        // fetchProfileAndMarketplaceActivity();///
        // fetchAndProcessPacks();
        
        // fetchMarketplaceEvents();

        // fetchOwnedNFTsEventWithDate();
        // fetchOwnedNFTsEventWithDateAndMetaData();
        // fetchOwnedNFTsEventWithDateAndMetaData();

        // fetchSoldItemEvents();

        // fetchMarketplaceEvents();
        // convertToUSD("41");
        // convertUSDCtoUSD();
        

      } catch (error) {
        console.error("Error fetching valid listings:", error);
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    };
    fetchValidListings();
  }, [market]);


  const convertToUSD = async (amount: string) => {
    const chain = ethereum
    console.log("Chain ",chain);
  
    const floatVal = Number(parseFloat(amount));
    const resp = await convertCryptoToFiat({
      fromTokenAddress: ' 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      to: 'USD',
      chain: chain,
      fromAmount: floatVal,
      client: client,
    });
    console.log("resp ", resp);
    return resp.result;
  };

  const convertUSDCtoUSD = async () => {
    try {
      // Initialize ThirdWeb SDK
      const sdk = new ThirdwebSDK("mainnet"); // Use "goerli" for testing on testnets
  
      // Specify the wallet address
      const walletAddress = "0xYourWalletAddress";
  
      // Replace with your USDC contract address
      const usdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC contract address on Ethereum Mainnet
  
      // Get the USDC contract instance
      const usdcContract = await sdk.getToken(usdcContractAddress);
  
      // Fetch the user's USDC balance
      // const usdcBalance = "8"
      const usdcAmount = 8 // Convert balance to a readable number
  
      console.log(`USDC Balance: ${usdcAmount}`);
  
      // Fetch the current conversion rate (optional, for accuracy)
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
      );
      const data = await response.json();
      const conversionRate = data["usd-coin"].usd;
  
      console.log(`Current Conversion Rate (USDC to USD): ${conversionRate}`);
  
      // Convert USDC to USD
      const usdValue = parseFloat("8") * conversionRate;
  
      console.log(`Equivalent USD Value: $${usdValue.toFixed(2)}`);
    } catch (error) {
      console.error("Error converting USDC to USD:", error);
    }
  };
  async function fetchAndProcessPacks() {
    try {

      
      // Initialize Thirdweb SDK and ethers.js
      const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9");
      const sdk = new ThirdwebSDK(provider);

      const result = await totalListings({
        contract,
      });
      console.log(result - 1n)



      // // Fetch NewSale events
      const listings = await getAllListings({
        contract: market,
        start: 0,
        count: result - 1n
      });
      console.log(`Fetched ${listings.length} NewSale events.`);
      console.log('events :::', listings);

      const filteredExpiredEvents = await Promise.all(listings
        .filter((event) => {
          const statusListing = event.status;
          const quantityPack = event.quantity
          return statusListing === "EXPIRED" && quantityPack > BigInt(0);
        })
      );

      console.log("filteredExpiredEvents :::", filteredExpiredEvents);

      for (const event of filteredExpiredEvents) {
        const tokenId = event.tokenId;
        const quantityNFTs = event.quantity;
        console.log(`Processing expired pack: ${tokenId}`);
        console.log(`Processing expired pack: ${quantityNFTs}`);

  
        try {
          const account = privateKeyToAccount({
            client,
            privateKey: "0x3e97b417774a9b4f356249be285afd4f2be6854932acd43ef31621d80f2055ec",
          });

          const packData = await getNFT({
            contract: pack,
            tokenId: tokenId,
          });

          console.log("Pack Data ::::", packData);

          const packQuantity = packData?.supply;

          console.log("Pack Supply ::", packQuantity);
      
          const transaction = await openPack({
            contract: pack,
            packId: BigInt(tokenId),
            amountToOpen: quantityNFTs,
            overrides: {},
          });
      
          if (!account) {
            console.error("Account not found");
            return;
          }
      
          const tx = await sendAndConfirmTransaction({
            transaction: transaction,
            account: account,
          });
          console.log(`Pack ${tokenId} opened successfully. Transaction: ${tx}`);
        } catch (err) {
          console.error(`Failed to open pack ${tokenId}:`, err);
        }
      }

  
     
    } catch (error) {
      console.error("Error fetching or processing packs:", error);
    }
  }


  const fetchMarketplaceEvents = async () => {
   
    if (!account) {
      console.error("Account not found");
      return;
    }
    try{
      console.log("Claim process started :::")

      const cardsContract = getContract({
        address: "0xfe9991f31De23F95d58d40309BaE42D47e9C6c7a",
        chain,
        client,
      });

      const transaction = claimTo({
        contract:cardsContract,
        to: "0x53f0b3E351aD45A5aB19aD93aDA59a3b219E59cd",
        quantity:1n
      });
      
      const { transactionHash } = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      console.log("Claim process started :::", transactionHash)

  

    }catch (e){
        console.log("Errr ;;;", e)
    }
    

  };

  const fetchSoldItem = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"); // Replace with your RPC URL
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


  const fetchSoldItemEvents = async () => {
    const nftId = "61"; // Specific NFT ID to filter
    const walletAddress = "0x5c78fDF57c0Fd5D90C7a9c7dc44DAb0c85BE057F"; // Replace with the target wallet address
    const provider = new ethers.providers.JsonRpcProvider(
      "https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"
    ); // Replace with your RPC URL
  
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    try {
      const sdk = new ThirdwebSDK(provider);
  
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Your marketplace contract
      const mintingAddress = CARD_CONTRACT_ADDRESS; // Your NFT contract

      const fetchedNFTs = await getNFTs({
        contract: cardsContract,
      });
  
      console.log("fetchedNFTs :::::", fetchedNFTs);
  
      // Combine id and metadata into a single object
      const nftData = fetchedNFTs.map((nft) => ({
        id: nft.id.toString(), // Ensure id is a string
        metadata: nft.metadata,
      }));
  
      console.log("NFT Data :::: ", nftData);
  
      // Extracting all `id` values
      const nftIds = nftData.map((nft) => nft.id.toString()); // Explicitly convert to string if not already
  
      console.log("NFT IDs:", nftIds);
  
      const marketplace = await sdk.getMarketplace(marketplaceAddress);


  
      console.log("Marketplace loaded:", marketplace.getAddress());

  
      await sleep(1000);
  

      // Fetch NewSale events
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const newSaleFilter = contract.filters.NewSale();
      const acceptedOffer = contract.filters.AcceptedOffer();

      // Query events separately
      const newSaleEvents = await contract.queryFilter(newSaleFilter);
      const acceptedOfferEvents = await contract.queryFilter(acceptedOffer);

      // Combine the results if needed
      const allEvents = [...newSaleEvents, ...acceptedOfferEvents];
      console.log("new Sale Event:: ", allEvents);
  
      const marketEvents = await Promise.all(
        newSaleEvents
          .filter((event) => {
            const tokenId = event.args?.tokenId.toString();
            return (
              nftIds.includes(tokenId)
            ); // Filter events based on nftIds
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            return {
              type: "NewSale",
              buyer: event.args?.buyer,
              seller: event.args?.listingCreator,
              tokenId: event.args?.tokenId.toString(),
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );
  
      console.log("Filtered Market Events:", marketEvents);
      await sleep(1000);

      const marketEventsOffer = await Promise.all(
        acceptedOfferEvents
          .filter((event) => {
            const tokenId = event.args?.tokenId.toString();
            return (
              nftIds.includes(tokenId)
            ); // Filter events based on nftIds
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            return {
              type: "AcceptedOffer",
              buyer: event.args?.offeror,
              seller: event.args?.seller,
              tokenId: event.args?.tokenId.toString(),
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );

      
      console.log("Filtered marketEventsOffer:", marketEventsOffer);
  
      // Combine all fetched data
      const combinedActivity = {

        marketplaceActivity: {
          marketEvents,
          marketEventsAcceptedOffer: marketEventsOffer
        },
      };
  
      console.log("Combined Activity:", combinedActivity);
      return combinedActivity;
    } catch (error) {
      console.error("Error fetching profile and marketplace activity:", error);
      return null;
    }
  };
  

  


  // const fetchOwnedNFTsEventWithDateAndMetaData = async () => {
  //   const nftId = "60"; // The specific NFT ID to filter
  //   const walletAddress = '0x9d074c21B673a8650aF1Ddc4b034F2244dcBAb07'
  //   try {
  //     const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"); // Replace with your RPC URL
  //     const sdk = new ThirdwebSDK(provider);
  //     const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
  //     const marketplace = await sdk.getMarketplace(marketplaceAddress);

  //     console.log("Marketplace loaded:", marketplace.getAddress());

  //     const fetchedNFTs = await getOwnedERC721s({
  //       contract: cardsContract,
  //       owner: walletAddress,
  //     });

  //     console.log("fetchedNFTs :::::", fetchedNFTs)

  //     // Combine id and metadata into a single object
  //     const nftData = fetchedNFTs.map(nft => ({
  //       id: nft.id.toString(), // Ensure id is a string
  //       metadata: nft.metadata,
  //     }));

  //     console.log("NFT Data :::: ", nftData)

  //     // Extracting all `id` values
  //     // const nftIds = fetchedNFTs.map(nft => nft.id);
  //     const nftIds = nftData.map(nft => nft.id.toString()); // Explicitly convert to string if not already


  //     console.log("NFT IDs:", nftIds);


  //      // Initialize contract instance for marketplace
  //      const contractMarket = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
    
  //      // Fetch NewSale events
  //      const newSaleFilter = contractMarket.filters.NewSale();
  //      const newSaleEvents = await contractMarket.queryFilter(newSaleFilter);

  //      console.log("newSaleEvents Market Events:", newSaleEvents);

  //      const rpcRequest = getRpcClient({ client, chain });

  //      const latestMarketEvents = new Map();
   
  //      const marketEvents = await Promise.all(
  //       newSaleEvents
  //         .filter((event) => {
  //           const tokenId = event.args?.tokenId.toString();
  //           const buyerAddress = event.args?.buyer.toLowerCase(); 
  //           console.log("buuyer address : ", buyerAddress)
  //           return nftIds.includes(tokenId) && buyerAddress == walletAddress.toLowerCase(); // Filter events based on nftIds
  //         })
  //         .map(async (event) => {
  //           // Fetch block details using blockNumber from the event
  //           const block = await eth_getBlockByNumber(rpcRequest, {
  //             blockNumber: BigInt(event.blockNumber),
  //             includeTransactions: true,
  //           });
      
  //           // Format the timestamp to day-month-year
  //           const eventDate = formatDate(block.timestamp);
      
  //           const formattedEvent =  {
  //             type: "NewSale",
  //             buyer: event.args?.buyer,
  //             seller: event.args?.listingCreator,
  //             tokenId: event.args?.tokenId.toString(),
  //             price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
  //             blockNum: event.blockNumber,
  //             eventDate: eventDate, // Add formatted event date in DD-MM-YYYY format
  //             metadata: nftData.find(nft => nft.id === event.args?.tokenId.toString())?.metadata, // Add metadata
  //           };

  //           // Check if a newer event for the same tokenId exists
  //          const existingEvent = latestMarketEvents.get(formattedEvent.tokenId);


  //           // Compare dates and update the Map if the current event is newer
  //           if (
  //             !existingEvent ||
  //             new Date(existingEvent.eventDate.split('-').reverse().join('-')) < 
  //             new Date(formattedEvent.eventDate.split('-').reverse().join('-'))
  //           ) {
  //             latestMarketEvents.set(formattedEvent.tokenId, formattedEvent);
  //           }
  //         })
  //     );

  //     // Convert the Map to an array for the final response
  //     const uniqueLatestEvents = Array.from(latestMarketEvents.values());
      
  //     // console.log("Filtered Market Events:", marketEvents);

  //     console.log("uniqueLatestEvents :::: ", uniqueLatestEvents)

  //     const packAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
  //     const contract = new ethers.Contract(packAddress, PackABI, provider);
  

  //     const filter = contract.filters.PackOpened();

  //     // Fetch all past events
  //     const allEvents = await contract.queryFilter(filter); // Empty filter to fetch all events
  //     console.log("All Events:", allEvents);

  //     console.log("allEvents ::", allEvents);
  
  //     // Optional: Format events for better readability
  //     const formattedEvents = allEvents.map((event) => ({
  //       eventName: event.event,
  //       args: event.args,
  //       blockNumber: event.blockNumber,
  //       transactionHash: event.transactionHash,
  //     }));

  //     console.log("formattedEvents :::", formattedEvents);
   
       
  //      const combinedActivity = {

  //        marketplaceActivity: {
  //         uniqueLatestEvents,
  //        },
  //      };
   
  //      console.log("Combined Activity:", combinedActivity);
  //     // console.log("Combined Events Object:", combinedEvents);
  //     return combinedActivity; // Return or use the object as needed
  //   } catch (error) {
  //     console.error("Error fetching marketplace events:", error);
  //   }
  // };


  const fetchOwnedNFTsEventWithDateAndMetaData = async () => {
    const nftId = "60"; // The specific NFT ID to filter
    const walletAddress = "0x9d074c21B673a8650aF1Ddc4b034F2244dcBAb07";
  
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"
      ); // Replace with your RPC URL
      const sdk = new ThirdwebSDK(provider);
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Replace with your contract address
      const marketplace = await sdk.getMarketplace(marketplaceAddress);
  
      console.log("Marketplace loaded:", marketplace.getAddress());
  
      const fetchedNFTs = await getOwnedERC721s({
        contract: cardsContract,
        owner: walletAddress,
      });
  
      console.log("fetchedNFTs :::::", fetchedNFTs);
  
      // Combine id and metadata into a single object
      const nftData = fetchedNFTs.map((nft) => ({
        id: nft.id.toString(), // Ensure id is a string
        metadata: nft.metadata,
      }));
  
      console.log("NFT Data :::: ", nftData);
  
      // Extracting all `id` values
      const nftIds = nftData.map((nft) => nft.id.toString()); // Explicitly convert to string if not already
  
      console.log("NFT IDs:", nftIds);
  
      // Initialize contract instance for marketplace
      const contractMarket = new ethers.Contract(
        marketplaceAddress,
        marketplaceABI,
        provider
      );
  
      // Fetch NewSale events
      const newSaleFilter = contractMarket.filters.NewSale();
      const acceptedOfferEvent = contractMarket.filters.AcceptedOffer();

      // Query events separately
      const newSaleEvents = await contractMarket.queryFilter(newSaleFilter);
      const acceptedOfferEvents = await contractMarket.queryFilter(acceptedOfferEvent);


  
      console.log("newSaleEvents Market Events:", newSaleEvents);
  
      const rpcRequest = getRpcClient({ client, chain });
  
      const latestMarketEvents = new Map();
  
      const marketEvents = await Promise.all(
        newSaleEvents
          .filter((event) => {
            const tokenId = event.args?.tokenId.toString();
            const buyerAddress = event.args?.buyer.toLowerCase();
            console.log("buuyer address : ", buyerAddress);
            return (
              nftIds.includes(tokenId) &&
              buyerAddress === walletAddress.toLowerCase()
            ); // Filter events based on nftIds
          })
          .map(
            async (event) => {
              const block = await provider.getBlock(event.blockNumber);
              const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); 
  
            const formattedEvent = {
              type: "NewSale",
              buyer: event.args?.buyer,
              seller: event.args?.listingCreator,
              tokenId: event.args?.tokenId.toString(),
              price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
              blockNum: event.blockNumber,
              eventDate: eventDate, // Add formatted event date in DD-MM-YYYY format
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
  
            // Check if a newer event for the same tokenId exists
            const existingEvent = latestMarketEvents.get(formattedEvent.tokenId);
  
            // Compare dates and update the Map if the current event is newer
            if (
              !existingEvent ||
              new Date(existingEvent.eventDate.split("-").reverse().join("-")) <
                new Date(formattedEvent.eventDate.split("-").reverse().join("-"))
            ) {
              latestMarketEvents.set(formattedEvent.tokenId, formattedEvent);
            }
          })
      );
  
      // Convert the Map to an array for the final response
      const uniqueLatestEvents = Array.from(latestMarketEvents.values());
  
      console.log("uniqueLatestEvents :::: ", uniqueLatestEvents);


      const latestMarketOfferEvents = new Map();

      console.log("acceptedOfferEvents :::", acceptedOfferEvents);
  
      const acceptedEvent = await Promise.all(
        acceptedOfferEvents
          .filter((event) => {
            const tokenId = event.args?.tokenId.toString();
            const buyerAddress = event.args?.seller.toLowerCase();
            console.log("buuyer address : ", buyerAddress);
            return (
              nftIds.includes(tokenId) &&
              buyerAddress === walletAddress.toLowerCase()
            ); // Filter events based on nftIds
          })
          .map(

            async (event) => {
              const block = await provider.getBlock(event.blockNumber);
              const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); 
  
            const formattedEvent = {
              type: "AcceptedOffer",
              buyer: event.args?.offeror,
              seller: event.args?.seller,
              tokenId: event.args?.tokenId.toString(),
              price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
              blockNum: event.blockNumber,
              eventDate: eventDate, // Add formatted event date in DD-MM-YYYY format
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
  
            // Check if a newer event for the same tokenId exists
            const existingEvent = latestMarketOfferEvents.get(formattedEvent.tokenId);
  
            // Compare dates and update the Map if the current event is newer
            if (
              !existingEvent ||
              new Date(existingEvent.eventDate.split("-").reverse().join("-")) <
                new Date(formattedEvent.eventDate.split("-").reverse().join("-"))
            ) {
              latestMarketOfferEvents.set(formattedEvent.tokenId, formattedEvent);
            }
          })
      );
  
      // Convert the Map to an array for the final response
      const uniqueLatestOfferEvents = Array.from(latestMarketOfferEvents.values());
  
      console.log("uniqueLatestOfferEvents :::: ", uniqueLatestOfferEvents);
  
      // Handle PackOpened events
      const packAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
      const contract = new ethers.Contract(packAddress, PackABI, provider);
  
      const filter = contract.filters.PackOpened();
  
      // Fetch all past events
      const allEvents = await contract.queryFilter(filter); // Empty filter to fetch all events
      console.log("All Events:", allEvents);
  
      const latestPackOpenedEvents = new Map();
  
      const packOpenedEvents = await Promise.all(
        allEvents
          .filter((event) => {
            const tokenId = event.args?.rewardUnitsDistributed[0].tokenId.toString();
            const openerAddress = event.args?.opener.toLowerCase();
            return (
              nftIds.includes(tokenId) &&
              openerAddress === walletAddress.toLowerCase()
            );
          })
          .map(

            async (event) => {
              const block = await provider.getBlock(event.blockNumber);
              const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); 
  
            const formattedEvent = {
              type: "PackOpened",
              opener: event.args?.opener,
              tokenId: event.args?.rewardUnitsDistributed[0].tokenId.toString(),
              blockNum: event.blockNumber,
              eventDate: eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.rewardUnitsDistributed[0].tokenId.toString()
              )?.metadata,
            };

            console.log("formattedEvent :::", formattedEvent);
  
            const existingEvent = latestPackOpenedEvents.get(
              formattedEvent.tokenId
            );
  
            if (
              !existingEvent ||
              new Date(existingEvent.eventDate.split("-").reverse().join("-")) <
                new Date(formattedEvent.eventDate.split("-").reverse().join("-"))
            ) {
              latestPackOpenedEvents.set(formattedEvent.tokenId, formattedEvent);
            }
          })
      );
  
      const uniqueLatestPackOpenedEvents = Array.from(
        latestPackOpenedEvents.values()
      );
  
      console.log(
        "uniqueLatestPackOpenedEvents :::: ",
        uniqueLatestPackOpenedEvents
      );

      const nftContract = new ethers.Contract(CARD_CONTRACT_ADDRESS, mintingABI, provider);

      // Fetch Transfer events
      const transferFilter = nftContract.filters.Transfer(null, walletAddress); // Filter by `to` address
      const transferEvents = await nftContract.queryFilter(transferFilter);
  
      console.log("Transfer Events:", transferEvents);
  
  
      const latestTransferEvents = new Map();
  
      // Process each transfer event
      await Promise.all(
        transferEvents
        .filter((event) => {
          const tokenId = event.args?.tokenId.toString();
          const toAddress = event.args?.to.toLowerCase();
          return (
            nftIds.includes(tokenId) &&
            toAddress === walletAddress.toLowerCase()
          );
        })
        .map(

          async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); 
  
          const formattedEvent = {
            type: "Transfer",
            from: event.args?.from,
            to: event.args?.to,
            tokenId: event.args?.tokenId.toString(),
            blockNum: event.blockNumber,
            eventDate: eventDate, // Add formatted date
            metadata: nftData.find(
              (nft) => nft.id === event.args?.tokenId.toString()
            )?.metadata, // Add metadata if available
          };
  
          // Check if a newer transfer for the same tokenId exists
          const existingEvent = latestTransferEvents.get(formattedEvent.tokenId);
  
          if (
            !existingEvent ||
            new Date(existingEvent.eventDate.split("-").reverse().join("-")) <
              new Date(formattedEvent.eventDate.split("-").reverse().join("-"))
          ) {
            latestTransferEvents.set(formattedEvent.tokenId, formattedEvent);
          }
        })
      );
  
      const uniqueLatestTransferEvents = Array.from(latestTransferEvents.values());
      console.log("uniqueLatestTransferEvents :::: ", uniqueLatestTransferEvents);
  
  
      const combinedActivity = {
        marketplaceActivity: uniqueLatestEvents,
        packOpenedActivity: uniqueLatestPackOpenedEvents,
        transferActivity: uniqueLatestTransferEvents,
        acceptedOffer: uniqueLatestOfferEvents
      };
  
      console.log("Combined Activity:", combinedActivity);
      return combinedActivity; // Return or use the object as needed
    } catch (error) {
      console.error("Error fetching marketplace events:", error);
    }
  };
  

  const fetchProfileAndMarketplaceActivity = async () => {
    const nftId = "61"; // Specific NFT ID to filter
    // const walletAddress = primaryWallet; // Replace with the target wallet address
    const primaryWallet ="0x9d074c21B673a8650aF1Ddc4b034F2244dcBAb07";
    
    const provider = new ethers.providers.JsonRpcProvider(
      "https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"
    ); // Replace with your RPC URL
  
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    
    try {
      const sdk = new ThirdwebSDK(provider);
  
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS // Your marketplace contract
      const mintingAddress = CARD_CONTRACT_ADDRESS; // Your NFT contract
  
      const marketplace = await sdk.getMarketplace(marketplaceAddress);
      const minting = await sdk.getNFTDrop(mintingAddress);
  
      const nftContract = await sdk.getNFTCollection(mintingAddress);
  
      console.log("Marketplace loaded:", marketplace.getAddress());
      console.log("Minting loaded:", minting.getAddress());
  
      // Fetch profile-level activity
      // const nfts = await minting.getOwned(walletAddress);
      const fetchedNFTs = await getNFTs({
        contract: cardsContract,
        count: 200
      });

      // console.log("fetchedNFTs :::::", fetchedNFTs)

      // Combine id and metadata into a single object
      const nftData = fetchedNFTs.map(nft => ({
        id: nft.id.toString(), // Ensure id is a string
        metadata: nft.metadata,
      }));

      // console.log("NFT Data :::: ", nftData)

      // Extracting all `id` values
      // const nftIds = fetchedNFTs.map(nft => nft.id);
      const nftIds = nftData.map(nft => nft.id.toString()); // Explicitly convert to string if not already


      console.log("NFT IDs:", nftIds);
      const tokenBalances = await sdk.getBalance(primaryWallet);
  
      await sleep(1000);
  
      // Fetch Transfer events
      const nftContractEvents = await nftContract.events.getEvents("Transfer");
  // console.log(nftContractEvents,'nftContractEvents')
      const transferEvents = await Promise.all(
        nftContractEvents
          .filter((event) => {
            const tokenId = event.data.tokenId.toString();
            const fromAddress = event.data.from.toLowerCase();
            return (
              nftIds.includes(tokenId) &&
              fromAddress === "0x0000000000000000000000000000000000000000"
            );
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.transaction.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            return {
              type: "Transfer",
              from: event.data.from,
              to: event.data.to,
              tokenId: event.data.tokenId.toString(),
              price: "0",
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.data.tokenId.toString(),
              )?.metadata, // Add metadata
            };
          })
      );
  
      // console.log("Filtered Transfer Events:", transferEvents);
      await sleep(1000);
  
      // Fetch NewSale events
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const newSaleFilter = contract.filters.NewSale();
      const newSaleEvents = await contract.queryFilter(newSaleFilter);
      // console.log("newSaleEvents :",newSaleEvents);
  
      const soldMarketEvents = await Promise.all(
        newSaleEvents
          .filter((event) => {
            const userAddress = event.args?.listingCreator;
            const assetContract = event.args?.assetContract;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase() && assetContract.toLowerCase() === CARD_CONTRACT_ADDRESS.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.tokenId.toString();

            console.log("24")

            return {
              type: "SoldNFT",
              buyer: event.args?.buyer,
              seller: event.args?.listingCreator,
              tokenId,
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );

      // console.log("Filtered Market Events:", soldMarketEvents);


      const boughtMarketEvents = await Promise.all(
        newSaleEvents
          .filter((event) => {
            const userAddress = event.args?.buyer;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.tokenId.toString();

            console.log("24")

            return {
              type: "BoughtNFT",
              buyer: event.args?.buyer,
              seller: event.args?.listingCreator,
              tokenId,
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );
  
      // console.log("Filtered Market Events:", boughtMarketEvents);
      await sleep(1000);

      const acceptedOfferEvent = contract.filters.AcceptedOffer();

      const acceptedOfferEvents = await contract.queryFilter(acceptedOfferEvent);

      // console.log("acceptedOfferEvents :::", acceptedOfferEvents);

      const acceptedOffersEvents = await Promise.all(
        acceptedOfferEvents
          .filter((event) => {
            const userAddress = event.args?.offeror;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.tokenId.toString();

            console.log("24")

            return {
              type: "AcceptedOffer",
              buyer: event.args?.offeror,
              seller: event.args?.seller,
              tokenId,
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );

      // console.log("Filtered acceptedOffers Events:", acceptedOffersEvents);

      const makeOfferEvent = contract.filters.NewOffer();

      const makeOfferEvents = await contract.queryFilter(makeOfferEvent);

      // console.log("makeOfferEvents :::", makeOfferEvents);

      const makeOffersEvents = await Promise.all(
        makeOfferEvents
          .filter((event) => {
            const userAddress = event.args?.offeror;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.offer.tokenId.toString();

            console.log("24")

            return {
              type: "madeAnOffer",
              offeror: event.args?.offeror,
              tokenId,
              price: ethers.utils.formatEther(event.args?.offer.totalPrice),
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.offer.tokenId.toString()
              )?.metadata, // Add metadata
            };
          })
      );

      // console.log("Filtered makeOffer Events:", makeOffersEvents);


      const packAddress = PACK_CONTRACT_ADDRESS; // Replace with your contract address
      const packContract = new ethers.Contract(packAddress, PackABI, provider);
 



      const packcontract = await sdk.getContract(
        PACK_CONTRACT_ADDRESS,
        "pack",
      );




      const soldPackMarketEvents = await Promise.all(
        newSaleEvents
          .filter((event) => {
            const userAddress = event.args?.buyer;
            const assetContract = event.args?.assetContract;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase() && assetContract.toLowerCase() === packAddress.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.tokenId.toString();
             // Get packData for the given packId
             const packData = await getNFT({
              contract: pack,
              tokenId: tokenId,
            });
            // console.log(`URI for Pack ID ${tokenId}:`, packData);

            return {
              type: "BoughtPack",
              buyer: event.args?.buyer,
              seller: event.args?.listingCreator,
              packId: tokenId,
              price: ethers.utils.formatEther(event.args?.totalPricePaid),
              eventDate,
              metadata: packData.metadata
            };
          })
      );

      // console.log("soldPackMarketEvents :::", soldPackMarketEvents);


      const packOpenedEvent = packContract.filters.PackOpened();
      // // Fetch all past events
      const packOpenedEvents = await packContract.queryFilter(packOpenedEvent); // Empty filter to fetch all events
      // console.log("PackOpenedEvents  : ", packOpenedEvents);

      const openPackMarketEvents = await Promise.all(
        packOpenedEvents
          .filter((event) => {
            const userAddress = event.args?.opener;
            return userAddress.toLowerCase() === primaryWallet.toLowerCase();
          })
          .map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const eventDate = new Date(block.timestamp * 1000).toLocaleDateString("en-GB"); // DD-MM-YYYY format
            const tokenId = event.args?.rewardUnitsDistributed[0].tokenId.toString();
            return {
              type: "OpenPack",
              opener: event.args?.opener,
              tokenId,
              eventDate,
              metadata: nftData.find(
                (nft) => nft.id === event.args?.rewardUnitsDistributed[0].tokenId.toString()
              )?.metadata, 
            };
          })
      );

      // console.log("openPackMarketEvents :::", openPackMarketEvents);





      

      // Combine all fetched data
      const combinedActivity = {
        profileActivity: {
          nftIds,
          tokenBalances,
        },
        marketplaceActivity: {
          transferEvents,
          soldMarketEvents,
          boughtMarketEvents,
          acceptedOffersEvents,
          makeOffersEvents,
          openPackMarketEvents,
          soldPackMarketEvents
        },
      };
  
      console.log("Combined Activity:", combinedActivity);
      return combinedActivity;
    } catch (error) {
      console.error("Error fetching profile and marketplace activity:", error);
      return null;
    }
  };

// Function to format timestamp to day-month-year (DD-MM-YYYY)
function formatDate(timestamp:any) {
  // Ensure timestamp is a Number (BigInt to Number conversion)
  const timestampNumber = Number(timestamp);

  // If the timestamp can't be converted to a number, handle the case
  if (isNaN(timestampNumber)) {
    throw new Error("Invalid timestamp: Unable to convert to a number");
  }

  const date = new Date(timestampNumber * 1000); // Convert to milliseconds
  const day = String(date.getDate()).padStart(2, '0'); // Ensure day is two digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, ensure two digits
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
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

      
      console.log("Approving USDC for marketplace...");
      const amountToApprove = "5000000000000000000"; // Example: 1 USDC (18 decimals)

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

      

       await approveUSDC();
 


        // Prepare the transaction
        const transaction =  buyFromListing({
        contract: market,
        listingId: BigInt(listingId),
        quantity: 1n,
        recipient: account?.address || "",
        });



        const transactionResult = await sendTransaction({
          transaction: transaction,
          account: account,
          gasless:{
            provider: "engine",
            relayerUrl: "https://a54f42fd.engine-usw2.thirdweb.com/relayer/15ffa953-f35d-4236-b012-254bd9d783b7",
            relayerForwarderAddress: "0xD61d850DF67e14806CDa2736778D7bE1188f8c6d",
           }
        });

        console.log("Buying NFT Process Completed --->", transactionResult);
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

const handleTransactionSuccess = async (response:any) => {
  console.log("Transaction Successful:", response);
  // Handle the response (e.g., update UI or save data)
  await approveUSDC();
  console.log("Approval Done:", response);
};

  
  
  
  

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
{/* 
                    <button
                      onClick={() => makeOfferNFT(listing.tokenId, prices[listing.id])}
                      className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Make an Offer
                    </button> */}


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
                      onTransactionSent={(result) =>
                        console.log("Submitted:", result.transactionHash)
                      }
                      onTransactionConfirmed={(receipt) =>
                        console.log("Confirmed:", receipt.transactionHash)
                      }
                      gasless={{
                        provider: "engine",
                        relayerUrl: "https://a54f42fd.engine-usw2.thirdweb.com/relayer/15ffa953-f35d-4236-b012-254bd9d783b7", // e.g. https://<engine_url>/relayer/<relayer_id>
                        relayerForwarderAddress: "0xd61d850df67e14806cda2736778d7be1188f8c6d", // a trusted forwarder on the contract
                      }}
                    >
                      Buy NFT Using ThirdWeb Pay
                    </TransactionButton>

                   
                    <PayEmbed
                      client={client}
                      payOptions={{
                        mode: "transaction",
                        transaction: buyFromListing({
                          contract: market,
                          listingId: BigInt(listing.id),
                          quantity: 1n,
                          recipient: account?.address || "",
                        }),
                        onPurchaseSuccess:handleTransactionSuccess,  
                      }}
                    />
                  
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
function getOwnedERC1155NFTs(arg0: unknown) {
  throw new Error("Function not implemented.");
}

