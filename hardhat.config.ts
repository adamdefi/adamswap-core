import { HardhatUserConfig } from 'hardhat/config'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-verify';
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import './tasks/tokens'
import './tasks/factory'
import './tasks/init'
import * as dotenv from 'dotenv'
dotenv.config()

const settings = { optimizer: { enabled: true, runs: 200 } }

const config: HardhatUserConfig = {
  zksolc: {
    version: '1.3.10',
    compilerSource: 'binary',
    settings: {},
  },
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.18',
        settings,
      },
    ],
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    zulutestnet: {
      url: "https://rpc-testnet.zulunetwork.io",
      ethNetwork: "zulutestnet",
      accounts: process.env.ZKSYNCTEST_PRIVATE_KEY !== undefined ? [process.env.ZKSYNCTEST_PRIVATE_KEY] : [],
      zksync: true,
    },
  }
}

export default config
