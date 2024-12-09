import {
  createThirdwebClient,
  getContract,
  sendAndConfirmTransaction,
} from "thirdweb";

import { config } from "dotenv";

import { privateKeyToAccount } from "thirdweb/wallets";
import {
  isApprovedForAll,
  setApprovalForAll,
} from "thirdweb/extensions/erc721";
import { createNewPack } from "thirdweb/extensions/pack";
import { sepolia } from "thirdweb/chains";

config();

const main = async () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
  }
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error("THIRDWEB_SECRET_KEY is not set");
  }

  try {
    // const EDITION_CONTRACT_ADDRESS = "0x10b72D1Fe6c35332407780a292799E595942c9f2";
    // const PACK_CONTRACT_ADDRESS = "0x1DF0072D23D65f30508aA324918d403095AccDB2";

    const EDITION_CONTRACT_ADDRESS = "0xCe333e323fBF82D2173813002741050dfCE09005";
    const PACK_CONTRACT_ADDRESS = "0x56e21565Be6A6F0493626110a55f52cDd1f710E2";

    const chain = sepolia;
    

    // Initialize the client and the account
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    const account = privateKeyToAccount({
      client,
      privateKey: process.env.PRIVATE_KEY,
    });

    // Get the contracts

    const contractEdition = getContract({
      address: EDITION_CONTRACT_ADDRESS,
      chain,
      client,
    });

    const contractPack = getContract({
      address: PACK_CONTRACT_ADDRESS,
      chain,
      client,
    });

    // Check if the Account is approved

    const isApproved = await isApprovedForAll({
      contract: contractEdition,
      owner: account.address,
      operator: PACK_CONTRACT_ADDRESS,
    });
    console.log("Account is approved");

    if (!isApproved) {
      const transaction = setApprovalForAll({
        contract: contractEdition,
        operator: PACK_CONTRACT_ADDRESS,
        approved: true,
      });

      const approvalData = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      console.log(`Approval Transaction hash: ${approvalData.transactionHash}`);
    }

    // Create a new Pack of Cards

    const transactionPack = createNewPack({
      contract: contractPack,
      client,
      recipient: account.address,
      tokenOwner: account.address,
      packMetadata: {
        name: "Tradible Drop",
        image:
          "https://d391b93f5f62d9c15f67142e43841acc.ipfscdn.io/ipfs/QmVsefCnYWEcEm2v36ZLF6LWQ4as5BHpLbUbpM6671p1f7/10.jpg",
        description: "Tradible Drop contains 6 Pack",

      },

      openStartTimestamp: new Date(),

      erc721Rewards: [
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(4),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(5),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(6),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(7),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(8),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(9),
          quantityPerReward: 1,
          totalRewards: 1,
        }
      ],

      amountDistributedPerOpen: BigInt(1),
    });

    const dataPack = await sendAndConfirmTransaction({
      transaction: transactionPack,
      account,
    });

    console.log(dataPack)

    console.log(`Pack Transaction hash: ${dataPack.transactionHash}`);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

main();
