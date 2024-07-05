# AdamSwap Core Contracts

## Init env

```shell
yarn
```

## Deploy to normal evm chain

```shell
yarn compile
yarn deploy
```

## Deploy to ZULU

```shell
yarn compile:zk --network=zulutestnet
yarn deploy:zk --network=zulutestnet
```

## Test with hardhat

```shell
yarn clean
# test one
yarn test test/AdamERC20.spec.ts
# test all
yarn test
```
