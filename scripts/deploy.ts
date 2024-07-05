import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const weth = await deployTokens();
    const factory1 = await deployUniswap();
    // after the script finnish, update init code hash before deploy the router contract
}

async function deployTokens() {
    console.log(`\n${"-".repeat(32) + deployTokens.name + "-".repeat(32)}`);
    const Token = await ethers.getContractFactory("Token");

    const [weth, tokn] = await Promise.all([
        (await (await ethers.getContractFactory('WUSDC')).deploy()).deployed(),
        (await Token.deploy(`TOKN TOKEN`, `TOKN`)).deployed()
    ])
    console.log(`${"WUSDC deployed to : ".padStart(28)}${weth.address}`);
    console.log(`${"TOKN deployed to : ".padStart(28)}${tokn.address}`);

    return weth;
}

async function deployUniswap() {
    console.log(`${"-".repeat(32) + deployUniswap.name + "-".repeat(32)}`);
    const factory = await (await (await ethers.getContractFactory('AdamFactory')).deploy((await ethers.getSigners())[0].address)).deployed();
    console.log(`${"Factory deployed to : ".padStart(28)}${factory.address}`);
    // console.log(`${"Pair init code is : ".padStart(28)}${await factory.INIT_CODE_PAIR_HASH()}`);
    return factory;
}

main().then(() => console.log(" ")).catch(console.error);
