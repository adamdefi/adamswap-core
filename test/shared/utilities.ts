import { Contract, BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import * as zk from 'zksync-web3'
import { Deployer } from '@matterlabs/hardhat-zksync-deploy'
import { MockAdamERC20__factory, AdamERC20, AdamFactory, AdamFactory__factory } from '../../typechain-types'

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function getPairAddress(factoryAddress: string, [tokenA, tokenB]: [string, string], bytecode: string): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const salt = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'address'], [token0, token1]))
  if (isZkSync()) {
    const bytecodeHash = zk.utils.hashBytecode(bytecode)
    const inputHash = '0x'
    return zk.utils.create2Address(factoryAddress, bytecodeHash, salt, inputHash)
  } else {
    const bytecodeHash = ethers.utils.keccak256(bytecode)
    return ethers.utils.getCreate2Address(factoryAddress, salt, bytecodeHash)
  }
}

export async function getPermitSignature(
  wallet: SignerWithAddress,
  token: Contract,
  values: {
    owner: string
    spender: string
    value: BigNumber
    nonce: BigNumber
    deadline: BigNumber
  },
  chainId: number
): Promise<string> {
  // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
  const domain = {
    name: await token.name(),
    version: '1',
    chainId: chainId,
    verifyingContract: token.address,
  }
  // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
  const types = {
    Permit: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'spender' },
      { type: 'uint256', name: 'value' },
      { type: 'uint256', name: 'nonce' },
      { type: 'uint256', name: 'deadline' },
    ],
  }
  return await wallet._signTypedData(domain, types, values)
}

export async function setNextBlockTime(timestamp: number): Promise<void> {
  await time.setNextBlockTimestamp(timestamp)
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return [
    reserve1.mul(BigNumber.from(2).pow(112)).div(reserve0),
    reserve0.mul(BigNumber.from(2).pow(112)).div(reserve1),
  ]
}

export function isZkSync() {
  return network.config.zksync
}

export function loadDeployer() {
  const hre = require('hardhat')
  return new Deployer(hre, new zk.Wallet(hre.network.config.accounts[0]))
}

const DEFAULT_GAS_LIMIT = 10000000
const DEFAULT_ZK_GAS_LIMIT = 20000000
export function getOverrides() {
  return isZkSync() ? { gasLimit: DEFAULT_ZK_GAS_LIMIT } : { gasLimit: DEFAULT_GAS_LIMIT }
}

export async function deployAdamERC20(deployer: SignerWithAddress, totalSupply: BigNumber): Promise<AdamERC20> {
  if (isZkSync()) {
    const zkDeployer = await loadDeployer()
    const artifact = await zkDeployer.loadArtifact('MockAdamERC20')
    return (await zkDeployer.deploy(artifact, [totalSupply])) as AdamERC20
  } else {
    return await new MockAdamERC20__factory(deployer).deploy(totalSupply)
  }
}

export async function deployFactory(deployer: SignerWithAddress): Promise<AdamFactory> {
  if (isZkSync()) {
    const zkDeployer = loadDeployer()
    const artifact = await zkDeployer.loadArtifact('AdamFactory')
    return (await zkDeployer.deploy(artifact, [deployer.address])) as AdamFactory
  } else {
    return await new AdamFactory__factory(deployer).deploy(deployer.address, deployer.address, 15, 25)
  }
}
