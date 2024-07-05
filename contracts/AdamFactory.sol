//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAdamFactory.sol";
import "./AdamPair.sol";

contract AdamFactory is IAdamFactory {
    // bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(type(AdamPair).creationCode);

    address public feeToSetter;

    address public teamAddress;
    address public bonusPoolAddress;

    bool public feeSwitch;

    uint256 public teamFeeRatio; // set team fee ratio
    uint256 public bonusPoolFeeRatio; // set bonus pool fee ratio

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    // event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(
        address _feeToSetter,
        address _teamAddress,
        uint256 _teamFeeRatio,
        uint256 _bonusPoolFeeRatio
    ) {
        require(
            _teamFeeRatio + _bonusPoolFeeRatio == 40,
            "Total fee ratio must be 40%"
        );

        feeToSetter = _feeToSetter;
        teamAddress = _teamAddress;
        feeSwitch = false; // default value
        teamFeeRatio = _teamFeeRatio;
        bonusPoolFeeRatio = _bonusPoolFeeRatio;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair) {
        require(tokenA != tokenB, "Adam: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "Adam: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Adam: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(AdamPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IAdamPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "Adam: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }

    function setTeamAddress(address _teamAddress) external {
        require(msg.sender == feeToSetter, "Adam: FORBIDDEN");
        teamAddress = _teamAddress;
    }

    function setBonusPoolAddress(address _bonusPoolAddress) external {
        require(msg.sender == feeToSetter, "Adam: FORBIDDEN");
        bonusPoolAddress = _bonusPoolAddress;
    }

    function setFeeSwitch(bool _feeSwitch) external {
        require(msg.sender == feeToSetter, "Adam: FORBIDDEN");
        feeSwitch = _feeSwitch;
    }

    function setFeeRatios(
        uint256 _teamFeeRatio,
        uint256 _bonusPoolFeeRatio
    ) external {
        require(msg.sender == feeToSetter, "Adam: FORBIDDEN");
        require(
            _teamFeeRatio + _bonusPoolFeeRatio == 40,
            "Total fee ratio must be 40%"
        );
        teamFeeRatio = _teamFeeRatio;
        bonusPoolFeeRatio = _bonusPoolFeeRatio;
    }
}
