//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Rando {
	function concat(string calldata a, string calldata b) public pure returns (string memory) {
		return string(abi.encodePacked(a, b));
	}

	function random(string calldata seed) public view returns (uint) {
		return uint(keccak256(abi.encodePacked(seed, block.timestamp)));
	}
}
