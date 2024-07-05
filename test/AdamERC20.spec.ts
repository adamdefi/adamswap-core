import { ethers } from 'hardhat'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { deployAdamERC20, expandTo18Decimals, getOverrides, getPermitSignature } from './shared/utilities'
import { AdamERC20 } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { splitSignature } from 'ethers/lib/utils'

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)

describe('AdamERC20', () => {
  let wallet: SignerWithAddress
  let other: SignerWithAddress
  let token: AdamERC20

  beforeEach(async () => {
    ;[wallet, other] = await ethers.getSigners()
    token = await deployAdamERC20(wallet, TOTAL_SUPPLY)
  })

  it('name, symbol, decimals, totalSupply, balanceOf, DOMAIN_SEPARATOR, PERMIT_TYPEHASH', async () => {
    const name = await token.name()
    expect(name).to.eq('Adamswap')
    expect(await token.symbol()).to.eq('Adam-V2')
    expect(await token.decimals()).to.eq(18)
    expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
    expect(await token.DOMAIN_SEPARATOR()).to.eq(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
          [
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes(
                'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
              )
            ),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1')),
            await wallet.getChainId(),
            token.address,
          ]
        )
      )
    )
    expect(await token.PERMIT_TYPEHASH()).to.eq(
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
      )
    )
  })

  it('approve', async () => {
    await expect(token.approve(other.address, TEST_AMOUNT, getOverrides()))
      .to.emit(token, 'Approval')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
  })

  it('transfer', async () => {
    await expect(token.transfer(other.address, TEST_AMOUNT, getOverrides()))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('transfer:fail', async () => {
    await expect(token.transfer(other.address, TOTAL_SUPPLY.add(1), getOverrides())).to.be.reverted // ds-math-sub-underflow
    await expect(token.connect(other).transfer(wallet.address, 1, getOverrides())).to.be.reverted // ds-math-sub-underflow
  })

  it('transferFrom', async () => {
    await token.approve(other.address, TEST_AMOUNT, getOverrides())
    await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT, getOverrides()))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(0)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('transferFrom:max', async () => {
    await token.approve(other.address, ethers.constants.MaxUint256, getOverrides())
    await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT, getOverrides()))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(ethers.constants.MaxUint256)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('permit', async () => {
    const nonce = await token.nonces(wallet.address)
    const deadline = ethers.constants.MaxUint256
    const signature = await getPermitSignature(
      wallet,
      token,
      {
        owner: wallet.address,
        spender: other.address,
        value: TEST_AMOUNT,
        nonce: nonce,
        deadline: deadline,
      },
      await wallet.getChainId()
    )
    const { v, r, s } = splitSignature(signature)

    await expect(
      token.permit(
        wallet.address,
        other.address,
        TEST_AMOUNT,
        deadline,
        v,
        ethers.utils.hexlify(r),
        ethers.utils.hexlify(s),
        getOverrides()
      )
    )
      .to.emit(token, 'Approval')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
    expect(await token.nonces(wallet.address)).to.eq(BigNumber.from(1))
  })
})
