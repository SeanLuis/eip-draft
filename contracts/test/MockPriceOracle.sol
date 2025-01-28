// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MockPriceOracle is Ownable {
    mapping(address => uint256) private prices;
    
    constructor() Ownable(msg.sender) {}
    
    function setPrice(address token, uint256 price) external onlyOwner {
        prices[token] = price;
    }
    
    function getPrice(address token) external view returns (uint256) {
        return prices[token];
    }
}
