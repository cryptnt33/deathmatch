//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

library ArrayUtils {
	function compareStrings(string memory a, string memory b) internal pure returns (bool) {
		return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
	}

	function shuffleAddresses(address[] memory _players, uint _timestamp) internal pure {
		uint len = _players.length;
		for (uint256 i = 0; i < _players.length; i++) {
			uint256 n = i +
				(uint256(keccak256(abi.encodePacked(_timestamp))) % (_players.length - i));
			address temp = _players[n];
			_players[n] = _players[i];
			_players[i] = temp;
		}
		require(len == _players.length, "shuffle failed");
	}

	function exists(address[] memory list, address item) internal pure returns (bool) {
		for (uint i = 0; i < list.length; i++) {
			if (list[i] == item) return true;
		}
		return false;
	}
}
