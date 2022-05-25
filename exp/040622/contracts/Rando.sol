//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

library Rando {
	function random(string memory seed) internal view returns (uint) {
		return uint(keccak256(abi.encodePacked(seed, getTimestamp())));
	}

	function getTimestamp() internal view returns (uint) {
		return block.timestamp;
	}
}
