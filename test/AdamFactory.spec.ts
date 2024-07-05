import { expect } from 'chai'
import { Contract, BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { getOverrides, getPairAddress, isZkSync } from './shared/utilities'
import { factoryFixture, load } from './shared/fixtures'
import { AdamPair__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const TEST_ADDRESSES: [string, string] = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000',
]

describe('AdamFactory', () => {
  const provider = ethers.provider
  let wallet: SignerWithAddress
  let other: SignerWithAddress
  let factory: Contract
  beforeEach(async () => {
    ;({ wallet, other, factory } = await load(factoryFixture))
  })

  it('feeTo, feeToSetter, allPairsLength', async () => {
    // expect(await factory.feeTo()).to.eq(ethers.constants.AddressZero)
    expect(await factory.feeToSetter()).to.eq(wallet.address)
    expect(await factory.allPairsLength()).to.eq(0)
  })

  async function createPair(tokens: [string, string]) {
    const pairAddress = getPairAddress(factory.address, tokens, AdamPair__factory.bytecode)

    await expect(factory.createPair(...tokens, getOverrides()))
      .to.emit(factory, 'PairCreated')
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], pairAddress, BigNumber.from(1))

    await expect(factory.createPair(...tokens, getOverrides())).to.be.reverted // Adam: PAIR_EXISTS
    await expect(factory.createPair(...tokens.slice().reverse(), getOverrides())).to.be.reverted // Adam: PAIR_EXISTS
    expect(await factory.getPair(...tokens)).to.eq(pairAddress)
    expect(await factory.getPair(...tokens.slice().reverse())).to.eq(pairAddress)
    expect(await factory.allPairs(0)).to.eq(pairAddress)
    expect(await factory.allPairsLength()).to.eq(1)

    const pair = AdamPair__factory.connect(pairAddress, provider)
    expect(await pair.factory()).to.eq(factory.address)
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0])
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1])
  }

  it('createPair', async () => {
    await createPair(TEST_ADDRESSES)
  })

  it('createPair:reverse', async () => {
    await createPair(TEST_ADDRESSES.slice().reverse() as [string, string])
  })

  it('createPair:gas', async () => {
    const tx = await factory.createPair(...TEST_ADDRESSES, getOverrides())
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(isZkSync() ? 293204 : 2103716)
  })

  it('setFeeToSetter', async () => {
    if (isZkSync()) {
      await expect(factory.connect(other).setFeeToSetter(other.address, getOverrides())).to.be.reverted
    } else {
      await expect(factory.connect(other).setFeeToSetter(other.address, getOverrides())).to.be.revertedWith(
        'Adam: FORBIDDEN'
      )
    }
    const tx = await factory.setFeeToSetter(other.address, getOverrides())
    await tx.wait()
    expect(await factory.feeToSetter()).to.eq(other.address)
    if (isZkSync()) {
      await expect(factory.setFeeToSetter(wallet.address, getOverrides())).to.be.reverted
    } else {
      await expect(factory.setFeeToSetter(wallet.address, getOverrides())).to.be.revertedWith('Adam: FORBIDDEN')
    }
  })
})
