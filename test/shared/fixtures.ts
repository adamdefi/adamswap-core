import { Contract } from 'ethers'
import { deployFactory, deployAdamERC20, expandTo18Decimals, getOverrides, isZkSync } from './utilities'
import { AdamPair, AdamPair__factory } from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')

interface FactoryFixture {
  wallet: SignerWithAddress
  other: SignerWithAddress
  factory: Contract
}

export async function load(fixtureLoader: any) {
  if (isZkSync()) {
    return await fixtureLoader()
  } else {
    return await loadFixture(fixtureLoader)
  }
}

export async function factoryFixture(): Promise<FactoryFixture> {
  const [wallet, other] = await ethers.getSigners()
  const factory = await deployFactory(wallet)
  return { wallet, other, factory }
}

interface PairFixture extends FactoryFixture {
  token0: Contract
  token1: Contract
  pair: AdamPair
}

export async function pairFixture(): Promise<PairFixture> {
  const { wallet, other, factory } = await factoryFixture()
  const tokenA = await deployAdamERC20(wallet, expandTo18Decimals(10000))
  const tokenB = await deployAdamERC20(wallet, expandTo18Decimals(10000))

  await (await factory.createPair(tokenA.address, tokenB.address, getOverrides())).wait()
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = AdamPair__factory.connect(pairAddress, wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  return { factory, token0, token1, pair, wallet, other }
}
