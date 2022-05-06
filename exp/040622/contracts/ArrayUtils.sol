//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract ArrayUtils {
	function shuffleAddresses(address[] memory _players) external view {
		uint len = _players.length;
		for (uint256 i = 0; i < _players.length; i++) {
			uint256 n = i + (uint256(keccak256(abi.encodePacked(block.timestamp))) % (_players.length - i));
			address temp = _players[n];
			_players[n] = _players[i];
			_players[i] = temp;
		}
		require(len == _players.length, "shuffle failed");
	}
}
