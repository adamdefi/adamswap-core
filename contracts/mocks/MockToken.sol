//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../AdamERC20.sol';

contract MockToken is AdamERC20 {
    constructor(uint _totalSupply) {
        _mint(msg.sender, _totalSupply);
    }
}