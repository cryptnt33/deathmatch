//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract RandomGenerator {
    function random(string memory seed) public view returns (uint) {
        return uint(keccak256(abi.encodePacked(seed, block.timestamp)));
    }
}
