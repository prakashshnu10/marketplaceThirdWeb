
import { ethers } from "ethers";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Initialize Thirdweb SDK and ethers.js
const provider = new ethers.providers.JsonRpcProvider("https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9");
const sdk = new ThirdwebSDK(provider);

// Contract addresses
const marketplaceAddress = "0x59fB76653A7D3DD25102bD58ac1B5Cc6225eCfd0";
const packAddress = "0x5D8224f9aE96d81ef18c811627c67d0139f1E7ed";

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


async function fetchAndProcessPacks() {
  try {
    // Create contract instances
    const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
    const packContract = await sdk.getContract(packAddress, "pack");

    // Fetch NewSale events
    const filter = marketplaceContract.filters.NewSale();
    const events = await marketplaceContract.queryFilter(filter);

    console.log(`Fetched ${events.length} NewSale events.`);

    // for (const event of events) {
    //   const { buyer, tokenId } = event.args;

    //   // Get pack metadata
    //   const pack = await packContract.call("getPack", [tokenId]);
    //   const { expirationDate, totalSupply } = pack;

    //   // Check if the pack is expired
    //   const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    //   if (expirationDate.toNumber() < now) {
    //     console.log(`Pack ${tokenId} is expired.`);

    //     // Check if there are any NFTs left in the pack
    //     if (totalSupply.toNumber() > 0) {
    //       console.log(`Opening pack ${tokenId} for buyer ${buyer}...`);

    //       // Open the pack
    //       try {
    //         const tx = await packContract.call("openPack", [tokenId, 1], {
    //           from: buyer,
    //         });
    //         console.log(`Pack ${tokenId} opened successfully. Transaction: ${tx.transactionHash}`);
    //       } catch (err) {
    //         console.error(`Failed to open pack ${tokenId}:`, err);
    //       }
    //     } else {
    //       console.log(`Pack ${tokenId} has no NFTs left.`);
    //     }
    //   } else {
    //     console.log(`Pack ${tokenId} is not expired yet.`);
    //   }
    // }
  } catch (error) {
    console.error("Error fetching or processing packs:", error);
  }
}

fetchAndProcessPacks();
