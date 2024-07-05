import { task } from "hardhat/config";
import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

task("deployWETH", "deploy weth").setAction(async (_, hre) => {
    // init wallet
    const wallet = new Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");
    // new deployer
    const deployer = new Deployer(hre, wallet);
    // load token contract
    const weth = await deployer.loadArtifact("WETH9");
    // gas fee
    const deploymentWETHFee = await deployer.estimateDeployFee(weth, []);
    const parsedWETHFee = hre.ethers.utils.formatEther(deploymentWETHFee.toString());
    console.log(`The deploymentWETH is estimated to cost ${parsedWETHFee} ETH`);
    // deploy contract
    const wethContract = await deployer.deploy(weth, []);
    console.log("wethContract constructor args:" + wethContract.interface.encodeDeploy([]));
    console.log(`weth was deployed to ${wethContract.address}`);
});

task("deployToken", "deploy ERC20 token").setAction(async (_, hre) => {
    // init wallet
    const wallet = new Wallet(process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? process.env.ZKSYNCTEST_PRIVATE_KEY : "");
    // new deployer
    const deployer = new Deployer(hre, wallet);
    // load token contract
    const token = await deployer.loadArtifact("Token");
    // gas fee
    const deploymentTokenFee = await deployer.estimateDeployFee(token, [`TOKN TOKEN`, `TOKN`]);
    const parsedTokenFee = hre.ethers.utils.formatEther(deploymentTokenFee.toString());
    console.log(`The deploymentToken is estimated to cost ${parsedTokenFee} ETH`);
    // deploy contract
    const tokenContract = await deployer.deploy(token, [`TOKN TOKEN`, `TOKN`]);
    console.log("tokenContract constructor args:" + tokenContract.interface.encodeDeploy([`TOKN TOKEN`, `TOKN`]));
    console.log(`token was deployed to ${tokenContract.address}`);
});

task("testToken", "test Token and WETH").setAction(async (_, hre) => {
    const weth = process.env.WETH == undefined ? "" : process.env.WETH;
    const token0 = process.env.TOKEN0 == undefined ? "" : process.env.TOKEN0;
    const wethContract = await hre.ethers.getContractAt("WETH9", weth);
    const tokenContract = await hre.ethers.getContractAt("Token", token0);
    const myAddress = process.env.MY_ADDRESS == undefined ? "" : process.env.MY_ADDRESS;
    const tip = { value: hre.ethers.utils.parseEther('0.001') };
  
    // info
    console.log("token totalSupply: ", await tokenContract.totalSupply());
    console.log("weth totalSupply: ", await wethContract.totalSupply());
    console.log("token balance: ", await tokenContract.balanceOf(myAddress));
    console.log("weth balance: ", await wethContract.balanceOf(myAddress));
  
    // deposit
    console.log("weth deposit start...");
    await wethContract.deposit(tip);
    console.log("weth deposit completed");
    console.log("weth balance after deposit: ", await wethContract.balanceOf(myAddress));
});

task("showTokens", "show some info").setAction(async (_, hre) => {
    const weth = process.env.WETH == undefined ? "" : process.env.WETH;
    const token0 = process.env.TOKEN0 == undefined ? "" : process.env.TOKEN0;
    const wethContract = await hre.ethers.getContractAt("WUSDC", weth);
    const tokenContract = await hre.ethers.getContractAt("Token", token0);
    const myAddress = process.env.MY_ADDRESS == undefined ? "" : process.env.MY_ADDRESS;
    console.log("token balance: ", await tokenContract.balanceOf(myAddress));
    console.log("weth balance: ", await wethContract.balanceOf(myAddress));
});

task("transferTokens", "show some info")
.addParam("to", "transfer to")
.addParam("amount", "amount")
.setAction(async (taskArgs, hre) => {
    const to = taskArgs["to"];
    const amount = taskArgs["amount"];
    const token0 = process.env.TOKEN0 == undefined ? "" : process.env.TOKEN0;
    const tokenContract = await hre.ethers.getContractAt("Token", token0);
    const myAddress = process.env.MY_ADDRESS == undefined ? "" : process.env.MY_ADDRESS;
    console.log("myAddress: ", myAddress);
    console.log("token balance: ", await tokenContract.balanceOf(myAddress));
    console.log("toAddress: ", to);
    console.log("token balance: ", await tokenContract.balanceOf(to));

    await tokenContract.transfer(to, amount);
    console.log("myAddress: ", myAddress);
    console.log("token balance: ", await tokenContract.balanceOf(myAddress));
    console.log("toAddress: ", to);
    console.log("token balance: ", await tokenContract.balanceOf(to));

    // const token0 = process.env.TOKEN0 == undefined ? "" : process.env.TOKEN0;
    // console.log("token balance: ", await tokenContract.balanceOf(myAddress));
});
