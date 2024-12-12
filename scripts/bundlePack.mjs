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
        "collection_name": "Slab Drops",
        "name": "drop#3",
        "description": "Tradible Huge Hits #3",
        "title": "1996 Topps Kobe Bryant Base 138",
        "sub_description": "Legendary Grails & More, 10% Chance of Rare or Higher",
        "image": "https://tradible-dev-media.s3.us-east-1.amazonaws.com/7368e4e7f83d1b7f502d704c9b821b68.png",
        "video": "https://tradible-dev-media.s3.us-east-1.amazonaws.com/LoopPreview.mp4",
        "external_url": "https://tradible.io/slab-drops/drop#3",
        "start_date": "",
        "end_date": "",
        "price": "50",
        "currency": "USD",
        "number_of_items": "100",
        "drop_contract_address": "",
        "status": "",
        "drop_details": "This premium drop is for those grail-hunting collectors looking to add some legendary heat to their collections. Buyback offers are activated for this drop. That means that every card from this drop will receive a 70% FMV offer shortly after reveal. Shortly after the drop, you can rip and reveal your pack to see what you got. To hodl, trade, or redeem from the vault. It's all on-chain to prove 100% fairness and randomness in distribution.",
        "assets": [
          {
            "token_id": "28",
            "type": "Legendary",
            "url": "https://tradible-dev-media.s3.us-east-1.amazonaws.com/image.png"
          },
          {
            "token_id": "29",
            "type": "Legendary",
            "url": "https://tradible-dev-media.s3.us-east-1.amazonaws.com/image.png"
          },
        ]
      },
      

      openStartTimestamp: new Date(),

      erc721Rewards: [
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(28),
          quantityPerReward: 1,
          totalRewards: 1,
        },
        {
          contractAddress: EDITION_CONTRACT_ADDRESS,
          tokenId: BigInt(29),
          quantityPerReward: 1,
          totalRewards: 1,
        },
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
