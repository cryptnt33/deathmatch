//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

library MatchLib {
	enum MatchStatus {
		NotStarted,
		Started,
		Finished
	}

	struct MatchInfo {
		MatchStatus matchStatus;
		uint timeStarted;
		uint duration;
		uint floorPrice;
		uint maxSlotsPerWallet;
		address startedBy;
	}

	struct DepositInfo {
		uint depositAmount;
		uint slots;
		bool deposited;
	}

	function getPrizeAmount(
		string memory _gameId,
		mapping(string => mapping(address => uint)) storage _winnings,
		mapping(string => mapping(address => uint)) storage _claims,
		uint _balance,
		uint _poolAmount
	) internal returns (uint) {
		uint prizeAmount = _winnings[_gameId][msg.sender];
		require(prizeAmount > 0, "unauthorized");
		require(_claims[_gameId][msg.sender] == 0, "duplicate claim");
		_claims[_gameId][msg.sender] = prizeAmount;
		require(_poolAmount >= prizeAmount, "pool dry");
		require(_balance >= prizeAmount, "insufficient funds");
		return prizeAmount;
	}

	function getWinnerIndex(
		MatchInfo memory _matchInfo,
		uint _timestamp,
		uint _players,
		uint _largeNumber
	) internal pure returns (uint) {
		// the current match must be in progress
		require(_matchInfo.matchStatus == MatchStatus.Started, "match ended");
		require(_timestamp >= _matchInfo.timeStarted + _matchInfo.duration, "too early");
		require(_players > 0, "no players");
		uint index = _largeNumber % _players;
		require(index >= 0 && index < _players, "invalid index");
		return index;
	}
}
