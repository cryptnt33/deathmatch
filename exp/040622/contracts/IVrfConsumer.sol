//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

interface IVrfConsumer {
	function popSeed() external;

	function getSeed() external view returns (string memory);

	function popSeeds(uint limit) external;

	function getSeeds(uint limit) external view returns (string[] memory);
}
