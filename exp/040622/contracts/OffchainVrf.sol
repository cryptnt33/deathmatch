//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./OwnableExt.sol";
import "./IVrfConsumer.sol";

contract OffchainVrf is OwnableExt, IVrfConsumer {
	string[] private seeds;

	function appendSeeds(string[] memory newSeeds) external onlyOwner {
		for (uint i = 0; i < newSeeds.length; i++) {
			seeds.push(newSeeds[i]);
		}
	}

	function overwriteSeeds(string[] memory newSeeds) external onlyOwner {
		seeds = newSeeds;
	}

	function getSeed() external view returns (string memory) {
		require(seeds.length >= 1, "empty");
		return seeds[seeds.length - 1];
	}

	function popSeed() external {
		seeds.pop();
	}

	function getSeeds(uint limit) external view returns (string[] memory) {
		uint len = seeds.length;
		require(limit < len / 5, "too high");
		require(seeds.length - limit >= 1, "empty");
		string[] memory range = new string[](limit);
		for (uint i = 0; i < limit; i++) {
			range[i] = seeds[len - i - 1];
		}
		return range;
	}

	function popSeeds(uint limit) external {
		uint len = seeds.length;
		require(limit < len / 5, "too high");
		require(seeds.length - limit >= 1, "empty");
		for (uint i = 0; i < limit; i++) {
			seeds.pop();
		}
	}

	function getSeedsLength() external view returns (uint) {
		return seeds.length;
	}
}
