import { task } from "hardhat/config";
import { Wallet } from "zksync-web3";

task("initWallet", "generate new account")
.setAction(async (_, hre) => {
  const wallet = hre.ethers.Wallet.createRandom();
  const address = wallet.address;
  const pkey = wallet.privateKey;
  console.log(`The wallet address is ${address}`);
  console.log(`The wallet pkey is ${pkey}`);
});

task("checkWallet", "check new account")
.setAction(async (_, hre) => {
  const wallet = new Wallet(process.env.ZKSYNC_PRIVATE_KEY !== undefined ? process.env.ZKSYNC_PRIVATE_KEY : "");
  const senderAddress = wallet.address;
  console.log(`Check the wallet address is ${senderAddress}`);
});

task("transfer", "transfer ETH to target address")
.addParam("to", "transfer to")
.addParam("num", "like 0.1")
.setAction(async (taskArgs, hre) => {
  const wallet = new Wallet(process.env.ZKSYNC_PRIVATE_KEY !== undefined ? process.env.ZKSYNC_PRIVATE_KEY : "");
  const senderAddress = wallet.address;
  const sender = await hre.ethers.getSigner(senderAddress);

  console.log(`senderAddressETH1 ${senderAddress}`);
  console.log(`toAddressETH1 ${taskArgs['to']}`);
  const senderAddressETH1 = await hre.ethers.provider.getBalance(senderAddress);
  const toAddressETH1 = await hre.ethers.provider.getBalance(taskArgs['to']);
  console.log(`senderAddressETH1 ${senderAddressETH1}`);
  console.log(`toAddressETH1 ${toAddressETH1}`);

  const tx = {
    to: taskArgs['to'],
    value: hre.ethers.utils.parseEther(taskArgs['num'])
  };
  const receipt = await sender.sendTransaction(tx);
  await receipt.wait();
  console.log(`Send ${taskArgs['num']} to ${taskArgs['to']} from ${senderAddress}`);

  const senderAddressETH2 = await hre.ethers.provider.getBalance(senderAddress);
  const toAddressETH2 = await hre.ethers.provider.getBalance(taskArgs['to']);
  console.log(`senderAddressETH2 ${senderAddressETH2}`);
  console.log(`toAddressETH2 ${toAddressETH2}`);
});