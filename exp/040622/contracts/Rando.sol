//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

library Rando {
	function concat(string memory a, string memory b) internal pure returns (string memory) {
		return string(abi.encodePacked(a, b));
	}

	function random(string memory seed) internal view returns (uint) {
		return uint(keccak256(abi.encodePacked(seed, getTimestamp())));
	}

	function getTimestamp() internal view returns (uint) {
		return block.timestamp;
	}
}
