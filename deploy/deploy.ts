import { ethers } from "hardhat";
import { Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";
dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the AdamFactory contract`);

  // init wallet
  const wallet = new Wallet(process.env.TEST_PRIVATE_KEY !== undefined ? process.env.TEST_PRIVATE_KEY : "");

  // new deployer
  const deployer = new Deployer(hre, wallet);

  // load AdamFactory contract
  const zksFactory = await deployer.loadArtifact("AdamFactory");

  // deployment parameters
  const senderAddress = wallet.address;
  const teamFeeRatio = 15;
  const bonusPoolFeeRatio = 25;

  // gas fee estimation
  const deploymentFactoryFee = await deployer.estimateDeployFee(zksFactory, [senderAddress, senderAddress, teamFeeRatio, bonusPoolFeeRatio]);
  const parsedFactoryFee = ethers.utils.formatEther(deploymentFactoryFee.toString());
  console.log(`The deploymentFactory is estimated to cost ${parsedFactoryFee} ETH`);

  // deploy contract
  const zksFactoryContract = await deployer.deploy(zksFactory, [senderAddress, senderAddress, teamFeeRatio, bonusPoolFeeRatio]);
  console.log("AdamFactory Contract constructor args:" + zksFactoryContract.interface.encodeDeploy([senderAddress, senderAddress, teamFeeRatio, bonusPoolFeeRatio]));
  console.log(`${zksFactory.contractName} was deployed to ${zksFactoryContract.address}`);
}

  // after the script finishes, update init code hash before deploy the router contract
/*
  // deploy WETH contract
  const weth = await deployer.loadArtifact("WZULU");

  // gas fee estimation for WETH contract
  const deploymentWETHFee = await deployer.estimateDeployFee(weth, []);
  const parsedWETHFee = ethers.utils.formatEther(deploymentWETHFee.toString());
  console.log(`The WZULU deployment is estimated to cost ${parsedWETHFee} ETH`);

  // deploy WETH contract
  const wethContract = await deployer.deploy(weth, []);
  console.log(`${weth.contractName} was deployed to ${wethContract.address}`);

*/
