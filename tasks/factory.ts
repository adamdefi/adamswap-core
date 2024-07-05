import { task } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

task("AdamFactory", "test AdamFactory")
  .setAction(async (_, hre) => {
    // Hardcoded addresses
    const factoryAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your factory contract address
    const wethAddress = "0x77e0a03DbE0517dfF2786F5bC3853CA876c6f85A"; // Replace with your WETH contract address
    const token0Address = "0x6338f16045919c3b4A644687584bA8b58D38a7d1"; // Replace with your Token0 contract address

    const factory = await hre.ethers.getContractAt("AdamFactory", factoryAddress);

    // Print initial information
    console.log("AdamFactory allPairsLength: ", (await factory.allPairsLength()).toString());
    console.log("AdamFactory feeToSetter: ", await factory.feeToSetter());
    //console.log("AdamFactory feeTo: ", await factory.feeTo());

    // Create a pair
    console.log("AdamFactory createPair start...");
    const tx = await factory.createPair(wethAddress, token0Address);
    await tx.wait();
    console.log("AdamFactory createPair completed");

    // Get and print the newly created pair address
    const pairAddress = await factory.getPair(wethAddress, token0Address);
    console.log("AdamFactory weth-token getPair: ", pairAddress);
    console.log("AdamFactory allPairsLength: ", (await factory.allPairsLength()).toString());
  });

  //npx hardhat setBonusPoolAddress --newaddress 0x9EB3AFD37CDb879CedE52147fD8101704FA83bF1 --network zulubeta
  task("setBonusPoolAddress", "Sets the bonus pool address")
  .addParam("newaddress", "The new bonus pool address")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to zulubeta network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Contract address
    const contractAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your actual contract address

    // Get contract instance using Hardhat
    const contract = await ethers.getContractAt("AdamFactory", contractAddress, connectedWallet);

    // Estimate Gas for the setBonusPoolAddress function
    try {
      const gasEstimate = await contract.estimateGas.setBonusPoolAddress(taskArgs.newaddress);
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const parsedGasCost = ethers.utils.formatEther(gasCost.toString());
      console.log(`The setBonusPoolAddress function is estimated to cost ${parsedGasCost} ETH`);
    } catch (error) {
      console.error("Error estimating gas: ", error);
      return;
    }

    // Call the setBonusPoolAddress function
    try {
      const tx = await contract.setBonusPoolAddress(taskArgs.newaddress);
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);
    } catch (error) {
      console.error("Error calling setBonusPoolAddress function:", error);
    }
  });


// npx hardhat setFeeSwitch --state true --network zulubeta  
task("setFeeSwitch", "Sets the fee switch")
  .addParam("state", "The state of the fee switch (true/false)")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to zulubeta network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Contract address
    const contractAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your actual contract address

    // Get contract instance using Hardhat
    const contract = await ethers.getContractAt("AdamFactory", contractAddress, connectedWallet);

    // Estimate Gas for the setFeeSwitch function
    try {
      const gasEstimate = await contract.estimateGas.setFeeSwitch(taskArgs.state === 'true');
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const parsedGasCost = ethers.utils.formatEther(gasCost.toString());
      console.log(`The setFeeSwitch function is estimated to cost ${parsedGasCost} ETH`);
    } catch (error) {
      console.error("Error estimating gas: ", error);
      return;
    }

    // Call the setFeeSwitch function
    try {
      const tx = await contract.setFeeSwitch(taskArgs.state === 'true');
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);
    } catch (error) {
      console.error("Error calling setFeeSwitch function:", error);
    }
  });

// npx hardhat setFeeRatios --teamfeeratio 15 --bonuspoolfeeratio 25 --network zulubeta 
task("setFeeRatios", "Sets the team fee ratio and bonus pool fee ratio")
  .addParam("teamfeeratio", "The team fee ratio")
  .addParam("bonuspoolfeeratio", "The bonus pool fee ratio")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    hre.config

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to zulubeta network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Contract address
    const contractAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your actual contract address

    // Get contract instance using Hardhat
    const contract = await ethers.getContractAt("AdamFactory", contractAddress, connectedWallet);

    // Estimate Gas for the setFeeRatios function
    try {
      const gasEstimate = await contract.estimateGas.setFeeRatios(
        ethers.BigNumber.from(taskArgs.teamfeeratio),
        ethers.BigNumber.from(taskArgs.bonuspoolfeeratio)
      );
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const parsedGasCost = ethers.utils.formatEther(gasCost.toString());
      console.log(`The setFeeRatios function is estimated to cost ${parsedGasCost} ETH`);
    } catch (error) {
      console.error("Error estimating gas: ", error);
      return;
    }

    // Call the setFeeRatios function
    try {
      const tx = await contract.setFeeRatios(
        ethers.BigNumber.from(taskArgs.teamfeeratio),
        ethers.BigNumber.from(taskArgs.bonuspoolfeeratio)
      );
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);
    } catch (error) {
      console.error("Error calling setFeeRatios function:", error);
    }
  });

  // npx hardhat printBasicInfo --network zulubeta
  task("printBasicInfo", "Prints the basic info from the contract")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to zulubeta network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Contract address
    const contractAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your actual contract address

    // Get contract instance using Hardhat
    const contract = await ethers.getContractAt("AdamFactory", contractAddress, connectedWallet);

    // Fetch and print basic info
    try {
      const teamAddress = await contract.teamAddress();
      const bonusPoolAddress = await contract.bonusPoolAddress();
      const feeSwitch = await contract.feeSwitch();
      const teamFeeRatio = await contract.teamFeeRatio();
      const bonusPoolFeeRatio = await contract.bonusPoolFeeRatio();

      console.log(`Team Address: ${teamAddress}`);
      console.log(`Bonus Pool Address: ${bonusPoolAddress}`);
      console.log(`Fee Switch: ${feeSwitch}`);
      console.log(`Team Fee Ratio: ${teamFeeRatio}`);
      console.log(`Bonus Pool Fee Ratio: ${bonusPoolFeeRatio}`);
    } catch (error) {
      console.error("Error fetching basic info: ", error);
    }
  });



  // npx hardhat printPairAddresses --network zulubeta
  task("printPairAddresses", "Prints the pair addresses for given trading pairs")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Contract address
    const contractAddress = "0xeD0371C731B16c421C27d2140b7Ba7d0077e7DfA"; // Replace with your actual contract address

    // Get contract instance using Hardhat
    const contract = await ethers.getContractAt("AdamFactory", contractAddress, connectedWallet);

    // Define the token addresses
    const usdz = "0x77e0a03DbE0517dfF2786F5bC3853CA876c6f85A";
    const doge = "0x64d2b47DBC4dAF6428726C2E0907FaC17EF4c62F";
    const wif = "0xefE164bc01c0cC53B883065D8C053D0311119e74";
    const shib = "0x0d05a3BB1f974364Ec1375a25584A0Ac001467F2";

    // Define the pairs with names and addresses
    const pairs = [
      { name0: "usdz", address0: usdz, name1: "shib", address1: shib },
      { name0: "usdz", address0: usdz, name1: "doge", address1: doge },
      { name0: "usdz", address0: usdz, name1: "wif", address1: wif },
    ];

    // Function to get and print pair addresses
    const getPairAddress = async (name0:string, address0:string, name1:string, address1:string) => {
      try {
        const pairAddress = await contract.getPair(address0, address1);
        console.log(`Pair address for ${name0} & ${name1}: ${pairAddress}`);
      } catch (error) {
        console.error(`Error fetching pair address for ${name0} & ${name1}:`, error);
      }
    };

    // Loop through the pairs and get their addresses
    for (const pair of pairs) {
      await getPairAddress(pair.name0, pair.address0, pair.name1, pair.address1);
    }
  });


  // npx hardhat printLpBalances --network zulubeta
  task("printLpBalances", "Prints the balances of specific LP tokens")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");

    // Connect to network using the provided RPC
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-testnet.zulunetwork.io");
    const connectedWallet = wallet.connect(provider);

    // Define the LP token addresses
    const lpTokens = [
      { name: "usdz & shib", address: "0x8BA4307cc850479e7b6afA38A52c6e9B8D253D15" },
      { name: "usdz & doge", address: "0x505a5070B62CDafAa4bd34c316151FC435981795" },
      { name: "usdz & wif", address: "0xb1ED6015F85Bc17e74E47A0DcceA922f15F3D0e2" },
    ];

    // Function to get and print LP token balances
    const getLpTokenBalance = async (name:string, address:string) => {
      try {
        const erc20 = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", address, connectedWallet);
        const balance = await erc20.balanceOf(wallet.address);
        console.log(`Balance of ${name}: ${ethers.utils.formatUnits(balance, 18)} LP tokens`);
      } catch (error) {
        console.error(`Error fetching balance for ${name}:`, error);
      }
    };

    // Loop through the LP tokens and get their balances
    for (const token of lpTokens) {
      await getLpTokenBalance(token.name, token.address);
    }
  });








  

export default {};
