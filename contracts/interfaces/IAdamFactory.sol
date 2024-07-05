//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IAdamFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    
    function setFeeToSetter(address) external;

    function teamAddress() external view returns (address);
    function bonusPoolAddress() external view returns (address);
    function feeSwitch() external view returns (bool);
    function teamFeeRatio() external view returns (uint256);
    function bonusPoolFeeRatio() external view returns (uint256);

    function setTeamAddress(address _teamAddress) external;
    function setBonusPoolAddress(address _bonusPoolAddress) external;
    function setFeeSwitch(bool _feeSwitch) external;
    function setFeeRatios(uint256 _teamFeeRatio, uint256 _bonusPoolFeeRatio) external;

}
