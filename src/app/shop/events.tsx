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


  const fetchProfileAndMarketplaceActivity = async () => {
    const nftId = "61"; // Specific NFT ID to filter
    const walletAddress = "0x1A08674F009BF8D58Ee1ED5bF76Ffc3512538601"; // Replace with the target wallet address
    const provider = new ethers.providers.JsonRpcProvider(
      "https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"
    ); // Replace with your RPC URL
  
    // Utility function for delay
    const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    try {
      const sdk = new ThirdwebSDK(provider);
  
      // Replace with your marketplace and minting contract addresses
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Your marketplace contract
      const mintingAddress = CARD_CONTRACT_ADDRESS; // Your NFT contract
  
      const marketplace = await sdk.getMarketplace(marketplaceAddress);
      const minting = await sdk.getNFTDrop(mintingAddress);
  
      console.log("Marketplace loaded:", marketplace.getAddress());
      console.log("Minting loaded:", minting.getAddress());
  
      // Fetch profile-level activity
      const nfts = await minting.getOwned(walletAddress); // Fetch owned NFTs
      const tokenBalances = await sdk.getBalance(walletAddress); // Fetch token balances
      console.log("Profile-level activity fetched.");
      await sleep(1000); // 1-second delay
  
      // Fetch Transfer events
      const nftContract = await sdk.getNFTCollection(mintingAddress);
      const nftContractEvents = await nftContract.events.getEvents("Transfer");
  
      const transferEvents = nftContractEvents
        .filter((event) => {
          const tokenId = event.data.tokenId.toString();
          const fromAddress = event.data.from.toLowerCase();
          return (
            tokenId === nftId &&
            fromAddress === "0x0000000000000000000000000000000000000000"
          );
        })
        .map((event) => ({
          type: "Transfer",
          from: event.data.from,
          to: event.data.to,
          tokenId: event.data.tokenId.toString(),
          price: "0", // Default price for Transfer events
        }));
  
      console.log("Filtered Transfer Events:", transferEvents);
      await sleep(1000); // 1-second delay
  
      // Initialize contract instance for marketplace
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
  
      // Fetch NewSale events
      const newSaleFilter = contract.filters.NewSale();
      const newSaleEvents = await contract.queryFilter(newSaleFilter);
      console.log("newSaleEvents :::: ", newSaleEvents);
  
      const marketEvents = newSaleEvents
        .filter((event) => {
            const userAddress = event.args?.listingCreator
            console.log("User Address :::: ", userAddress)
            console.log("User walletAddress :::: ", walletAddress)
  
            return userAddress === walletAddress;
          })
        .map((event) => ({
          type: "NewSale",
          buyer: event.args?.buyer,
          seller: event.args?.listingCreator,
          tokenId: event.args?.tokenId.toString(),
          price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
        }));
  
  
      console.log("Filtered Market Events:", marketEvents);
      await sleep(1000); // 1-second delay
  
      // // Fetch acceptOffer events
      // const acceptOfferFilter = contract.filters.AcceptedOffer();
      // const acceptOfferEvents = await contract.queryFilter(acceptOfferFilter);
  
      // // const acceptedOffers = acceptOfferEvents
      // //   .map((event) => ({
      // //     type: "AcceptOffer",
      // //     buyer: event.args?.offerer,
      // //     seller: event.args?.receiver,
      // //     tokenId: event.args?.tokenId.toString(),
      // //     price: ethers.utils.formatEther(event.args?.price), // Price in Ether
      // //   }));
  
      // console.log("Filtered Accept Offer Events:", acceptOfferEvents);
      // await sleep(1000); // 1-second delay
  
      // Fetch makeOffer events
      // const makeOfferFilter = contract.filters.MakeOffer();
      // const makeOfferEvents = await contract.queryFilter(makeOfferFilter);
  
      // // const madeOffers = makeOfferEvents
      // //   .filter((event) => {
      // //     const tokenId = event.args?.tokenId.toString();
      // //     return tokenId === nftId;
      // //   })
      // //   .map((event) => ({
      // //     type: "MakeOffer",
      // //     offerer: event.args?.offerer,
      // //     tokenId: event.args?.tokenId.toString(),
      // //     price: ethers.utils.formatEther(event.args?.price), // Price in Ether
      // //   }));
  
      // console.log("Filtered Make Offer Events:", makeOfferEvents);
      // await sleep(1000); // 1-second delay
  
      // // Fetch cancelOffer events
      // const cancelOfferFilter = contract.filters.CancelledOffer();
      // const cancelOfferEvents = await contract.queryFilter(cancelOfferFilter);
  
      // const canceledOffers = cancelOfferEvents
      //   .map((event) => ({
      //     type: "CancelOffer",
      //     offerer: event.args?.offerer,
      //     tokenId: event.args?.tokenId.toString(),
      //   }));
  
      // console.log("Filtered Cancel Offer Events:", cancelOfferEvents);
      // await sleep(1000); // 1-second delay
  
      // Combine all fetched data
      const combinedActivity = {
        profileActivity: {
          nfts,
          tokenBalances,
        },
        marketplaceActivity: {
          transferEvents,
          marketEvents,
        },
      };
  
      console.log("Combined Activity:", combinedActivity);
      return combinedActivity;
    } catch (error) {
      console.error("Error fetching profile and marketplace activity:", error);
      return null;
    }
  };
  
  
  
  const fetchProfileAndMarketplaceActivity = async () => {
    const nftId = "61"; // Specific NFT ID to filter
    const walletAddress = "0x1A08674F009BF8D58Ee1ED5bF76Ffc3512538601"; // Replace with the target wallet address
    const provider = new ethers.providers.JsonRpcProvider(
      "https://84532.rpc.thirdweb.com/8bab9537dc62607b3a9f876b3a3ecac9"
    ); // Replace with your RPC URL
  
    // Utility function for delay
    const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    try {
      const sdk = new ThirdwebSDK(provider);
  
      // Replace with your marketplace and minting contract addresses
      const marketplaceAddress = MARKET_CONTRACT_ADDRESS; // Your marketplace contract
      const mintingAddress = CARD_CONTRACT_ADDRESS; // Your NFT contract
  
      const marketplace = await sdk.getMarketplace(marketplaceAddress);
      const minting = await sdk.getNFTDrop(mintingAddress);
  
      console.log("Marketplace loaded:", marketplace.getAddress());
      console.log("Minting loaded:", minting.getAddress());
  
      // Fetch profile-level activity
      const nfts = await minting.getOwned(walletAddress); // Fetch owned NFTs
      const tokenBalances = await sdk.getBalance(walletAddress); // Fetch token balances
      console.log("Profile-level activity fetched.");
      await sleep(1000); // 1-second delay
  
      // Fetch Transfer events
      const nftContract = await sdk.getNFTCollection(mintingAddress);
      const nftContractEvents = await nftContract.events.getEvents("Transfer");
  
      const transferEvents = nftContractEvents
        .filter((event) => {
          const tokenId = event.data.tokenId.toString();
          const fromAddress = event.data.from.toLowerCase();
          return (
            tokenId === nftId &&
            fromAddress === "0x0000000000000000000000000000000000000000"
          );
        })
        .map((event) => ({
          type: "Transfer",
          from: event.data.from,
          to: event.data.to,
          tokenId: event.data.tokenId.toString(),
          price: "0", // Default price for Transfer events
        }));
  
      console.log("Filtered Transfer Events:", transferEvents);
      await sleep(1000); // 1-second delay
  
      // Initialize contract instance for marketplace
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
  
      // Fetch NewSale events
      const newSaleFilter = contract.filters.NewSale();
      const newSaleEvents = await contract.queryFilter(newSaleFilter);
      console.log("newSaleEvents :::: ", newSaleEvents);
  
      const marketEvents = newSaleEvents
        .filter((event) => {
            const userAddress = event.args?.listingCreator
            console.log("User Address :::: ", userAddress)
            console.log("User walletAddress :::: ", walletAddress)
  
            return userAddress === walletAddress;
          })
        .map((event) => ({
          type: "NewSale",
          buyer: event.args?.buyer,
          seller: event.args?.listingCreator,
          tokenId: event.args?.tokenId.toString(),
          price: ethers.utils.formatEther(event.args?.totalPricePaid), // Price in Ether
        }));
  
  
      console.log("Filtered Market Events:", marketEvents);
      await sleep(1000); // 1-second delay
  
      
      // Combine all fetched data
      const combinedActivity = {
        profileActivity: {
          nfts,
          tokenBalances,
        },
        marketplaceActivity: {
          transferEvents,
          marketEvents,
        },
      };
  
      console.log("Combined Activity:", combinedActivity);
      return combinedActivity;
    } catch (error) {
      console.error("Error fetching profile and marketplace activity:", error);
      return null;
    }
  };
  
  