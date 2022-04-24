//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

library RandomGenerator {
    function random(string calldata seed) public view returns (uint) {
        return uint(keccak256(abi.encodePacked(seed, block.timestamp)));
    }
}
