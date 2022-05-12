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

	function validateDeposit(
		MatchInfo memory _matchInfo,
		DepositInfo memory _depositInfo,
		uint _slots,
		uint _timestamp,
		uint _depositAmount
	) internal pure {
		// match must be started
		require(_matchInfo.matchStatus == MatchStatus.Started, "match not started");

		// match is time-bound
		require(_timestamp <= _matchInfo.timeStarted + _matchInfo.duration, "too late");

		// verify slot limits
		require(_slots >= 1 && _slots <= _matchInfo.maxSlotsPerWallet, "slot limit exceeded");

		// verify deposit amount
		require(_depositAmount == _matchInfo.floorPrice * _slots, "incorrect deposit");

		// ensure only one entry per wallet
		require(!_depositInfo.deposited, "re-entry not allowed");
	}

	function validateEntry(MatchInfo memory _matchInfo, DepositInfo memory _depositInfo) internal pure {
		// match must be started
		require(_matchInfo.matchStatus == MatchStatus.Started, "match not started");

		// verify if deposit was called before entering
		require(_depositInfo.deposited, "deposit required");

		// deposit should equal floor price * slots
		require(_depositInfo.depositAmount == _depositInfo.slots * _matchInfo.floorPrice, "incorrect deposit");
	}
}
